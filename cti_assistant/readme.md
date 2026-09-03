# CTI Assistant

An interactive, browser-based Cyber Threat Intelligence (CTI) analyst companion designed to streamline threat modeling, indicator triage, intelligence analysis structuring, and adversary profile tracking directly within the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Cyber Threat Intelligence analysts often balance unstructured intelligence reports, raw technical indicators, and high-level stakeholder inquiries under tight turnaround times. Moving between heavy Threat Intelligence Platforms (TIPs), disparate spreadsheets, and disconnected text scratchpads introduces cognitive friction and operational delay during high-priority investigations.

The **CTI Assistant** (`index.html`) provides a lightweight, focused analytical workbench. It offers structured workflows to evaluate source reliability, structure hypotheses, map adversary techniques, and draft actionable intelligence summaries—all within a single-page, client-side interface.

---

## 🧭 Intelligence Analysis Workflow

```text
  [ Raw Intelligence Ingestion ]
  (OSINT Reports, ISAC Bulletins, Incident Telemetry)
                 │
                 ▼
  [ Evaluation & Credibility Scoring ]
  (Admiralty System: Source Reliability A-F | Information Credibility 1-6)
                 │
                 ▼
  [ Hypothesis Generation & Analytic Structuring ]
  (Analysis of Competing Hypotheses / Diamond Model Mapping)
                 │
                 ▼
  [ Dissemination & Operational Handoff ]
  (Actionable Stakeholder Briefs, SOC Hunting Leads, IoC Packages)
