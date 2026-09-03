# STIX Palette

An interactive, browser-based cyber threat intelligence (CTI) graphing and visualization utility designed to help threat analysts, intelligence leads, and security researchers construct, inspect, and evaluate STIX 2.1 threat objects and relationship graphs directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Structured Threat Information Expression (STIX™ 2.1) is the standard language used to model adversary behaviors, campaigns, infrastructure, and indicators in cyber threat intelligence. However, authoring raw STIX JSON bundles by hand is verbose and error-prone, while enterprise TIP (Threat Intelligence Platform) suites are often too heavy when an analyst needs to quickly sketch or validate a threat graph during active triage.

**STIX Palette** (`index.html`) provides a lightweight, client-side visual workspace to compose and explore STIX Domain Objects (SDOs), STIX Cyber-observable Objects (SCOs), and STIX Relationship Objects (SROs). Analysts can model threat campaigns, link indicators to techniques, and generate valid graph representations without external infrastructure or API dependencies.

---

## 🧭 STIX 2.1 Object Modeling Architecture

```text
  [ Threat Actor / Intrusion Set ]
                 │
                 │ uses (SRO)
                 ▼
      [ Attack Pattern / TTP ]
                 │
                 │ targets / indicates (SRO)
        ┌────────┴────────┐
        ▼                 ▼
  [ Indicator ]     [ Identity / Vulnerability ]
  (File, IP, URL)   (Target Organization, CVE)
