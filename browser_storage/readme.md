# SentinelFlow (Browser Storage Edition)

A standalone, browser-based workflow modeling and persistence utility designed to help security engineers and SOC teams map, document, and validate Microsoft Sentinel detection pipelines and SOAR automation flows with client-side local storage support.

Part of the **[browser_storage](https://github.com/asmodianx/browser_storage)** collection of persistent, zero-backend web utilities.

---

## 📌 Overview

Architecting detections and automation in Microsoft Sentinel requires linking multiple moving pieces: ingestion connectors, Log Analytics tables, KQL analytic rules, entity mapping, and Azure Logic App playbooks. 

While lightweight single-page utilities make modeling these flows easy, losing your layout or configuration on an accidental browser refresh is a major pain point. **SentinelFlow (Browser Storage Edition)** (`index.html`) couples interactive pipeline modeling with native browser storage APIs (`localStorage` / `IndexedDB`), allowing you to build, customize, and maintain end-to-end detection and orchestration runbooks across browser sessions without needing a database or cloud account.

---

## 🔄 Pipeline Lifecycle

```text
  [ Ingestion Connectors ]
  (Syslog, AMA, CEF, Graph API, CloudTrail)
                 │
                 ▼
  [ Log Analytics Tables & Parsing ]
  (CommonSecurityLog, SigninLogs, DeviceProcessEvents)
                 │
                 ▼
  [ KQL Analytics Rule & Entity Mapping ]
  (Frequency, Thresholds, Account / Host / IP Entities)
                 │
                 ▼
  [ Incident Creation & Alert Grouping ]
  (Severity, ATT&CK Tactics, Alert Aggregation)
                 │
                 ▼
  [ Automated Response / SOAR Playbook ]
  (Logic Apps -> Account Revocation, Firewall Drop, Ticket Update)
