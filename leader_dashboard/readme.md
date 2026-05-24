# Tactical Operations Logger (TOL)

**TOL** is a lightweight, zero-dependency, offline-first web utility designed for Community Emergency Response Teams (CERT) and Incident Commanders. It provides a mobile-optimized environment for documenting personnel rosters, tracking triage metrics, maintaining tactical narratives, and managing resource requests during emergency operations.

## Philosophy: Browser-as-an-OS
TOL is built as a **Progressive Web App (PWA)**. It requires no installation, no cloud connectivity, and no external CDNs. The entire application runs in your browser's local sandbox, making it ideal for austere, high-stress, or disconnected environments.

## Core Features

### 1. Incident Initialization
* Configure the incident name, operational period, and primary communications plan.
* Data is persisted locally and immediately.

### 2. Personnel Roster & Tracking
* **Manual Entry:** Rapidly check in responders with dedicated fields for Last Name, First Name, Role, and Team.
* **Status Toggles:** Each responder has a segmented control to toggle status:
    * **AVL** (Available)
    * **DEP** (Deployed)
    * **RST** (Resting)
    * **DMB** (Demobilized)
* **Team Assignment:** Inline editing to assign or re-assign team memberships dynamically.
* **Summary Badge:** Real-time summary of all active teams currently on the roster.

### 3. Rapid Activity Log & Triage
* **Triage Widget:** Instant +/- counters for Immediate, Delayed, Minor, and Deceased counts.
* **Macro Bar:** One-touch injection of standard ICS tactical phrases (e.g., [ASSIGNMENT], [RADIO TRAFFIC], [MAYDAY/URGENT]).
* **Chronological Feed:** Timestamped narrative log (ICS-214) with context-colored entries.

### 4. Logistics (ICS-213RR)
* Track resource requests from "Requested" to "En Route" to "On Scene."
* Changes to resource status are automatically timestamped and logged in the Activity Log.

### 5. Export Engine
* **Markdown SitRep:** Generates a clean, transmission-ready text brief for SMS, Signal, or radio transmission.
* **JSON State Export:** Downloads the raw application state for desktop archival or transfer to a backup device.
* **JSON State Import:** Upload previously saved JSON files to restore a session across different devices.

## Operational Lifecycle

1.  **Start Incident:** Input data on the `Init` tab.
2.  **During Ops:** Check in personnel on the `Roster` tab. Manage triage and activity logs on the `Log` tab. Order and track resources on the `Ledger` tab.
3.  **End Incident:** Navigate to the `Export` tab and click **"End Incident & Wipe Device"** to perform a secure hard-reset of the local storage.

## Installation & Usage

### Web (Recommended)
1.  Host the folder on a local web server (e.g., `python -m http.server 8000`).
2.  Navigate to the URL in your mobile browser.
3.  Tap "Add to Home Screen" in your browser menu to treat it like a native app.

### Local File (Offline)
* You can open `index.html` directly, though **Service Worker caching is disabled** when running from a `file://` protocol. 
* To ensure offline stability, serve the directory via a local server (e.g., VS Code Live Server or a simple Python server).

## Troubleshooting
* **"SW Error":** This usually indicates the browser is blocking offline capabilities (e.g., opening from a local file path). Run the files through a local web server to enable full PWA features.
* **Data Persistence:** TOL uses browser `localStorage`. Avoid clearing your browser cache/cookies, or the incident data will be wiped. Use the **Export JSON** button frequently to maintain a backup.

---
*Developed for tactical field use. Zero dependencies. Browser-agnostic.*
