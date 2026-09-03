# Risk Register Tool

A lightweight, browser-based risk assessment and tracking utility designed to help security leads, GRC analysts, and IT managers identify, score, prioritize, and monitor organizational risks without complex GRC software or spreadsheet headaches.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Maintaining a risk register is a fundamental requirement for frameworks such as ISO 27001, NIST CSF, and SOC 2. However, enterprise GRC platforms can be cumbersome for agile teams, while unwieldy spreadsheets often suffer from broken formulas, inconsistent scoring rubrics, and version-control sprawl.

The **Risk Register Tool** (`index.html`) provides a clean, responsive client-side interface to catalog operational and technical risks, calculate inherent and residual risk scores, track treatment plans, and evaluate organizational risk posture directly inside the browser.

---

## 🎯 Risk Scoring & Matrix Flow

The tool applies standard risk management mechanics to quantify and compare threats across systems and business units:

```text
  +-------------------------------------------------------------+
  | 1. Identify Threat & Vulnerability Context                  |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  | 2. Score Inherent Risk (Likelihood x Impact)               |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  | 3. Define Treatment Plan                                    |
  |    (Mitigate, Accept, Transfer, Avoid)                      |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  | 4. Calculate Residual Risk & Assign Ownership               |
  +-------------------------------------------------------------+
