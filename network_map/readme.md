# Network Map Tool

An interactive, browser-based network topology and asset mapping utility designed to help security engineers, network administrators, and incident responders visualize connections, subnets, and infrastructure architectures.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Understanding network topology is vital for threat modeling, attack surface reduction, and scoping incident blast radiuses. However, heavy enterprise GIS or dedicated diagramming tools can be overly complex for quick ad-hoc analysis or lab environments.

The **Network Map** tool (`index.html`) provides a lightweight, client-side interface to map out network nodes, subnets, and relationships instantly in your web browser.

---

## ✨ Features

- **Interactive Topology Visualization:** Graphically layout nodes, routers, hosts, and security zones for quick architectural reviews.
- **Zero Dependencies:** Built as a self-contained single-page application (`HTML/CSS/JS`). It requires no backend server, database, or complex npm/pip installation pipelines.
- **Portable & Offline-Ready:** Run it completely air-gapped or locally right inside any modern web browser during offline engagements or red/blue team exercises.
- **Quick Scoping & Triage:** Helps visualize pivot points, network segments, and trust boundaries during a security assessment or incident response.

---

## 🚀 Getting Started

### Option 1: Run Locally (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/network_map
