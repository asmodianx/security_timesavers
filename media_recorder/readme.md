# Media Recorder Tool

A lightweight, browser-based utility designed to capture audio, video, or screen recordings directly within your web browser—handy for incident response documentation, capture-the-flag (CTF) walkthroughs, and security demonstration recordings.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

During security audits, incident recreations, or internal training sessions, security professionals often need a quick, no-fuss way to record evidence, proof-of-concept (PoC) exploits, or bug bounty walkthroughs without installing heavyweight third-party screen-recording software.

The **Media Recorder** tool (`index.html`) leverages native browser MediaRecorder APIs to let you record audio, video, or your screen instantly with zero installation required.

---

## ✨ Features

- **Multi-Source Capture:** Record audio, webcam video, or full screen/window captures directly from your browser.
- **Zero Dependencies:** Fully self-contained single-page application (`HTML/CSS/JS`) requiring no external backend servers, browser extensions, or binary installations.
- **Privacy & Local Processing:** Recordings are processed and stored locally in your browser session via Blob APIs, ensuring sensitive data doesn't leak to external third-party recording services.
- **Instant Export:** Download captured recordings immediately in standard browser-supported media formats (e.g., WebM/MP4).

---

## 🚀 Getting Started

### Option 1: Run Locally (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/media_recorder
