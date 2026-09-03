# Prompt Buddy

An interactive, browser-based prompt engineering and system prompt builder designed to help security professionals, analysts, and technical teams structure, test, and optimize modular prompts for Large Language Models (LLMs) directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Using AI models effectively for security tasks—such as summarizing threat intelligence reports, generating Sigma rules, analyzing log snippets, or drafting executive incident summaries—requires clear, robust prompt structures. Ad-hoc, unstructured prompting often yields generic answers, hallucinations, or non-deterministic formats that break downstream automation.

**Prompt Buddy** (`index.html`) provides a structured, client-side scratchpad to craft and organize effective prompts. By breaking prompts into modular functional blocks—such as Role, Objective, Context, Constraints, Input Data, and Output Format—analysts can consistently build repeatable, high-performance prompts without leaking sensitive prompts or data to third-party services.

---

## 🧱 Modular Prompt Scaffolding

```text
  +-------------------------------------------------------------+
  | 1. Persona / Role Definition                               |
  |    (e.g., "Senior Detection Engineer / CTI Analyst")        |
  +-------------------------------------------------------------+
                                 │
                                 ▼
  +-------------------------------------------------------------+
  | 2. Task & Objective Statement                               |
  |    (e.g., "Convert this threat bulletin into a Sigma rule") |
  +-------------------------------------------------------------+
                                 │
                                 ▼
  +-------------------------------------------------------------+
  | 3. Operational Constraints & Negative Bounds                |
  |    (e.g., "Zero external CDNs, client-side only, no LaTeX") |
  +-------------------------------------------------------------+
                                 │
                                 ▼
  +-------------------------------------------------------------+
  | 4. Input Context & Variable Injection                       |
  |    (e.g., Paste logs, sample code, or report snippets)      |
  +-------------------------------------------------------------+
                                 │
                                 ▼
  +-------------------------------------------------------------+
  | 5. Deterministic Output Schema                              |
  |    (e.g., Markdown table, valid JSON, specific keys only)   |
  +-------------------------------------------------------------+
