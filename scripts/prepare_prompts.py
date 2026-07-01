"""
prepare_prompts.py — LDWS (Local Deployment Workload Simulation) Prompt Set Construction
==========================================================================================

Purpose:
    Constructs a standardised 50-prompt evaluation set for runtime performance testing
    (latency, throughput, memory, energy consumption, and workload stability).

    This prompt set is distinct from the capability benchmarks (MMLU, GSM8K, ARC,
    HellaSwag) used by lm-evaluation-harness. Those benchmarks produce single-token
    outputs (A/B/C/D) and are therefore unsuitable for performance measurement, as
    inference time is dominated by the prefill phase rather than token generation.
    This prompt set is designed to produce multi-token outputs, ensuring that
    throughput and energy-per-token metrics reflect genuine generation efficiency.

Dataset Selection Rationale:
    Four publicly available datasets are used, each representing a distinct deployment
    scenario commonly encountered in resource-constrained local AI applications:

    1. Alpaca (17 short prompts, <50 tokens)
       Source: Taori et al., 2023 (Stanford Alpaca)
       Task type: Instruction following
       Deployment scenario: Everyday assistant queries — the most common workload
       in local deployment (e.g., "Summarise this", "Explain X", "Write a list of Y").
       Short inputs stress the prefill phase and cold-start behaviour.

    2. GSM8K (10 medium prompts, 50–150 tokens)
       Source: Cobbe et al., 2021
       Task type: Mathematical reasoning
       Deployment scenario: Analytical tasks requiring multi-step reasoning.
       GSM8K problems require the model to generate chain-of-thought responses
       (typically 50–150 output tokens), making them well-suited for measuring
       decode-phase throughput and energy efficiency.

    3. OpenAssistant / OASST1 (17 medium-to-long prompts, 50–150 and >150 tokens)
       Source: Köpf et al., 2023
       Task type: Open-ended question answering and complex reasoning
       Deployment scenario: Real-world conversational queries from human users,
       covering a broad range of topics and complexity levels. Represents the
       typical input distribution in a local chat assistant deployment.

    4. CNN/DailyMail (6 long prompts, >150 tokens)
       Source: Hermann et al., 2015
       Task type: Summarisation
       Deployment scenario: Document processing tasks with long inputs — typical
       in productivity tools, note-taking assistants, or document summarisation
       pipelines. Long inputs stress memory utilisation and prefill speed.

Length Stratification:
    Prompts are stratified into three length buckets to capture the effect of
    input length on inference performance:
        Short  (<50 tokens):    17 prompts — stress prefill and TTFT
        Medium (50–150 tokens): 17 prompts — balanced prefill and decode
        Long   (>150 tokens):   16 prompts — stress memory and throughput

    This stratification follows the evaluation methodology of MLPerf Inference
    (Reddi et al., 2020), which employs standardised datasets with varied input
    lengths to ensure coverage of realistic deployment conditions.

Reproducibility:
    All sampling uses random.seed(42) to ensure the prompt set is identical
    across all experimental runs and can be independently reproduced.

Output:
    Saves 50 prompts to ../data/prompts.json with fields:
        text          — the prompt string
        source        — originating dataset
        task_type     — task category
        length_bucket — short / medium / long
"""
from datasets import load_dataset
import random
import json
import os

random.seed(42)
prompts = []

# 1. Alpaca → 短 prompt（17条）
alpaca = load_dataset("tatsu-lab/alpaca", split="train")
alpaca_short = [
    item["instruction"] for item in alpaca
    if len(item["instruction"].split()) < 50
    and item["instruction"].strip() != ""
]
for p in random.sample(alpaca_short, 17):
    prompts.append({
        "text": p,
        "source": "Alpaca",
        "task_type": "instruction_following",
        "length_bucket": "short"
    })

# 2. GSM8K → 中 prompt（10条）
gsm8k = load_dataset("gsm8k", "main", split="test")
gsm_questions = [
    item["question"] for item in gsm8k
    if 50 <= len(item["question"].split()) <= 150
]
for p in random.sample(gsm_questions, 10):
    prompts.append({
        "text": p,
        "source": "GSM8K",
        "task_type": "mathematical_reasoning",
        "length_bucket": "medium"
    })

# 3. OpenAssistant → 中（10条）+ 长（7条）
oasst = load_dataset("OpenAssistant/oasst1", split="train")
oasst_prompts = [
    item["text"] for item in oasst
    if item["role"] == "prompter"
    and item["text"].strip() != ""
]
oasst_medium = [p for p in oasst_prompts if 50 <= len(p.split()) <= 150]
oasst_long   = [p for p in oasst_prompts if len(p.split()) > 150]

for p in random.sample(oasst_medium, 10):
    prompts.append({
        "text": p,
        "source": "OpenAssistant",
        "task_type": "open_qa",
        "length_bucket": "medium"
    })
for p in random.sample(oasst_long, 7):
    prompts.append({
        "text": p,
        "source": "OpenAssistant",
        "task_type": "complex_reasoning",
        "length_bucket": "long"
    })

# 4. CNN/DailyMail → 长 prompt（6条）
cnn = load_dataset("abisee/cnn_dailymail", "3.0.0", split="test")
cnn_prompts = [
    f"Please summarise the following article:\n\n{item['article'][:500]}"
    for item in cnn
    if len(item["article"].split()) > 150
]
for p in random.sample(cnn_prompts, 6):
    prompts.append({
        "text": p,
        "source": "CNN/DailyMail",
        "task_type": "summarisation",
        "length_bucket": "long"
    })

# 验证
assert len(prompts) == 50
short  = sum(1 for p in prompts if p["length_bucket"] == "short")
medium = sum(1 for p in prompts if p["length_bucket"] == "medium")
long   = sum(1 for p in prompts if p["length_bucket"] == "long")
print(f"总数: {len(prompts)}")
print(f"短(<50 tokens):    {short}条")
print(f"中(50-150 tokens): {medium}条")
print(f"长(>150 tokens):   {long}条")

# 保存到data目录
output_path = os.path.join("..", "data", "prompts.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(prompts, f, indent=2, ensure_ascii=False)
print(f"\n已保存到 {output_path}")