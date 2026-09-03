# Software Bill of Materials (SBOM) Analyzer

An interactive, browser-based Software Bill of Materials (SBOM) inspector and dependency analysis utility designed to help security engineers, developers, and compliance teams parse, inspect, and evaluate software supply chain components directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

With increasing supply chain security requirements (such as NIST SP 800-218, SSDF, and federal mandates), managing and auditing Software Bills of Materials has become essential. However, raw SBOM documents—typically generated as large CycloneDX or SPDX JSON/XML files—are dense and hard to quickly parse during an ad-hoc audit or incident triage.

The **SBOM Analyzer** (`index.html`) provides a lightweight, client-side interface to ingest, search, and visualize software inventory packages, component licenses, versions, and dependency structures without relying on external cloud scanners or heavy container runtimes.

---

## 🔍 Supply Chain Inspection & Triage Flow

```text
  [ Raw SBOM Input ]
  (CycloneDX / SPDX JSON / Component Manifests)
                 │
                 ▼
  [ Client-Side Schema Parsing & Normalization ]
  (Components, Libraries, Frameworks, Containers)
                 │
                 ▼
  [ Metadata, License & Version Breakdown ]
  (Package URL / purl, Version Drift, Permissive vs. Copyleft Licenses)
                 │
                 ▼
  [ Vulnerability & Triage Assessment ]
  (Search by Package, Check CVE Exposure, Flag End-of-Life Assets)
