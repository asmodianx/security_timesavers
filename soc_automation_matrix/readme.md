# SOC Automation Matrix

An interactive, browser-based decision matrix and roadmap designed to help Security Operations Center (SOC) teams, SecOps engineers, and detection responders identify, prioritize, and implement workflow automations.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Automating repetitive SOC tasks (triage, IOC enrichment, containment, ticket updates) is essential to combating alert fatigue and lowering Mean Time to Respond (MTTR). 

The **SOC Automation Matrix** (`index.html`) provides a client-side, visual interface to evaluate common SOC workflows across key dimensions:
- **Feasibility & Complexity:** API maturity, script vs. SOAR requirement, edge cases.
- **ROI & Time Savings:** Frequency of execution vs. hours reclaimed.
- **Risk Level:** Potential blast radius of false positives (e.g., auto-quarantining an executive workstation vs. enriching an IP via VirusTotal).
- **Automation Maturity:** From manual playbooks to fully autonomous containment.

---

## ✨ Features

- **Interactive Filtering & Sorting:** Quickly slice workflows by stage (Triage, Enrichment, Containment, Eradication, Notification) or target technology (EDR, SIEM, Firewalls, Identity/IdP).
- **Prioritization Matrix:** Evaluates quick wins (high impact, low effort) versus complex long-term projects.
- **Zero Dependencies:** Fully self-contained single-page application (`HTML/CSS/JS`). Runs locally in any modern browser without requiring a backend server or build step.
- **Auditing & Planning Ready:** Serves as a tangible discussion guide for sprint planning, engineering handoffs, and stakeholder reviews.

---

## 🚀 Getting Started

### Option 1: Run Locally (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/soc_automation_matrix
