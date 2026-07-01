// SLM Progress Update PPT Generator
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
 
pres.layout = "LAYOUT_16x9";
pres.title = "SLM Evaluation — Progress Update";
pres.author = "Runnan Feng";
 
// ═══════════════════════════════════════════════
// WARM COLOUR PALETTE
// ═══════════════════════════════════════════════
const C = {
  terracotta:  "B85042",   // primary dark accent
  rust:        "C0392B",   // strong accent
  sand:        "E8DCC8",   // light background panels
  cream:       "F7F3EE",   // slide backgrounds (light)
  darkBg:      "2C1810",   // dark slide background
  darkPanel:   "3D2315",   // dark panel
  warmGray:    "5C4A3A",   // body text on light
  lightText:   "F7F3EE",   // text on dark backgrounds
  mutedText:   "8C7B6B",   // captions / secondary
  amber:       "D4813A",   // highlight accent
  paleAmber:   "F0C080",   // light amber for badges
  white:       "FFFFFF",
  tableHdr:    "B85042",
  tableRow1:   "F7F3EE",
  tableRow2:   "EDE4D6",
  green:       "2E7D32",
  orange:      "E65100",
};
 
const FONT  = "Cambria";
const BODY  = "Calibri";
 
// ── helpers ──────────────────────────────────────
function slideTitle(slide, text) {
  slide.addText(text, {
    x: 0.45, y: 0.18, w: 9.1, h: 0.62,
    fontFace: FONT, fontSize: 30, bold: true,
    color: C.terracotta, align: "left", valign: "middle",
    margin: 0,
  });
  // subtle rule under title
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 0.82, w: 9.1, h: 0.025,
    fill: { color: C.amber },
    line: { color: C.amber },
  });
}
 
function smallTitle(slide, text) {
  slide.addText(text, {
    x: 0.45, y: 0.18, w: 9.1, h: 0.62,
    fontFace: FONT, fontSize: 24, bold: true,
    color: C.terracotta, align: "left", valign: "middle",
    margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 0.82, w: 9.1, h: 0.025,
    fill: { color: C.amber },
    line: { color: C.amber },
  });
}
 
function darkSlideTitle(slide, text) {
  slide.addText(text, {
    x: 0.45, y: 0.18, w: 9.1, h: 0.62,
    fontFace: FONT, fontSize: 30, bold: true,
    color: C.paleAmber, align: "left", valign: "middle",
    margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 0.82, w: 9.1, h: 0.025,
    fill: { color: C.amber },
    line: { color: C.amber },
  });
}
 
function card(slide, x, y, w, h, color) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: color || C.sand },
    line: { color: C.amber, width: 0.5 },
    rectRadius: 0.08,
    shadow: { type: "outer", color: "000000", blur: 5, offset: 2, angle: 45, opacity: 0.10 },
  });
}
 
function badge(slide, x, y, w, text, bgColor, textColor) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h: 0.32,
    fill: { color: bgColor || C.terracotta },
    line: { color: bgColor || C.terracotta },
    rectRadius: 0.06,
  });
  slide.addText(text, {
    x, y, w, h: 0.32,
    fontFace: BODY, fontSize: 10, bold: true,
    color: textColor || C.white,
    align: "center", valign: "middle", margin: 0,
  });
}
 
function bullets(slide, items, x, y, w, h, opts) {
  const o = opts || {};
  slide.addText(
    items.map((t, i) => ({
      text: t,
      options: {
        bullet: true,
        breakLine: i < items.length - 1,
        paraSpaceAfter: o.spaceAfter !== undefined ? o.spaceAfter : 4,
      },
    })),
    {
      x, y, w, h,
      fontFace: o.font || BODY,
      fontSize: o.size || 14,
      color: o.color || C.warmGray,
      valign: "top",
    }
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 1 — TITLE SLIDE (dark)
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };
 
  // decorative warm circle
  s.addShape(pres.shapes.OVAL, {
    x: 7.2, y: -0.8, w: 4.2, h: 4.2,
    fill: { color: C.terracotta, transparency: 75 },
    line: { color: C.terracotta, transparency: 75 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: -1.0, y: 3.5, w: 3.0, h: 3.0,
    fill: { color: C.amber, transparency: 82 },
    line: { color: C.amber, transparency: 82 },
  });
 
  s.addText("SLM Evaluation", {
    x: 0.6, y: 1.0, w: 8.5, h: 0.85,
    fontFace: FONT, fontSize: 44, bold: true,
    color: C.lightText, align: "left",
  });
  s.addText("Progress Update — Methodology & Initial Results", {
    x: 0.6, y: 1.85, w: 8.5, h: 0.55,
    fontFace: FONT, fontSize: 22, bold: false,
    color: C.paleAmber, align: "left",
  });
 
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.55, w: 3.5, h: 0.03,
    fill: { color: C.amber }, line: { color: C.amber },
  });
 
  s.addText([
    { text: "Runnan Feng  ·  MSc Computer Science", options: { breakLine: true } },
    { text: "Supervisor: Dr Tomasz Szydlo  ·  Newcastle University", options: { breakLine: true } },
    { text: "June 2026", options: {} },
  ], {
    x: 0.6, y: 2.75, w: 8.5, h: 1.2,
    fontFace: BODY, fontSize: 14, color: C.mutedText, align: "left",
  });
 
  s.addText("Project: Evaluating Small Language Models for Resource-Constrained Local Deployment", {
    x: 0.6, y: 4.5, w: 8.8, h: 0.5,
    fontFace: BODY, fontSize: 12, italic: true,
    color: C.sand, align: "left",
  });
 
  s.addNotes(
    "Good morning, Dr Szydlo. Thank you for your time today. " +
    "My name is Runnan Feng, and this is a progress update on my MSc project. " +
    "The project focuses on evaluating small language models for local deployment — " +
    "covering capability, performance, and resource efficiency. " +
    "Today I want to walk you through what has changed since our last meeting, " +
    "why I made those changes, and where the project stands right now."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 2 — WHAT CHANGED (6 changes)
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  slideTitle(s, "What Changed Since Last Meeting — Six Updates");
 
  const changes = [
    ["1", "Dual-Track Evaluation", "Single script → Capability track (lm-eval) + Performance track (custom script)"],
    ["2", "Accuracy Tool", "Hand-written parser → lm-evaluation-harness (EleutherAI open-source standard)"],
    ["3", "Performance Dataset", "Used same benchmarks for accuracy & performance → Custom LDWS prompt set for performance"],
    ["4", "Energy Measurement", "Manual TDP formula (CPU% × TDP × Δt) → CodeCarbon library with academic citation"],
    ["5", "Tool Calling Added", "No tool-calling eval → BFCL benchmark added as Capability sub-dimension"],
    ["6", "Quantisation Removed", "Planned FP16 vs INT8 comparison → Removed; focus on multi-model multi-scenario depth"],
  ];
 
  const colW = [0.38, 1.85, 6.8];
  const startX = 0.45;
  const startY = 1.0;
  const rowH = 0.62;
 
  changes.forEach(([num, title, desc], i) => {
    const y = startY + i * (rowH + 0.06);
    const bg = i % 2 === 0 ? C.sand : C.tableRow2;
 
    card(s, startX, y, 9.1, rowH, bg);
 
    // number badge
    badge(s, startX + 0.05, y + (rowH - 0.32) / 2, 0.30, num, C.terracotta, C.white);
 
    s.addText(title, {
      x: startX + 0.42, y, w: colW[1], h: rowH,
      fontFace: BODY, fontSize: 12, bold: true,
      color: C.terracotta, valign: "middle", margin: 0,
    });
    s.addText(desc, {
      x: startX + 0.42 + colW[1] + 0.05, y, w: colW[2] - 0.05, h: rowH,
      fontFace: BODY, fontSize: 11.5,
      color: C.warmGray, valign: "middle", margin: 0,
    });
  });
 
  s.addNotes(
    "Since our last meeting, I have made six changes to the evaluation design. " +
    "The most important one is splitting the evaluation into two tracks — capability and performance — because I discovered that using standard benchmarks like MMLU for performance measurement gives meaningless results. " +
    "I also replaced my hand-written accuracy parser with the lm-evaluation-harness tool, switched energy measurement to CodeCarbon, added tool-calling evaluation, and removed the quantisation experiment to keep the scope manageable. " +
    "I will explain the reasoning behind each of these decisions on the next few slides."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 3 — WHY DUAL-TRACK + WHY CODECARBON
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  slideTitle(s, "Why These Changes? — Core Reasoning");
 
  // LEFT panel
  card(s, 0.35, 1.0, 4.7, 4.2, C.sand);
  s.addText("Why Dual-Track + LDWS Dataset?", {
    x: 0.5, y: 1.05, w: 4.4, h: 0.38,
    fontFace: BODY, fontSize: 13, bold: true, color: C.terracotta,
  });
  s.addText("Root Problem: MMLU/ARC/HellaSwag output only 1 token (A/B/C/D)", {
    x: 0.5, y: 1.45, w: 4.35, h: 0.5,
    fontFace: BODY, fontSize: 11.5, bold: true, color: C.rust,
  });
  bullets(s, [
    "TTFT (prefill) dominates: ~98% of total latency",
    "Generation phase: only ~2% of total latency",
    "Throughput ≈ 2 tok/s for ALL models — indistinguishable",
    "Energy/token overwhelmed by background noise",
    "→ Performance data is statistically meaningless",
  ], 0.5, 1.95, 4.35, 2.1, { size: 11, spaceAfter: 5 });
 
  s.addText("✓  Capability → lm-evaluation-harness  |  Performance → LDWS (50 multi-token prompts)", {
    x: 0.5, y: 4.05, w: 4.35, h: 0.5,
    fontFace: BODY, fontSize: 10.5, bold: true,
    color: C.green, italic: true,
  });
 
  // RIGHT panel
  card(s, 5.25, 1.0, 4.5, 4.2, C.sand);
  s.addText("Why CodeCarbon + Why lm-eval?", {
    x: 5.4, y: 1.05, w: 4.2, h: 0.38,
    fontFace: BODY, fontSize: 13, bold: true, color: C.terracotta,
  });
  s.addText("CodeCarbon replaces manual TDP formula:", {
    x: 5.4, y: 1.45, w: 4.2, h: 0.3,
    fontFace: BODY, fontSize: 11.5, bold: true, color: C.rust,
  });
  bullets(s, [
    "Both use identical calculation on Windows (TDP-based)",
    "Manual formula has no academic citation",
    '"Measured using CodeCarbon (Lottick et al., 2019)"',
    "→ One sentence, peer-reviewed backing, no reviewer questions",
  ], 5.4, 1.8, 4.2, 1.55, { size: 11, spaceAfter: 5 });
 
  s.addText("lm-evaluation-harness replaces hand-written parser:", {
    x: 5.4, y: 3.38, w: 4.2, h: 0.3,
    fontFace: BODY, fontSize: 11.5, bold: true, color: C.rust,
  });
  bullets(s, [
    "Same evaluation logic as GPT-4 / LLaMA papers",
    "Results directly comparable with published literature",
    "Eliminates any concern about custom parsing accuracy",
  ], 5.4, 3.72, 4.2, 1.1, { size: 11, spaceAfter: 5 });
 
  s.addNotes(
    "The key insight behind most of these changes is this: standard accuracy benchmarks produce single-token outputs, which makes them completely unsuitable for performance measurement. " +
    "The prefill phase — just reading the prompt — takes up 98% of the total time, so all models look the same. " +
    "That is why I created the LDWS dataset with prompts that produce 50 to 200 output tokens. " +
    "For CodeCarbon, the calculation is actually identical to my old TDP formula on Windows — but CodeCarbon has a published paper I can cite, which is academically much stronger. " +
    "And lm-evaluation-harness gives me results that are directly comparable to GPT-4 benchmark scores in published papers."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 4 — LDWS DATASET DESIGN
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  slideTitle(s, "LDWS — Custom Performance Dataset Design");
 
  // Why not a single dataset
  card(s, 0.35, 1.0, 9.3, 1.05, C.sand);
  s.addText("Why not use a single existing dataset for performance?", {
    x: 0.5, y: 1.05, w: 9.0, h: 0.28,
    fontFace: BODY, fontSize: 12, bold: true, color: C.terracotta,
  });
  s.addText(
    "GSM8K only → one task type, medium prompts only, biased toward reasoning models     |     " +
    "CNN/DailyMail only → one task type, long input bias, favours prefill-fast models     |     " +
    "A single dataset systematically favours one model type — task × length diversity is required",
    {
      x: 0.5, y: 1.33, w: 9.0, h: 0.55,
      fontFace: BODY, fontSize: 11, color: C.warmGray,
    }
  );
 
  // Table
  const tblData = [
    [
      { text: "Source", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Task Type", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Count", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Input Length", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Deployment Scenario", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
    ],
    [
      { text: "Alpaca", options: { fill: { color: C.tableRow1 } } },
      { text: "Instruction following", options: { fill: { color: C.tableRow1 } } },
      { text: "17", options: { fill: { color: C.tableRow1 }, bold: true, color: C.terracotta } },
      { text: "Short  (<50 tokens)", options: { fill: { color: C.tableRow1 } } },
      { text: "Everyday assistant queries", options: { fill: { color: C.tableRow1 } } },
    ],
    [
      { text: "GSM8K", options: { fill: { color: C.tableRow2 } } },
      { text: "Mathematical reasoning", options: { fill: { color: C.tableRow2 } } },
      { text: "10", options: { fill: { color: C.tableRow2 }, bold: true, color: C.terracotta } },
      { text: "Medium  (50–150 tokens)", options: { fill: { color: C.tableRow2 } } },
      { text: "Analytical / calculation tasks", options: { fill: { color: C.tableRow2 } } },
    ],
    [
      { text: "OpenAssistant", options: { fill: { color: C.tableRow1 } } },
      { text: "Open QA", options: { fill: { color: C.tableRow1 } } },
      { text: "10", options: { fill: { color: C.tableRow1 }, bold: true, color: C.terracotta } },
      { text: "Medium  (50–150 tokens)", options: { fill: { color: C.tableRow1 } } },
      { text: "Conversational assistant", options: { fill: { color: C.tableRow1 } } },
    ],
    [
      { text: "OpenAssistant", options: { fill: { color: C.tableRow2 } } },
      { text: "Complex reasoning", options: { fill: { color: C.tableRow2 } } },
      { text: "7", options: { fill: { color: C.tableRow2 }, bold: true, color: C.terracotta } },
      { text: "Long  (>150 tokens)", options: { fill: { color: C.tableRow2 } } },
      { text: "Multi-step problem solving", options: { fill: { color: C.tableRow2 } } },
    ],
    [
      { text: "CNN/DailyMail", options: { fill: { color: C.tableRow1 } } },
      { text: "Summarisation", options: { fill: { color: C.tableRow1 } } },
      { text: "6", options: { fill: { color: C.tableRow1 }, bold: true, color: C.terracotta } },
      { text: "Long  (>150 tokens)", options: { fill: { color: C.tableRow1 } } },
      { text: "Document processing / summarisation", options: { fill: { color: C.tableRow1 } } },
    ],
    [
      { text: "TOTAL", options: { bold: true, fill: { color: C.darkPanel }, color: C.white } },
      { text: "5 task types", options: { bold: true, fill: { color: C.darkPanel }, color: C.white } },
      { text: "50", options: { bold: true, fill: { color: C.darkPanel }, color: C.paleAmber } },
      { text: "Short 17 · Medium 17 · Long 16", options: { bold: true, fill: { color: C.darkPanel }, color: C.white } },
      { text: "seed=42 · all datasets have academic citations", options: { bold: true, fill: { color: C.darkPanel }, color: C.white } },
    ],
  ];
 
  s.addTable(tblData, {
    x: 0.35, y: 2.12, w: 9.3, h: 2.65,
    fontSize: 11, fontFace: BODY,
    border: { pt: 0.5, color: "C8B8A2" },
    colW: [1.6, 1.85, 0.65, 1.85, 3.35],
  });
 
  // Is 50 enough?
  card(s, 0.35, 4.9, 9.3, 0.58, C.sand);
  s.addText("Is 50 prompts statistically sufficient?", {
    x: 0.5, y: 4.93, w: 2.8, h: 0.28,
    fontFace: BODY, fontSize: 11.5, bold: true, color: C.terracotta,
  });
  s.addText(
    "50 × 3 runs = 150 measurements per model per scenario  →  " +
    "Sufficient for mean ± std, P50/P90/P99, and Friedman test (requires ≥ 3 groups).  " +
    "MLPerf uses 5,000 prompts to test system throughput limits — our goal is relative model comparison, not absolute limits.",
    {
      x: 3.4, y: 4.93, w: 6.1, h: 0.52,
      fontFace: BODY, fontSize: 10.5, color: C.warmGray, italic: true,
    }
  );
 
  s.addNotes(
    "This slide explains the LDWS dataset design. " +
    "I chose to mix four publicly available datasets to cover both different task types and different input lengths. " +
    "This matters because different task types stress different parts of the model, and different input lengths have very different effects on latency and energy. " +
    "Using a single dataset would systematically favour one type of model. " +
    "All four datasets have peer-reviewed academic citations, and sampling uses seed 42 so results are fully reproducible. " +
    "Fifty prompts times three runs gives 150 measurements per configuration, which is sufficient for all the statistical tests I plan to run."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 5 — EVALUATION PIPELINE
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };
  darkSlideTitle(s, "Full Evaluation Pipeline — Steps & Outputs");
 
  const steps = [
    {
      num: "1",
      title: "Preparation  (DONE ✓)",
      lines: ["5 models pulled to Ollama", "LDWS prompts.json generated", "GPU/CPU device detection → device_map.json"],
      output: "",
      done: true,
    },
    {
      num: "2",
      title: "Performance  (benchmark_eval.py)",
      lines: ["3 runs × 3 scenarios × 5 models × 50 prompts", "Status: test run successful — full run pending"],
      output: "runtime_results.csv (7,500 rows)  ·  summary.csv (15 rows)  →  latency / throughput / RAM / energy / stability charts & Friedman test",
      done: false,
    },
    {
      num: "3",
      title: "Capability  (lm-evaluation-harness)",
      lines: ["MMLU · GSM8K · ARC-Challenge · HellaSwag", "Status: pending"],
      output: "Accuracy (%) per model × benchmark  →  comparison with GPT-4 / LLaMA-70B baselines · Pareto analysis",
      done: false,
    },
    {
      num: "4",
      title: "Tool Calling  (bfcl_eval.py)",
      lines: ["BFCL dataset · Serial scenario only", "Status: script to be developed"],
      output: "Tool-selection accuracy · Parameter accuracy · JSON compliance rate  →  parameter-scale threshold finding",
      done: false,
    },
    {
      num: "5",
      title: "Analysis & Visualisation  (analysis.ipynb)",
      lines: ["Inputs: outputs of Steps 2 + 3 + 4", "Status: pending"],
      output: "Latency/energy/radar charts · Statistical tests (Friedman + Wilcoxon + Bonferroni)  →  Dissertation Results & Discussion chapters",
      done: false,
    },
  ];
 
  const yStart = 0.98;
  const rowH = 0.86;
  const gap = 0.06;
 
  steps.forEach((st, i) => {
    const y = yStart + i * (rowH + gap);
    const bg = st.done ? "2E4A2E" : C.darkPanel;
    const borderCol = st.done ? "4CAF50" : C.amber;
 
    card(s, 0.35, y, 9.3, rowH, bg);
    // override border
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.35, y, w: 9.3, h: rowH,
      fill: { color: bg },
      line: { color: borderCol, width: 1 },
      rectRadius: 0.08,
    });
 
    badge(s, 0.42, y + (rowH - 0.28) / 2, 0.28, st.num,
      st.done ? "4CAF50" : C.terracotta, C.white);
 
    s.addText(st.title, {
      x: 0.78, y: y + 0.04, w: 3.1, h: 0.30,
      fontFace: BODY, fontSize: 11.5, bold: true,
      color: st.done ? "A5D6A7" : C.paleAmber,
      margin: 0,
    });
 
    s.addText(st.lines.join("   ·   "), {
      x: 0.78, y: y + 0.33, w: 3.15, h: 0.46,
      fontFace: BODY, fontSize: 10,
      color: "B0A090", margin: 0,
    });
 
    if (st.output) {
      s.addText("Output →", {
        x: 4.05, y: y + 0.04, w: 0.72, h: 0.26,
        fontFace: BODY, fontSize: 9.5, bold: true,
        color: C.amber, margin: 0,
      });
      s.addText(st.output, {
        x: 4.78, y: y + 0.04, w: 4.75, h: rowH - 0.1,
        fontFace: BODY, fontSize: 10,
        color: C.lightText, valign: "middle", margin: 0,
      });
    }
  });
 
  s.addNotes(
    "Here is the complete evaluation pipeline with five steps. " +
    "Step one — preparation — is already done. All five models are installed and the LDWS prompt file is ready. " +
    "Step two is the performance experiment using benchmark_eval.py. The test run was successful — I will show you preliminary data in a moment. The full three-run experiment is ready to start. " +
    "Step three is accuracy evaluation using lm-evaluation-harness, and step four is tool-calling evaluation using BFCL — both are pending. " +
    "Finally, step five is analysis and visualisation, which will feed directly into my dissertation Results and Discussion chapters."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 6 — BENCHMARK_EVAL.PY — 4-LAYER COLLECTION
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  slideTitle(s, "benchmark_eval.py — Four-Layer Metrics Collection");
 
  const layers = [
    {
      num: "L1",
      title: "Ollama API  →  Inference Performance",
      body: "TTFT (ms) via prompt_eval_duration field  ·  E2E Latency via Python wall-clock  ·  Decode Speed = eval_count ÷ eval_duration (tok/s)  ·  Prefill Speed = prompt_eval_count ÷ TTFT (tok/s)\nHighest precision: nanosecond-level internal timing, more accurate than pure external measurement",
    },
    {
      num: "L2",
      title: "Background Monitor Thread  →  Resource Utilisation (50 ms sampling)",
      body: "psutil → Ollama process RSS peak RAM (GB), CPU peak (%)     |     pynvml → GPU VRAM peak, GPU utilisation\nKey design: monitors BOTH ollama.exe AND ollama_llama_server (the subprocess that actually holds model weights — monitoring main process only severely underestimates RAM)",
    },
    {
      num: "L3",
      title: "CodeCarbon  →  Energy (Session-Level)",
      body: "Session = all 50 prompts in one run  |  NOT per-request (CodeCarbon start/stop overhead ~hundreds ms; for 0.5B model a single call may be 500 ms — overhead > 50%, data corrupted)\nNet Energy = CodeCarbon total − idle baseline energy (60 s pre-experiment)  |  Energy/token = Net Energy ÷ total tokens  |  Limitation noted: Windows RAPL unavailable → TDP-based fallback",
    },
    {
      num: "L4",
      title: "Derived Computation  →  Workload Stability (Degradation Rate)",
      body: "Computed across the full 50-prompt session after collection:\n  Baseline = median latency of first 5 requests  |  Degradation(n) = (latency_n − baseline) ÷ baseline × 100%\nMedian is used (not mean or first request) to filter out occasional system spikes.  Key metric for High Load scenario — reveals whether the model slows down under sustained pressure.",
    },
  ];
 
  const colors = [C.terracotta, C.amber, "7B5030", "4A3520"];
  const yStart = 1.0;
  const rh = 1.08;
 
  layers.forEach((l, i) => {
    const y = yStart + i * (rh + 0.045);
    const bg = i % 2 === 0 ? C.sand : C.tableRow2;
    card(s, 0.35, y, 9.3, rh, bg);
 
    badge(s, 0.42, y + 0.12, 0.40, l.num, colors[i], C.white);
 
    s.addText(l.title, {
      x: 0.9, y: y + 0.06, w: 8.65, h: 0.30,
      fontFace: BODY, fontSize: 12, bold: true, color: C.terracotta,
      margin: 0,
    });
    s.addText(l.body, {
      x: 0.9, y: y + 0.37, w: 8.65, h: 0.66,
      fontFace: BODY, fontSize: 10.5, color: C.warmGray,
      margin: 0,
    });
  });
 
  s.addNotes(
    "The performance benchmarking script collects data on four layers simultaneously. " +
    "The first layer uses Ollama's internal API fields for high-precision timing — this gives us TTFT, decode speed, and prefill speed. " +
    "The second layer runs a background thread that samples CPU, RAM, and GPU every 50 milliseconds without disturbing the inference. Crucially, it monitors both Ollama processes — the main process and the model-loading subprocess. " +
    "The third layer uses CodeCarbon at the session level, not per-request, because CodeCarbon's initialisation overhead would distort measurements for fast small models. " +
    "The fourth layer is a derived calculation — the degradation rate — which I compute after all 50 prompts are done, comparing each request's latency to the median of the first five. This tells us whether the model slows down under sustained load."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 7 — EXPERIMENTAL SCENARIOS & RIGOUR CONTROLS
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  slideTitle(s, "Experimental Scenarios & Rigour Controls");
 
  // Scenarios table
  s.addText("Three Workload Scenarios", {
    x: 0.45, y: 0.95, w: 9.1, h: 0.3,
    fontFace: BODY, fontSize: 13, bold: true, color: C.terracotta,
  });
 
  const scTbl = [
    [
      { text: "Scenario", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Parameter", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Simulated Deployment", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Key Threshold", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
    ],
    [
      { text: "Serial", options: { fill: { color: C.tableRow1 }, bold: true } },
      { text: "0.1 s gap between requests", options: { fill: { color: C.tableRow1 } } },
      { text: "Single-user daily interaction  (baseline)", options: { fill: { color: C.tableRow1 } } },
      { text: "Latency < 500 ms", options: { fill: { color: C.tableRow1 }, bold: true, color: C.green } },
    ],
    [
      { text: "High Load", options: { fill: { color: C.tableRow2 }, bold: true } },
      { text: "No gap — continuous requests", options: { fill: { color: C.tableRow2 } } },
      { text: "Sustained high-frequency pressure  (thermal throttling test)", options: { fill: { color: C.tableRow2 } } },
      { text: "Degradation < 20%", options: { fill: { color: C.tableRow2 }, bold: true, color: C.orange } },
    ],
    [
      { text: "Concurrent", options: { fill: { color: C.tableRow1 }, bold: true } },
      { text: "4 parallel threads", options: { fill: { color: C.tableRow1 } } },
      { text: "Multi-user shared device  (resource contention test)", options: { fill: { color: C.tableRow1 } } },
      { text: "Latency still < 500 ms", options: { fill: { color: C.tableRow1 }, bold: true, color: C.green } },
    ],
  ];
 
  s.addTable(scTbl, {
    x: 0.45, y: 1.28, w: 9.1, h: 1.18,
    fontSize: 11, fontFace: BODY,
    border: { pt: 0.5, color: "C8B8A2" },
    colW: [1.4, 2.15, 3.55, 2.0],
  });
 
  // Controls
  s.addText("Experimental Rigour — Six Controls", {
    x: 0.45, y: 2.56, w: 9.1, h: 0.3,
    fontFace: BODY, fontSize: 13, bold: true, color: C.terracotta,
  });
 
  const controls = [
    ["Determinism", "temperature = 0  ·  seed = 42  →  fully reproducible output"],
    ["Warmup Protocol", "3 warmup requests per session  ·  request #1 records cold-start latency  ·  remainder discarded to remove JIT effects"],
    ["Idle Baseline", "60 s system idle measurement before experiments  ·  Net energy = total − baseline energy (OS background removed)"],
    ["Outlier Detection", "Z-score > 3.0 flagged as outlier  ·  retained in CSV but excluded from statistical analysis"],
    ["Repeated Runs", "3 runs per configuration  →  report mean ± std  ·  Friedman + Wilcoxon + Bonferroni correction"],
    ["Resume Support", "Interrupted experiments resume from the exact request (per-request granularity)  ·  no data loss"],
  ];
 
  controls.forEach(([title, desc], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.45 : 5.0;
    const y = 2.92 + row * 0.74;
    const w = 4.45;
 
    card(s, x, y, w, 0.66, i % 2 === 0 ? C.sand : C.tableRow2);
    badge(s, x + 0.06, y + 0.17, 0.18, "✓", C.green, C.white);
    s.addText(title, {
      x: x + 0.3, y: y + 0.05, w: w - 0.35, h: 0.24,
      fontFace: BODY, fontSize: 11, bold: true, color: C.terracotta, margin: 0,
    });
    s.addText(desc, {
      x: x + 0.3, y: y + 0.30, w: w - 0.35, h: 0.32,
      fontFace: BODY, fontSize: 9.5, color: C.warmGray, margin: 0,
    });
  });
 
  s.addNotes(
    "I have designed three workload scenarios to simulate realistic deployment conditions. " +
    "Serial is the baseline with a small gap between requests. High Load has no gap and is designed to reveal thermal throttling effects. Concurrent sends four simultaneous requests to simulate multiple users. " +
    "To ensure the results are trustworthy and reproducible, I have implemented six rigour controls. " +
    "Temperature is set to zero for deterministic output. I use warmup requests to eliminate JIT effects. I measure idle baseline to subtract background energy. Outliers are flagged using Z-score. Everything is run three times for statistical testing. And the script supports resuming from any interrupted point without losing data."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 8 — TOOL CALLING EVALUATION
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  slideTitle(s, "Tool Calling Evaluation — Rationale & Design");
 
  // WHY card
  card(s, 0.35, 1.0, 4.55, 2.3, C.sand);
  s.addText("Why Add Tool Calling?", {
    x: 0.5, y: 1.06, w: 4.2, h: 0.3,
    fontFace: BODY, fontSize: 12, bold: true, color: C.terracotta,
  });
  bullets(s, [
    "Tool calling distinguishes a language model from a deployable AI agent",
    "Critical for agentic local deployment (personal assistants, on-device automation)",
    "Key question: at what parameter scale does this capability emerge?",
    "Expected: 0.5B/1.1B may fail to produce valid JSON → recorded as 0, not skipped → evidence for a parameter-scale capability threshold",
  ], 0.5, 1.38, 4.25, 1.78, { size: 10, spaceAfter: 5 });
 
  // HOW card
  card(s, 5.1, 1.0, 4.55, 2.3, C.sand);
  s.addText("How It Works — Static Evaluation", {
    x: 5.25, y: 1.06, w: 4.2, h: 0.3,
    fontFace: BODY, fontSize: 12, bold: true, color: C.terracotta,
  });
 
  s.addText([
    { text: "Input: ", options: { bold: true, breakLine: false } },
    { text: "Question + Tool schema (JSON)", options: {} },
  ], { x: 5.25, y: 1.40, w: 4.2, h: 0.25, fontFace: BODY, fontSize: 10.5, color: C.warmGray });
 
  s.addText([
    { text: "Model output:", options: { bold: true, breakLine: true } },
    { text: '{"name":"get_weather","arguments":{"city":"London"}}', options: { italic: true } },
  ], { x: 5.25, y: 1.65, w: 4.2, h: 0.42, fontFace: BODY, fontSize: 10, color: C.warmGray });
 
  s.addText("No real tool execution — purely static assessment", {
    x: 5.25, y: 2.07, w: 4.2, h: 0.22,
    fontFace: BODY, fontSize: 9.5, italic: true, color: C.mutedText,
  });
 
  s.addText("Three Metrics", {
    x: 5.25, y: 2.32, w: 4.2, h: 0.22,
    fontFace: BODY, fontSize: 11, bold: true, color: C.terracotta,
  });
  const metrics = [
    ["Tool-Selection Accuracy", "Correct function chosen?"],
    ["Parameter Accuracy", "Argument names & values correct?"],
    ["JSON Compliance Rate", "Output is valid, parseable JSON?"],
  ];
  metrics.forEach(([m, d], i) => {
    s.addText(`▸  ${m}  —  ${d}`, {
      x: 5.25, y: 2.56 + i * 0.32, w: 4.2, h: 0.28,
      fontFace: BODY, fontSize: 10, color: C.warmGray, margin: 0,
    });
  });
 
  // Details panel at bottom
  card(s, 0.35, 3.42, 9.3, 1.98, C.tableRow2);
  s.addText("Dataset & Scope", {
    x: 0.5, y: 3.47, w: 2.0, h: 0.28,
    fontFace: BODY, fontSize: 11.5, bold: true, color: C.terracotta,
  });
  bullets(s, [
    "Dataset: BFCL (Berkeley Function Calling Leaderboard)  —  most authoritative tool-calling benchmark; pip-installable",
    "Scenario: Serial only  —  tool-calling tests capability, not sustained-load performance; single-token JSON output makes throughput/energy measurement meaningless",
    "Script: bfcl_eval.py  —  to be developed; results merged into Capability dimension alongside lm-eval accuracy scores",
  ], 0.5, 3.78, 9.0, 1.55, { size: 10.5, spaceAfter: 5 });
 
  s.addNotes(
    "Tool calling is a capability I added as a sub-dimension of the overall Capability evaluation. " +
    "The reason is simple: in agentic applications, the model must generate a structured function call, and if it cannot produce valid JSON, it is not deployable in that context. " +
    "The evaluation is static — I give the model a question and a tool schema, and I check whether the output is a correct function call. No real tools are executed. " +
    "I will use the BFCL dataset, which is the standard benchmark for this. " +
    "I expect that the 0.5B and 1.1B models will struggle to produce valid JSON at all, which itself is an interesting finding about the minimum parameter scale needed for agentic capability."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 9 — PRELIMINARY TEST RESULTS
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  smallTitle(s, "Preliminary Results — Serial Scenario (Validation, 1 Run)");
 
  s.addText(
    "⚠  This is a single-run validation test to confirm the script works correctly — NOT the formal results. " +
    "The full experiment (3 runs × 3 scenarios) is pending.",
    {
      x: 0.45, y: 0.92, w: 9.1, h: 0.40,
      fontFace: BODY, fontSize: 11, italic: true,
      color: C.orange, margin: 0,
    }
  );
 
  const resTbl = [
    [
      { text: "Model", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Latency Mean (ms)", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "TTFT (ms)", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Decode Speed (tok/s)", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "RAM Peak (GB)", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Energy / Token (J)", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
      { text: "Cold Start (ms)", options: { bold: true, color: C.white, fill: { color: C.terracotta } } },
    ],
    [
      { text: "Qwen2.5 0.5B", options: { fill: { color: C.tableRow1 } } },
      { text: "1,046", options: { fill: { color: C.tableRow1 } } },
      { text: "17", options: { fill: { color: C.tableRow1 } } },
      { text: "340", options: { fill: { color: C.tableRow1 } } },
      { text: "1.29", options: { fill: { color: C.tableRow1 } } },
      { text: "0.43", options: { fill: { color: C.tableRow1 } } },
      { text: "2,911", options: { fill: { color: C.tableRow1 } } },
    ],
    [
      { text: "TinyLlama 1.1B", options: { fill: { color: C.tableRow2 } } },
      { text: "897 ★", options: { fill: { color: C.tableRow2 }, bold: true, color: C.green } },
      { text: "19", options: { fill: { color: C.tableRow2 } } },
      { text: "275", options: { fill: { color: C.tableRow2 } } },
      { text: "1.27", options: { fill: { color: C.tableRow2 } } },
      { text: "0.43", options: { fill: { color: C.tableRow2 } } },
      { text: "4,094", options: { fill: { color: C.tableRow2 } } },
    ],
    [
      { text: "Qwen 1.8B", options: { fill: { color: C.tableRow1 } } },
      { text: "1,464", options: { fill: { color: C.tableRow1 } } },
      { text: "23", options: { fill: { color: C.tableRow1 } } },
      { text: "171", options: { fill: { color: C.tableRow1 } } },
      { text: "1.91", options: { fill: { color: C.tableRow1 } } },
      { text: "0.72", options: { fill: { color: C.tableRow1 } } },
      { text: "2,907", options: { fill: { color: C.tableRow1 } } },
    ],
    [
      { text: "Llama3.2 3B", options: { fill: { color: C.tableRow2 } } },
      { text: "2,787", options: { fill: { color: C.tableRow2 } } },
      { text: "38", options: { fill: { color: C.tableRow2 } } },
      { text: "82", options: { fill: { color: C.tableRow2 } } },
      { text: "1.80", options: { fill: { color: C.tableRow2 } } },
      { text: "1.21", options: { fill: { color: C.tableRow2 } } },
      { text: "5,156", options: { fill: { color: C.tableRow2 } } },
    ],
    [
      { text: "Phi-3 3.8B", options: { fill: { color: C.tableRow1 } } },
      { text: "2,985", options: { fill: { color: C.tableRow1 } } },
      { text: "46", options: { fill: { color: C.tableRow1 } } },
      { text: "76", options: { fill: { color: C.tableRow1 } } },
      { text: "0.66 †", options: { fill: { color: C.tableRow1 }, italic: true, color: C.orange } },
      { text: "1.23", options: { fill: { color: C.tableRow1 } } },
      { text: "3,101", options: { fill: { color: C.tableRow1 } } },
    ],
  ];
 
  s.addTable(resTbl, {
    x: 0.35, y: 1.38, w: 9.3, h: 2.0,
    fontSize: 11, fontFace: BODY,
    border: { pt: 0.5, color: "C8B8A2" },
    colW: [1.55, 1.55, 0.95, 1.7, 1.2, 1.4, 1.35],
  });
 
  // Notes
  const notes_items = [
    "★  TinyLlama 1.1B is faster than Qwen2.5 0.5B — parameter count alone does not determine latency",
    "Energy/token increases with parameter scale; the 3B → 3.8B increment is smaller than 1.8B → 3B",
    "Degradation rates of 1.8–2.3% observed even in Serial scenario; High Load expected to show more significant thermal effects",
    "† Phi-3 RAM (0.66 GB) is a known measurement limitation: device detection misclassified it as CPU during model switching; RAM reflects CPU-side memory only, excluding VRAM. Will be declared explicitly in the Methodology chapter. Does not affect latency or throughput metrics.",
  ];
 
  card(s, 0.35, 3.48, 9.3, 1.92, C.sand);
  s.addText("Key Observations (Preliminary — Subject to Change with Full Data)", {
    x: 0.5, y: 3.53, w: 9.0, h: 0.28,
    fontFace: BODY, fontSize: 11, bold: true, color: C.terracotta,
  });
  notes_items.forEach((item, i) => {
    s.addText(`${i + 1}.  ${item}`, {
      x: 0.5, y: 3.84 + i * 0.36, w: 9.0, h: 0.32,
      fontFace: BODY, fontSize: 10, color: C.warmGray, margin: 0,
    });
  });
 
  s.addNotes(
    "This slide shows data from a single validation run of the serial scenario — this is not the formal result. " +
    "The purpose was to confirm the script is working correctly. " +
    "One interesting observation is that TinyLlama at 1.1B is actually faster than Qwen at 0.5B, which suggests that parameter count is not the only factor determining latency — model architecture also matters. " +
    "The Phi-3 RAM figure of 0.66 GB is unusually low, and this is a known limitation of the device detection method — the model was misclassified during GPU switching, so RAM only shows CPU-side memory. I will document this as a limitation in the methodology chapter. " +
    "The full experiment with three runs across all three scenarios is ready to run."
  );
}
 
// ═══════════════════════════════════════════════
// SLIDE 10 — NEXT STEPS (dark closing slide)
// ═══════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };
  darkSlideTitle(s, "Next Steps & Timeline");
 
  // decorative oval
  s.addShape(pres.shapes.OVAL, {
    x: 7.5, y: 2.5, w: 3.5, h: 3.5,
    fill: { color: C.terracotta, transparency: 80 },
    line: { color: C.terracotta, transparency: 80 },
  });
 
  const timeline = [
    { when: "This Week", status: "🔄", items: ["Run benchmark_eval.py full experiment (3 runs × 3 scenarios × 5 models, ~3–4 hours)"] },
    { when: "Next Week", status: "□", items: ["lm-evaluation-harness: MMLU · GSM8K · ARC · HellaSwag for all 5 models", "Develop and run bfcl_eval.py (BFCL tool-calling evaluation)"] },
    { when: "After That", status: "□", items: ["analysis.ipynb: data analysis, visualisation, statistical tests", "Dissertation: Methodology + Results chapters", "LoRA fine-tuning exploration (if time permits)"] },
  ];
 
  timeline.forEach((t, i) => {
    const y = 1.05 + i * 1.38;
    card(s, 0.35, y, 8.8, 1.25, C.darkPanel);
    // override to dark
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.35, y, w: 8.8, h: 1.25,
      fill: { color: C.darkPanel },
      line: { color: C.amber, width: 0.8 },
      rectRadius: 0.08,
    });
 
    s.addText(`${t.status}  ${t.when}`, {
      x: 0.5, y: y + 0.1, w: 2.0, h: 0.3,
      fontFace: BODY, fontSize: 12, bold: true,
      color: C.paleAmber, margin: 0,
    });
 
    s.addText(t.items.join("\n"), {
      x: 0.5, y: y + 0.42, w: 8.5, h: 0.75,
      fontFace: BODY, fontSize: 11,
      color: C.lightText, margin: 0,
    });
  });
 
  // Deadline
  card(s, 0.35, 5.2, 8.8, 0.32, C.terracotta);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.35, y: 5.2, w: 8.8, h: 0.32,
    fill: { color: C.terracotta },
    line: { color: C.terracotta },
    rectRadius: 0.06,
  });
  s.addText("Dissertation submission deadline:  10 August 2026   ·   Demo video deadline:  13 August 2026", {
    x: 0.5, y: 5.2, w: 8.6, h: 0.32,
    fontFace: BODY, fontSize: 11.5, bold: true,
    color: C.white, align: "center", valign: "middle", margin: 0,
  });
 
  s.addNotes(
    "To summarise the next steps. " +
    "This week I will run the full benchmark_eval.py experiment — it takes about three to four hours, so I plan to let it run overnight. " +
    "Next week I will run lm-evaluation-harness for accuracy scores and develop the BFCL tool-calling evaluation script. " +
    "After that, I will do the analysis, write the Methodology and Results chapters, and explore LoRA fine-tuning if time allows. " +
    "My submission deadline is August 10th. " +
    "I am on track, and I am confident the experimental framework is solid. Do you have any questions or suggestions?"
  );
}
 
// ═══════════════════════════════════════════════
// WRITE FILE
// ═══════════════════════════════════════════════
const OUTPUT = "E:\\DATA\\gx498\\Desktop\\course work\\8099\\ppt\\ppt\\SLM_Progress_Update.pptx";
pres.writeFile({ fileName: OUTPUT }).then(() => {
  console.log(`✅  Generated: ${OUTPUT}`);
}).catch(err => {
  console.error("❌  Error:", err);
});
