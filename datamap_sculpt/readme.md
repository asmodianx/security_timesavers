# DataMap Sculpt

An interactive, browser-based data mapping and field transformation utility designed to help security analysts, data engineers, and SIEM administrators sculpt, map, and translate unstructured or proprietary event schemas into standardized formats (such as ECS, OCSF, or custom data models) directly within the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Integrating disparate security data sources into centralized logging pipelines, SIEMs, or data lakes requires consistent schema mapping. Raw log feeds from endpoint agents, firewalls, and cloud services often name identical attributes differently (e.g., `src_ip`, `SourceIpAddress`, `client_ip`, `c-ip`). Manually writing transformation configs or wrestling with JSON field mappings across disparate spreadsheets frequently leads to mapping discrepancies and broken correlation searches.

**DataMap Sculpt** (`index.html`) provides a lightweight, client-side visual mapping workbench. Analysts can paste raw source payloads, inspect extracted key hierarchies, pair them interactively against target destination schemas, and generate transformation mappings or parser skeletons without third-party cloud tools or data leakage risks.

---

## 🔄 Schema Mapping & Translation Flow

```text
  [ Raw Source Event / JSON Payload ]
  (e.g., {"client_ip": "10.0.1.5", "user_name": "jdoe"})
                    │
                    ▼
  [ Automatic Key & Type Extraction ]
  (Tree Hierarchy, Nested Objects, Array Elements)
                    │
                    ▼
  [ Interactive Target Schema Pairing ]
  (client_ip  ──► source.ip [ECS] / src_endpoint.ip [OCSF])
  (user_name  ──► user.name [ECS] / actor.user.name [OCSF])
                    │
                    ▼
  [ Transformation & Rule Generation ]
  (Logstash Mappings, Cribl Routes, Ingest Pipeline JSON, KQL Parsers)
