# NIST Incident Response (IR) Planner

An interactive, browser-based operational guide and checklist generator structured around the NIST Special Publication 800-61 incident response lifecycle.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

During active security events, incident responders must balance rapid tactical containment with rigorous adherence to standardized response frameworks. Missing key steps—such as preserving forensic chain of custody during eradication or failing to document critical indicators for post-incident review—can jeopardize both remediation and compliance reporting.

The **NIST IR Planner** (`index.html`) translates the core guidance of **NIST SP 800-61 (Computer Security Incident Handling Guide)** into a clean, actionable digital workspace. Responders can track their current phase, step through critical procedures, verify actions taken, and ensure consistent handling across the full lifecycle of an incident.

---

## 🔄 NIST SP 800-61 Lifecycle Coverage

The utility guides analysts and response leads through the four fundamental phases:

```text
  +-------------------------------------------------------------+
  |                        1. Preparation                       |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |              2. Detection & Analysis                        |
  |   (Precursors, Indicators, Scoping, Baselining)             |
  +-------------------------------------------------------------+
               |                                 ^
               v                                 |
  +-------------------------------------------------------------+
  |        3. Containment, Eradication & Recovery               |
  |   (Isolate, Eliminate Root Cause, Safe Restoration)         |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |                   4. Post-Incident Activity                 |
  |        (Lessons Learned, Evidence Retention, Metrics)       |
  +-------------------------------------------------------------+
