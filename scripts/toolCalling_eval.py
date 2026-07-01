from __future__ import annotations
import argparse, json, logging, os, re, time
from datetime import datetime
from typing import Any, Optional, Tuple
import pandas as pd
import requests

CFG = {
    "ollama_url": "http://localhost:11434/api/chat",
    "models": ["qwen2.5:0.5b", "tinyllama:latest", "qwen2:1.5b", "llama3.2:3b", "phi3:latest"],
    "model_labels": {
        "qwen2.5:0.5b": "Qwen2.5 0.5B", "tinyllama:latest": "TinyLlama 1.1B",
        "qwen2:1.5b": "Qwen2 1.5B", "llama3.2:3b": "Llama3.2 3B", "phi3:latest": "Phi-3 3.8B",
    },
    "temperature": 0, "seed": 42, "timeout": 300, "retries": 2,
    "inter_request_sleep": 0.0,  # Ollama is serial; no sleep needed
    "output_dir": os.path.join("..", "results", "tool_calling"),
}

TOOLS = [
    {"type": "function",
     "function": {"name": "get_weather", "description": "Get the current weather for a specific location",
                  "parameters": {"type": "object",
                                 "properties": {"location": {"type": "string", "description": "City or location name"},
                                                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"],
                                                         "description": "Temperature unit"}},
                                 "required": ["location"]}}},
    {"type": "function",
     "function": {"name": "search_web", "description": "Search the web for information on a given topic",
                  "parameters": {"type": "object",
                                 "properties": {"query": {"type": "string", "description": "Search query string"},
                                                "max_results": {"type": "integer", "description": "Max results"}},
                                 "required": ["query"]}}},
    {"type": "function", "function": {"name": "calculate", "description": "Evaluate a mathematical expression",
                                      "parameters": {"type": "object", "properties": {
                                          "expression": {"type": "string", "description": "Mathematical expression"}},
                                                     "required": ["expression"]}}},
    {"type": "function",
     "function": {"name": "get_current_time", "description": "Get the current date and time in a specified timezone",
                  "parameters": {"type": "object",
                                 "properties": {"timezone": {"type": "string", "description": "IANA timezone"}},
                                 "required": ["timezone"]}}},
    {"type": "function",
     "function": {"name": "set_reminder", "description": "Create a reminder for a future date and time",
                  "parameters": {"type": "object",
                                 "properties": {"title": {"type": "string", "description": "Reminder title"},
                                                "datetime": {"type": "string", "description": "Date and time string"}},
                                 "required": ["title", "datetime"]}}},
    {"type": "function",
     "function": {"name": "convert_currency", "description": "Convert an amount from one currency to another",
                  "parameters": {"type": "object",
                                 "properties": {"amount": {"type": "number", "description": "Amount to convert"},
                                                "from_currency": {"type": "string",
                                                                  "description": "Source currency code"},
                                                "to_currency": {"type": "string",
                                                                "description": "Target currency code"}},
                                 "required": ["amount", "from_currency", "to_currency"]}}},
    {"type": "function", "function": {"name": "translate_text", "description": "Translate text into a target language",
                                      "parameters": {"type": "object", "properties": {
                                          "text": {"type": "string", "description": "Text to translate"},
                                          "target_language": {"type": "string", "description": "Target language"}},
                                                     "required": ["text", "target_language"]}}},
    {"type": "function",
     "function": {"name": "get_stock_price", "description": "Get the current stock price for a given ticker symbol",
                  "parameters": {"type": "object",
                                 "properties": {"symbol": {"type": "string", "description": "Stock ticker symbol"}},
                                 "required": ["symbol"]}}},
]

TEST_CASES = [
    # simple_call (10)
    {"id": 1, "category": "simple_call", "prompt": "What's the weather like in Paris right now?", "should_call": True,
     "expected_tool": "get_weather", "expected_params": {"location": "paris"}, "description": "Weather – Paris"},
    {"id": 2, "category": "simple_call", "prompt": "Calculate 145 multiplied by 23.", "should_call": True,
     "expected_tool": "calculate", "expected_params": {"expression": "145"},
     "description": "Calculate – multiplication"},
    {"id": 3, "category": "simple_call", "prompt": "What is the current time in Tokyo?", "should_call": True,
     "expected_tool": "get_current_time", "expected_params": {"timezone": "tokyo"}, "description": "Time – Tokyo"},
    {"id": 4, "category": "simple_call", "prompt": "Search the web for Python programming tutorials.",
     "should_call": True, "expected_tool": "search_web", "expected_params": {"query": "python"},
     "description": "Search – Python tutorials"},
    {"id": 5, "category": "simple_call", "prompt": "What's the weather in New York in Fahrenheit?", "should_call": True,
     "expected_tool": "get_weather", "expected_params": {"location": "new york", "unit": "fahrenheit"},
     "description": "Weather – New York + unit"},
    {"id": 6, "category": "simple_call", "prompt": "Translate 'Hello' into Spanish.", "should_call": True,
     "expected_tool": "translate_text", "expected_params": {"text": "hello", "target_language": "spanish"},
     "description": "Translate – Hello to Spanish"},
    {"id": 7, "category": "simple_call", "prompt": "Convert 100 US dollars to Euros.", "should_call": True,
     "expected_tool": "convert_currency",
     "expected_params": {"amount": 100, "from_currency": "usd", "to_currency": "eur"},
     "description": "Currency – USD→EUR"},
    {"id": 8, "category": "simple_call", "prompt": "What is Apple's current stock price?", "should_call": True,
     "expected_tool": "get_stock_price", "expected_params": {"symbol": "aapl"}, "description": "Stock – Apple (AAPL)"},
    {"id": 9, "category": "simple_call",
     "prompt": "Set a reminder called 'Doctor appointment' for 2024-09-15 at 10:00.", "should_call": True,
     "expected_tool": "set_reminder", "expected_params": {"title": "doctor"},
     "description": "Reminder – doctor appointment"},
    {"id": 10, "category": "simple_call", "prompt": "Find the latest news about artificial intelligence.",
     "should_call": True, "expected_tool": "search_web", "expected_params": {"query": "artificial intelligence"},
     "description": "Search – AI news"},
    # tool_selection (10)
    {"id": 11, "category": "tool_selection", "prompt": "Should I bring an umbrella in London today?",
     "should_call": True, "expected_tool": "get_weather", "expected_params": {"location": "london"},
     "description": "Select: weather vs search"},
    {"id": 12, "category": "tool_selection", "prompt": "How much is 500 British pounds in Japanese yen?",
     "should_call": True, "expected_tool": "convert_currency",
     "expected_params": {"amount": 500, "from_currency": "gbp", "to_currency": "jpy"},
     "description": "Select: currency vs calculate"},
    {"id": 13, "category": "tool_selection", "prompt": "What time is it in Los Angeles right now?", "should_call": True,
     "expected_tool": "get_current_time", "expected_params": {"timezone": "angeles"},
     "description": "Select: time vs search"},
    {"id": 14, "category": "tool_selection", "prompt": "What is 2 to the power of 10?", "should_call": True,
     "expected_tool": "calculate", "expected_params": {"expression": "2"},
     "description": "Select: calculate vs search"},
    {"id": 15, "category": "tool_selection", "prompt": "How do you say 'thank you' in Japanese?", "should_call": True,
     "expected_tool": "translate_text", "expected_params": {"text": "thank you", "target_language": "japanese"},
     "description": "Select: translate vs search"},
    {"id": 16, "category": "tool_selection", "prompt": "Is it currently raining in Sydney?", "should_call": True,
     "expected_tool": "get_weather", "expected_params": {"location": "sydney"},
     "description": "Select: weather (implicit)"},
    {"id": 17, "category": "tool_selection", "prompt": "I need to know Tesla's stock value right now.",
     "should_call": True, "expected_tool": "get_stock_price", "expected_params": {"symbol": "tsla"},
     "description": "Select: stock vs search"},
    {"id": 18, "category": "tool_selection", "prompt": "Remind me about my dentist appointment on August 20th at 9am.",
     "should_call": True, "expected_tool": "set_reminder", "expected_params": {"title": "dentist"},
     "description": "Select: reminder vs search"},
    {"id": 19, "category": "tool_selection", "prompt": "Search for recent academic papers on large language models.",
     "should_call": True, "expected_tool": "search_web", "expected_params": {"query": "large language models"},
     "description": "Select: search vs translate"},
    {"id": 20, "category": "tool_selection", "prompt": "Convert the phrase 'Good morning' into French for me.",
     "should_call": True, "expected_tool": "translate_text",
     "expected_params": {"text": "good morning", "target_language": "french"},
     "description": "Select: translate vs search"},
    # no_call (8)
    {"id": 21, "category": "no_call", "prompt": "What is the capital city of France?", "should_call": False,
     "expected_tool": None, "expected_params": None, "description": "No-call: factual knowledge"},
    {"id": 22, "category": "no_call", "prompt": "Write a short haiku about the ocean.", "should_call": False,
     "expected_tool": None, "expected_params": None, "description": "No-call: creative writing"},
    {"id": 23, "category": "no_call", "prompt": "Explain what machine learning is in simple terms.",
     "should_call": False, "expected_tool": None, "expected_params": None, "description": "No-call: explanation"},
    {"id": 24, "category": "no_call", "prompt": "What are three benefits of regular exercise?", "should_call": False,
     "expected_tool": None, "expected_params": None, "description": "No-call: general knowledge"},
    {"id": 25, "category": "no_call", "prompt": "Tell me a short joke.", "should_call": False, "expected_tool": None,
     "expected_params": None, "description": "No-call: casual conversation"},
    {"id": 31, "category": "no_call", "prompt": "How many continents are there on Earth?", "should_call": False,
     "expected_tool": None, "expected_params": None, "description": "No-call: basic geography"},
    {"id": 32, "category": "no_call", "prompt": "What does the word 'ephemeral' mean?", "should_call": False,
     "expected_tool": None, "expected_params": None, "description": "No-call: vocabulary definition"},
    {"id": 33, "category": "no_call", "prompt": "Give me a brief summary of how photosynthesis works.",
     "should_call": False, "expected_tool": None, "expected_params": None,
     "description": "No-call: science explanation"},
    # complex_params (5)
    {"id": 26, "category": "complex_params",
     "prompt": "I'm visiting Berlin next week and I'd like the temperature in Fahrenheit, please.", "should_call": True,
     "expected_tool": "get_weather", "expected_params": {"location": "berlin", "unit": "fahrenheit"},
     "description": "Complex: weather both params"},
    {"id": 27, "category": "complex_params",
     "prompt": "Can you please convert one thousand euros into British pounds for me?", "should_call": True,
     "expected_tool": "convert_currency",
     "expected_params": {"amount": 1000, "from_currency": "eur", "to_currency": "gbp"},
     "description": "Complex: currency written-out amount"},
    {"id": 28, "category": "complex_params",
     "prompt": "I need an alarm for my team standup meeting this Friday at half past two in the afternoon.",
     "should_call": True, "expected_tool": "set_reminder", "expected_params": {"title": "standup"},
     "description": "Complex: reminder ambiguous datetime"},
    {"id": 29, "category": "complex_params", "prompt": "What is the square root of 144 divided by 3?",
     "should_call": True, "expected_tool": "calculate", "expected_params": {"expression": "144"},
     "description": "Complex: calculate multi-step"},
    {"id": 30, "category": "complex_params",
     "prompt": "Translate the greeting 'Good morning, how are you?' into Mandarin Chinese.", "should_call": True,
     "expected_tool": "translate_text", "expected_params": {"text": "good morning", "target_language": "chinese"},
     "description": "Complex: translate dialect"},
]


def setup_logging(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    log_path = os.path.join(output_dir, "tool_calling_eval.log")
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", datefmt="%H:%M:%S")
    logger = logging.getLogger("tool_eval")
    logger.setLevel(logging.DEBUG)
    if not logger.handlers:
        fh = logging.FileHandler(log_path, encoding="utf-8")
        fh.setLevel(logging.DEBUG);
        fh.setFormatter(fmt);
        logger.addHandler(fh)
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO);
        ch.setFormatter(fmt);
        logger.addHandler(ch)
    return logger


log = logging.getLogger("tool_eval")


def query_model(model, prompt):
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "tools": TOOLS, "stream": False,
        "options": {"temperature": CFG["temperature"], "seed": CFG["seed"]}
    }
    for attempt in range(CFG["retries"] + 1):
        try:
            t0 = time.time()
            resp = requests.post(CFG["ollama_url"], json=payload, timeout=CFG["timeout"])
            latency_ms = round((time.time() - t0) * 1000, 1)
            resp.raise_for_status()
            data = resp.json()
            message = data.get("message", {})
            return {
                "raw_content": message.get("content", ""),
                "tool_calls": message.get("tool_calls", []),
                "latency_ms": latency_ms,
                "prompt_tokens": data.get("prompt_eval_count", 0),
                "completion_tokens": data.get("eval_count", 0),
                "total_tokens": data.get("prompt_eval_count", 0) + data.get("eval_count", 0),
                "error": None,
            }
        except requests.exceptions.HTTPError as exc:
            if exc.response is not None and exc.response.status_code == 400:
                try:
                    err_detail = exc.response.json().get("error", "unknown")
                except Exception:
                    err_detail = exc.response.text[:200]
                log.warning("    [FAIL FAST] 400 Bad Request: %s", err_detail)
                return {"raw_content": "", "tool_calls": [], "latency_ms": 0.0,
                        "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0,
                        "error": f"400 Bad Request: {err_detail}"}
            log.warning("    Attempt %d/%d failed: %s", attempt + 1, CFG["retries"] + 1, exc)
            if attempt < CFG["retries"]:
                time.sleep(2)

        except Exception as exc:
            log.warning("    Attempt %d/%d failed: %s", attempt + 1, CFG["retries"] + 1, exc)
            if attempt < CFG["retries"]:
                time.sleep(2)

    return {"raw_content": "", "tool_calls": [], "latency_ms": 0.0,
            "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0,
            "error": "Request failed after retries"}


def extract_tool_call_from_content(content):
    if not content:
        return None
    patterns = [r'```json\s*(.*?)\s*```', r'```\s*(\{.*?\})\s*```', r'(\{[^{}]*"name"[^{}]*\})']
    for pattern in patterns:
        for match in re.findall(pattern, content, re.DOTALL):
            try:
                obj = json.loads(match.strip())
                if "name" in obj and "arguments" in obj:
                    return obj
                if "function" in obj:
                    fn = obj["function"]
                    if "name" in fn:
                        return {"name": fn["name"], "arguments": fn.get("arguments", {})}
            except json.JSONDecodeError:
                pass
    return None


def parse_response(response):
    tool_calls = response.get("tool_calls", [])
    content = response.get("raw_content", "")
    if tool_calls:
        tc = tool_calls[0];
        func = tc.get("function", {})
        name = func.get("name", "");
        args = func.get("arguments", {})
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {}
        return {"called": bool(name), "tool_name": name or None, "arguments": args if isinstance(args, dict) else {},
                "format_valid": bool(name), "via_native_api": True}
    fallback = extract_tool_call_from_content(content)
    if fallback:
        name = fallback.get("name", "");
        args = fallback.get("arguments", {})
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {}
        return {"called": bool(name), "tool_name": name or None, "arguments": args if isinstance(args, dict) else {},
                "format_valid": bool(name), "via_native_api": False}
    return {"called": False, "tool_name": None, "arguments": {}, "format_valid": False, "via_native_api": False}


def match_value(actual, expected):
    if actual is None:
        return False
    if isinstance(expected, (int, float)):
        try:
            return abs(float(actual) - float(expected)) / (abs(float(expected)) + 1e-9) < 0.01
        except (ValueError, TypeError):
            return False
    # Bidirectional substring: handles "usd" in "USD" and "angeles" in "America/Los_Angeles"
    exp_s = str(expected).lower()
    act_s = str(actual).lower()
    return exp_s in act_s or act_s in exp_s


def match_params(actual_args, expected_params):
    if not expected_params:
        return True, 1.0
    matched = 0
    for key, exp_val in expected_params.items():
        act_val = actual_args.get(key)
        if act_val is None:
            for k, v in actual_args.items():
                if k.lower() == key.lower():
                    act_val = v;
                    break
        if match_value(act_val, exp_val):
            matched += 1
    score = matched / len(expected_params)
    return score == 1.0, round(score, 3)


def evaluate_case(model, case):
    response = query_model(model, case["prompt"])
    parsed = parse_response(response)
    tool_name = parsed["tool_name"];
    arguments = parsed["arguments"]
    called = parsed["called"];
    format_ok = parsed["format_valid"];
    via_native = parsed["via_native_api"]
    should_call = case["should_call"];
    expected_tool = case["expected_tool"];
    expected_params = case["expected_params"]

    correct_tool = False;
    params_correct = False;
    param_score = 0.0;
    overall_correct = False

    if should_call:
        correct_tool = (tool_name == expected_tool)
        if correct_tool:
            params_correct, param_score = match_params(arguments, expected_params)
        overall_correct = correct_tool and params_correct
    else:
        # No-call: set tool/param scores to None so pandas skips them in mean()
        overall_correct = not called
        correct_tool = None
        params_correct = None
        param_score = None

    label = CFG["model_labels"].get(model, model)
    status = "✓" if overall_correct else "✗"
    log.debug("  [%s] Case %2d | %-22s | tool=%-26s | %s", label, case["id"], case["description"], str(tool_name),
              status)

    return {
        "model": model, "model_label": label, "case_id": case["id"],
        "category": case["category"], "description": case["description"],
        "prompt": case["prompt"], "should_call": should_call,
        "expected_tool": expected_tool or "", "expected_params": json.dumps(expected_params) if expected_params else "",
        "format_valid": format_ok, "via_native_api": via_native, "called": called,
        "tool_called": tool_name or "", "args_returned": json.dumps(arguments) if arguments else "",
        "correct_tool": correct_tool, "param_score": param_score,
        "params_correct": params_correct, "overall_correct": overall_correct,
        "latency_ms": response["latency_ms"],
        "prompt_tokens": response.get("prompt_tokens", 0),
        "completion_tokens": response.get("completion_tokens", 0),
        "total_tokens": response.get("total_tokens", 0),
        "api_error": response.get("error") or "",
        "timestamp": datetime.now().isoformat(),
    }


def evaluate_model(model):
    label = CFG["model_labels"].get(model, model)
    log.info("");
    log.info("─── Evaluating: %s  (%d cases) ───", label, len(TEST_CASES))
    # Warm-up: one silent request to ensure model is loaded before evaluation.
    # Cold-start latency (model loading) can take 5–20 s for larger models and
    # would distort Case 1 if not discarded.
    log.info("  [Warmup] %s ...", label)
    query_model(model, "Hello")
    results = []
    for i, case in enumerate(TEST_CASES):
        log.info("  [%2d/%d] %s", i + 1, len(TEST_CASES), case["description"])
        row = evaluate_case(model, case)
        results.append(row)
        time.sleep(CFG["inter_request_sleep"])
    correct = sum(r["overall_correct"] for r in results)
    log.info("  → %s: %d / %d correct  (%.0f%%)", label, correct, len(results), 100 * correct / len(results))
    return results


def compute_summary(df):
    rows = []
    for model in CFG["models"]:
        label = CFG["model_labels"].get(model, model)
        sub = df[df["model"] == model]
        if sub.empty:
            continue
        call_cases = sub[sub["should_call"] == True]
        nocall_cases = sub[sub["should_call"] == False]

        def safe_mean(series):
            return round(float(series.mean()), 3) if not series.empty else 0.0

        rows.append({
            "model": label, "total_cases": len(sub),
            "overall_accuracy": safe_mean(sub["overall_correct"]),
            "format_validity_rate": safe_mean(sub["format_valid"]),
            "native_api_rate": safe_mean(sub["via_native_api"]),
            "n_tool_call_cases": len(call_cases),
            "tool_selection_acc": safe_mean(call_cases["correct_tool"]),
            "param_accuracy": safe_mean(call_cases["params_correct"]),
            "param_partial_score": safe_mean(call_cases["param_score"]),
            "n_no_call_cases": len(nocall_cases),
            "no_call_accuracy": safe_mean(nocall_cases["overall_correct"]),
            "simple_call_acc": safe_mean(sub[sub["category"] == "simple_call"]["overall_correct"]),
            "tool_selection_cat_acc": safe_mean(sub[sub["category"] == "tool_selection"]["overall_correct"]),
            "complex_params_acc": safe_mean(sub[sub["category"] == "complex_params"]["overall_correct"]),
            "mean_latency_ms": round(float(sub["latency_ms"].mean()), 1),
        })
    return pd.DataFrame(rows)


def print_test_cases():
    print(f"\n{'─' * 70}")
    print(f"{'ID':>3}  {'Category':<18} {'Should':<7} {'Tool':<22} Description")
    print(f"{'─' * 70}")
    for c in TEST_CASES:
        tool = c["expected_tool"] or "—"
        print(
            f"{c['id']:>3}  {c['category']:<18} {'YES' if c['should_call'] else 'NO':<7} {tool:<22} {c['description']}")
    print(f"{'─' * 70}")
    print(f"Total: {len(TEST_CASES)} cases\n")


def print_summary_table(summary):
    headers = ["Model", "Overall", "Tool Sel.", "Params", "No-call", "Format OK"]
    widths = [20, 9, 10, 8, 9, 10]
    print("\n" + "═" * 72)
    print("TOOL-CALLING EVALUATION RESULTS")
    print("═" * 72)
    print("  ".join(f"{h:<{w}}" for h, w in zip(headers, widths)))
    print("─" * 72)
    for _, row in summary.iterrows():
        vals = [str(row["model"]), f"{row['overall_accuracy']:.1%}", f"{row['tool_selection_acc']:.1%}",
                f"{row['param_accuracy']:.1%}", f"{row['no_call_accuracy']:.1%}", f"{row['format_validity_rate']:.1%}"]
        print("  ".join(f"{v:<{w}}" for v, w in zip(vals, widths)))
    print("═" * 72 + "\n")


def parse_args():
    p = argparse.ArgumentParser(description="Tool-Calling Capability Evaluation for SLMs via Ollama")
    p.add_argument("--model", type=str, default=None)
    p.add_argument("--cases", action="store_true")
    return p.parse_args()


def main():
    args = parse_args()
    if args.cases:
        print_test_cases();
        return
    os.makedirs(CFG["output_dir"], exist_ok=True)
    setup_logging(CFG["output_dir"])
    log.info("=" * 60)
    log.info("Tool-Calling Capability Evaluation — LDWS")
    log.info("Models : %s", [CFG["model_labels"].get(m, m) for m in CFG["models"]])
    log.info("Cases  : %d", len(TEST_CASES))
    log.info("Output : %s", CFG["output_dir"])
    log.info("=" * 60)
    models = [args.model] if args.model else CFG["models"]
    all_results = []
    for model in models:
        results = evaluate_model(model)
        all_results.extend(results)
    df = pd.DataFrame(all_results)
    results_path = os.path.join(CFG["output_dir"], "tool_calling_results.csv")
    df.to_csv(results_path, index=False)
    log.info("\nPer-case results  → %s", results_path)
    summary = compute_summary(df)
    summary_path = os.path.join(CFG["output_dir"], "tool_calling_summary.csv")
    summary.to_csv(summary_path, index=False)
    log.info("Summary           → %s", summary_path)
    print_summary_table(summary)


if __name__ == "__main__":
    main()
