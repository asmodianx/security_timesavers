# Media Recorder Tool

A lightweight, browser-based audio and video recording utility designed to capture camera feeds and microphone input directly inside your web browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Whether recording verbal incident debriefs, logging spoken forensic walkthroughs, or capturing webcam footage for identity verification checks, having a direct recording tool without third-party bloat is essential.

The **Media Recorder** tool (`index.html`) relies on native HTML5 and browser MediaStream/MediaRecorder APIs to record audio and video streams locally without sending data to any external cloud platform.

---

## ✨ Features

- **Audio & Video Capture:** Record webcam video, standalone microphone audio, or synchronized audio/video streams.
- **Client-Side Processing:** All streams and media blobs are processed entirely within the local browser memory—no recording data leaves your machine.
- **Zero Dependencies:** Pure single-page implementation (`HTML/CSS/JS`) with no plugins, extensions, or server backends required.
- **Direct Playback & Export:** Preview recordings immediately after stopping and export them directly to disk in standard browser media formats (e.g., WebM).

---

## 🚀 Getting Started

### Option 1: Run Locally (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/media_recorder
