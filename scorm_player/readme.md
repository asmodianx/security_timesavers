# SCORM Player & Debugger

A lightweight, browser-based SCORM content player and API debugger designed to preview, launch, and troubleshoot e-learning packages and security awareness training modules directly inside the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Security awareness training and compliance courses are frequently authored and distributed as SCORM packages (e.g., SCORM 1.2 or SCORM 2004). However, verifying course functionality, debugging completion tracking, or reviewing third-party training content typically requires uploading bulky zip files to an enterprise Learning Management System (LMS) and waiting through processing queues.

The **SCORM Player** (`index.html`) implements a client-side LMS runtime environment directly in your browser. It provides the required JavaScript SCORM API adapter, allowing you to load courseware, inspect runtime API calls, debug state variables, and verify completion behaviors locally without needing access to a full LMS backend.

---

## 🔄 Runtime API & Tracking Flow

```text
  [ SCORM Content / Courseware Package ]
                     │
                     ▼
  [ Window / Frame API Bridge ]
  (window.API for SCORM 1.2 | window.API_1484_11 for SCORM 2004)
                     │
                     ▼
  [ LMS Runtime Adapter (Client-Side) ]
  (LMSInitialize, LMSGetValue, LMSSetValue, LMSCommit, LMSFinish)
                     │
                     ▼
  [ Live Diagnostics & State Inspector ]
  (cmi.core.lesson_status, cmi.core.score.raw, suspend_data)
