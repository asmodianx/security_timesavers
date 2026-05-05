This is a standard `README.md` file designed to accompany your project. It describes the utility’s purpose, technical architecture, and operational flow, tailored for an audience in information security and law enforcement.

***

# Forensic Evidence & Escalation Packager (FEEP)

## Project Overview
The **Forensic Evidence & Escalation Packager** is a standalone, client-side web utility designed for security analysts, ISAC members, and law enforcement officers. It provides a structured "Wizard" interface to document incident details and bundle evidence files into a verified package for third-party escalation.

This tool was built with a **Zero-Trust Local-First** philosophy. It requires no backend server, no internet connection, and utilizes no external CDN libraries, ensuring that sensitive case data never leaves the analyst's workstation during the packaging process.

### Current State: v3.5 (Production Ready)
* **Wizard Workflow:** Fully implemented 4-step process.
* **Cryptography:** Integrated Web Crypto API for local SHA-256 hashing.
* **Persistence:** JSON Import/Export with Base64 binary restoration.
* **Packaging:** Custom Vanilla JS TAR encoder for folder-structured exports.
* **Compliance:** TLP marking enforcement and forensic metadata tracking (Time Zone/Drift).

---

## Core Features
- **Case Administration:** Capture Case IDs, Stakeholders, and Organizational Legal Agreements.
- **Classification:** Visual TLP (Traffic Light Protocol) tagging.
- **Forensic Metadata:** - Automated SHA-256 hashing upon file selection.
    - Editable Time Zone and Clock Drift fields for log synchronization.
    - Individual file descriptions.
- **Flexible Export Options:**
    - **JSON Project:** Save and resume work later.
    - **PDF Summary:** Generate a professional escalation receipt/report.
    - **TAR Package:** A standardized archive containing a folder tree with original evidence, a Markdown summary of all wizard fields, and a text-based manifest.

---

## Technical Specifications
- **Framework:** Vanilla HTML5 / CSS3 / ES6 JavaScript.
- **Dependencies:** None (No CDNs, no NPM packages).
- **Security:** Bypasses CORS/Same-Origin Policy issues for local `file://` usage via manual Base64 to ArrayBuffer conversion.
- **Storage:** In-memory session handling (optimal for log files, PCAPs, and targeted forensic artifacts).

---

## Instructions for Use

### 1. Launching the Utility
Simply open `index.html` in any modern web browser (Chrome, Firefox, or Edge). Since there are no external dependencies, the tool works immediately while offline.

### 2. Resuming an Investigation (Optional)
If you have a previously exported `.json` project file, use the **"Import Project"** button on the first page. This will restore all text fields and rebuild the evidence binary array from the embedded Base64 data.

### 3. Step-by-Step Packaging
* **Step 1 (Identification):** Enter the administrative data. Ensure the TLP marking matches the sensitivity of the data.
* **Step 2 (Narrative):** Provide the "Who, What, Where, and Why." Document the requested activities for the 3rd party recipient.
* **Step 3 (Evidence):** Attach files. Once attached, verify the SHA-256 hash. Update the **Time Zone** and **Drift** fields specifically for log files to assist the recipient in timeline correlation.
* **Step 4 (Finalize):** Review the summary. 

### 4. Exporting the Result
* Click **Export JSON Session** to keep a working copy for yourself.
* Click **Print PDF Summary** to generate a human-readable report.
* Click **Download .TAR Package** to create the final escalation bundle.

---

## TAR Package Structure
When you export a TAR package, the following structure is generated:
```text
CASE_[ID]_PACKAGE.tar
├── case_summary.md    <-- Full wizard data (Narrative, Legal, TLP, etc.)
├── manifest.txt       <-- Flat text file with SHA-256 hashes for validation
└── evidence/
    ├── file1.log
    ├── file2.pcap
    └── ...
```

## Security & Privacy Note
This tool runs entirely in the browser's memory. Closing or refreshing the tab will clear all data unless you have exported your work as a JSON project. Ensure you follow your organization's data handling policy when managing the resulting TAR archives.
