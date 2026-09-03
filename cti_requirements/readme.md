# CTI Requirements Planner

An interactive, browser-based planning tool designed to define, structure, and prioritize Cyber Threat Intelligence (CTI) requirements across strategic, operational, and tactical tiers.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

A mature Threat Intelligence program starts with well-defined intelligence requirements, not unstructured feeds. Without clear alignment to organizational risk, CTI teams risk drowning in raw IoCs while missing strategic threats relevant to their industry, assets, and technology stack.

The **CTI Requirements Planner** (`index.html`) helps intelligence leads, security architects, and SOC teams translate high-level business concerns into actionable:
- **Priority Intelligence Requirements (PIRs):** High-level questions driven by executive leadership, board concerns, and core business risks.
- **Specific Intelligence Requirements (SIRs):** Focused queries targeting particular threat actors, campaigns, targeted technologies, or geographic regions.
- **Specific Information Requirements (InfoRs):** Tactical technical data needed to satisfy SIRs (e.g., specific telemetry sources, hash formats, CVE tracking, or detection rules).

---

## 🧭 Intelligence Hierarchy

```text
  +-------------------------------------------------------------+
  |              PIR (Priority Intelligence Requirement)        |
  |     "Are ransomware groups targeting higher ed / our tech?  |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |               SIR (Specific Intelligence Requirement)       |
  |     "What initial access brokers are targeting our VPN/IdP? |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |               InfoR (Specific Information Requirement)      |
  |     "Telemetry needed: Shodan scans, CVE-XXXX exploits, IOCs"
  +-------------------------------------------------------------+
