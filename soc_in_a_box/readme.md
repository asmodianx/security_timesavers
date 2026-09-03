# SOC in a Box

A browser-based, desktop-style operational workspace designed to unify security utilities, triage aids, and tactical workflows into a single, cohesive interface.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Security analysts and incident responders often juggle dozens of browser tabs, terminal windows, scrappads, and ad-hoc calculators while investigating an alert or working through an incident response checklist.

**SOC in a Box** (`index.html`) solves this fragmentation by implementing a lightweight "web desktop" interface directly inside the browser. It provides a centralized, windowed command center where analysts can launch, tile, minimize, and organize specialized security micro-tools without context switching across multiple applications or leaving browser-native environments.

---

## ✨ Key Capabilities

- **Windowed Desktop Interface:** Open, drag, resize, minimize, and manage multiple operational tools within a single browser viewport.
- **Unified Workspace:** Houses and orchestrates security utilities in one place for smoother alert triage and case tracking.
- **Zero Dependencies & Build-Free:** Built with pure vanilla HTML, CSS, and JavaScript. No npm builds, bundling steps, or external CDN dependencies required.
- **Strictly Local & Air-Gap Friendly:** All window state, script execution, and data handling execute locally in browser memory, preventing sensitive operational telemetry or indicators from leaking externally.

---

## 🚀 Getting Started

### Option 1: Direct File Access (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/soc_in_a_box
