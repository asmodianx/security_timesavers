# SentinelFlow

A browser-based workflow and pipeline visualization utility designed to help security engineers, detection authors, and SOC teams model, document, and validate Microsoft Sentinel data streams, analytic rules, and automated response playbooks.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Implementing effective monitoring and incident triage in Microsoft Sentinel demands coordinating numerous interconnected moving parts: data connectors, Log Analytics workspace tables, scheduled Kusto Query Language (KQL) analytic rules, incident creation parameters, and automated orchestration via Azure Logic Apps.

Documenting or troubleshooting these pipelines directly inside the Azure portal can be tedious and prone to configuration blind spots. **SentinelFlow** (`index.html`) provides a lightweight, focused canvas to map out data flows, inspect detection trigger logic, and review remediation paths—without wrestling with heavy architecture software or slow web portals.

---

## 🔄 End-to-End Pipeline Scaffolding

```text
  [ Ingestion Sources ]
  (Syslog / AMA / CEF / Microsoft Graph / CloudTrail)
                 │
                 ▼
  [ Log Analytics Tables & Normalization ]
  (CommonSecurityLog, SigninLogs, DeviceProcessEvents)
                 │
                 ▼
  [ KQL Analytics Rule & Entity Mapping ]
  (Query Frequency, Threshold, Account / Host / IP Entities)
                 │
                 ▼
  [ Sentinel Incident Creation & Grouping ]
  (Severity, Tactics/Techniques, Alert Aggregation)
                 │
                 ▼
  [ Automated Response / SOAR Playbook ]
  (Logic App Trigger -> User Revocation / EDR Isolation / Ticket Update)
