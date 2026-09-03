# Browser Storage Inspector & Manager

A lightweight, client-side utility designed to inspect, manipulate, test, and manage client-side web storage mechanisms directly within your browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Client-side storage—encompassing `localStorage`, `sessionStorage`, `IndexedDB`, and cookies—is central to modern single-page applications and web architectures. However, security analysts, web application testers, and developers frequently need to inspect stored values, audit persistence behavior, test quota boundaries, or clear sensitive session artifacts without digging through complex developer tools sub-menus.

The **Browser Storage** utility (`index.html`) provides a focused, single-pane interface to view, parse, add, modify, and purge local storage data directly in the viewport.

---

## ✨ Features

- **Storage Type Coverage:** Inspect and manage keys across browser storage mechanisms:
  - **Local Storage (`localStorage`):** View, edit, add, or flush persistent origin data.
  - **Session Storage (`sessionStorage`):** Monitor tab-scoped ephemeral session states.
  - **IndexedDB & Cookie Inspection:** Check client-side database schemas and origin cookies where supported.
- **Key/Value Manipulation:** Quickly search, filter, decode, and update key-value pairs in place.
- **Quota & Boundary Testing:** Monitor origin storage utilization, payload sizing, and storage limit thresholds.
- **Zero External Dependencies:** Built entirely with vanilla HTML, CSS, and JavaScript. No build pipelines, runtime frameworks, or external CDNs required.
- **Privacy & Security Focused:** Runs 100% client-side. No stored tokens, session keys, or application payloads are sent to external analytics or third-party servers.

---

## 🚀 Getting Started

### Option 1: Direct File Access (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/browser_storage
