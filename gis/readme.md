# GIS (Geolocation & Security) Tool

An interactive, browser-based utility designed to streamline security investigations involving geographic data, IP geolocation intelligence, and asset mapping.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

In modern security incidents—such as anomalous cloud logins, impossible travel alerts, VPN/proxy detection, and infrastructure threat hunting—quick geographic and network context is critical. 

The **GIS tool** (`index.html`) provides a lightweight, client-side interface to parse, lookup, and visualize geographic information associated with IPs, domains, or network ranges directly in your browser without requiring complex heavy GIS software.

---

## ✨ Features

- **Rapid Geolocation Lookup:** Quickly query location metadata (Country, Region, City, ISP, ASN, Coordinates) for indicators of compromise (IoCs).
- **Interactive Mapping Interface:** Visualizes point data and geographic clusters to help spot suspicious login patterns or unusual traffic paths.
- **Zero Dependencies:** Fully self-contained single-page application (`HTML/CSS/JS`). Runs completely client-side in any modern web browser.
- **Privacy-First / Local Operation:** Designed for security analysts who need a quick, offline-capable or local utility tool during triage without leaking sensitive telemetry to third-party web apps. (this does use external libraries for map layer access)

---

## 🚀 Getting Started

### Option 1: Run Locally (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/gis
