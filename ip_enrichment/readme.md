# IP Enrichment & Triage Assistant

An interactive, browser-based IP address inspection, parsing, and enrichment utility designed to help security analysts, incident responders, and network defenders triage suspicious IP addresses, extract network context, and prepare indicators directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

During alert triage and network investigations, analysts frequently encounter streams of unfamiliar IPv4 and IPv6 addresses across firewall alerts, authentication logs, and SIEM detections. Determining whether an address belongs to a private RFC 1918 range, public cloud infrastructure, a known VPN/Tor exit, or a major telecommunications provider often involves manual context-switching across external lookup portals and command-line tools.

The **IP Enrichment Tool** (`index.html`) provides a focused, single-pane triage workbench. Analysts can paste raw IP lists or mixed log lines to instantly parse network classifications, identify CIDR allocations, evaluate routing boundaries, defang indicators, and prepare structured telemetry—all without exposing internal IP architecture or investigative targets to third-party tracking services.

---

## 🔍 Network Classification & Triage Pipeline

```text
  [ Raw Input Stream / Log Snippet ]
                 │
                 ▼
  [ Regex IP Extraction & Deduplication ]
  (IPv4, IPv6, CIDR Blocks, Defanged Strings)
                 │
                 ▼
  [ Scope & Boundary Classification ]
  (RFC 1918 Private, Loopback, Link-Local, Multicast, Public Routable)
                 │
                 ▼
  [ Contextual Analysis & Transformation ]
  (Subnet Math, Reverse DNS Formats, Defanging: 192[.]168[.]1[.]1)
                 │
                 ▼
  [ Structured Export & SOC Handoff ]
  (Clean Indicator Lists, Firewall ACL Rules, SIEM Query Strings)
