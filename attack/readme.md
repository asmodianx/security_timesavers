# MITRE ATT&CK Navigator & Mapping Tool

An interactive, browser-based utility designed to help security analysts, threat hunters, and detection engineers navigate, filter, and map adversary tactics, techniques, and procedures (TTPs) using the MITRE ATT&CK framework.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

The MITRE ATT&CK framework is the industry standard for modeling adversary behavior, scoping security incidents, and tracking detection coverage. However, loading enterprise threat intelligence suites or heavy online navigators can be cumbersome when you need quick, tactical answers during an active triage or hunting exercise.

The **ATT&CK tool** (`index.html`) provides a lightweight, responsive interface to explore tactics and techniques, evaluate detection posture, and cross-reference attacker actions directly in the browser—with zero installation and zero cloud dependencies.

---

## 🎯 Coverage & Tactics Matrix

Quickly navigate the full Enterprise ATT&CK matrix across core operational tactics:

```text
+-------------------+--------------------+--------------------+--------------------+
| Initial Access    | Execution          | Persistence        | Privilege Escalation|
+-------------------+--------------------+--------------------+--------------------+
| Defense Evasion   | Credential Access  | Discovery          | Lateral Movement   |
+-------------------+--------------------+--------------------+--------------------+
| Collection        | Command & Control  | Exfiltration       | Impact             |
+-------------------+--------------------+--------------------+--------------------+
