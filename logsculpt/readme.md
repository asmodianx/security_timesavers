# LogSculpt

An interactive, browser-based log parsing, filtering, and transformation utility designed to help security analysts, threat hunters, and detection engineers sculpt, clean, and extract actionable indicators from raw log data.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

During active incident response or forensic triage, analysts frequently encounter messy, unstructured, or semi-structured log streams—such as web server access logs, firewall outputs, authentication dumps, or raw syslog extracts. Searching through these files or preparing them for SIEM ingestion often requires writing quick ad-hoc scripts or wrestling with command-line tools that may not be available on restricted hosts.

**LogSculpt** (`index.html`) provides a client-side log manipulation workbench directly inside the browser. It enables analysts to slice, parse, filter, deduplicate, and reshape raw text logs into structured formats (such as delimited tables or clean JSON) without writing throwaway scripts or exposing sensitive telemetry to external cloud services.

---

## 🔄 Log Sculpting & Transformation Flow

```text
  [ Raw Log Ingestion ]
  (Syslog, Web Access Logs, Firewall Dumps, Auth Events)
                 │
                 ▼
  [ Extraction & Regex Matching ]
  (Delimiters, Grok/Regex Patterns, Key-Value Pairs)
                 │
                 ▼
  [ Filtering, Normalization & Cleansing ]
  (Deduplication, Whitelist/Blacklist, Field Trimming)
                 │
                 ▼
  [ Structured Export & Analysis ]
  (Clean JSON, CSV/TSV, IOC Lists, SIEM-Ready Lines)
