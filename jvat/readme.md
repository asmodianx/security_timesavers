# JVAT

A lightweight, browser-based assessment utility designed to streamline security evaluations, risk scoring, and structured triage directly within your web browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Conducting structured security assessments—whether scoring findings, evaluating risks against a standardized matrix, or walking through operational review criteria—frequently gets bogged down in bloated spreadsheets, complex GRC portals, or disjointed note-taking apps.

**JVAT** (`index.html`) delivers a fast, client-side assessment workspace. It provides a clean, responsive interface to evaluate criteria, calculate scores, organize findings, and review security postures without overhead or administrative drag.

---

## ✨ Features

- **Structured Evaluation & Scoring:** Quickly walk through evaluation criteria, assign ratings, and generate aggregated assessment scores.
- **Zero Dependencies:** Fully self-contained single-page application (`HTML/CSS/JS`). Requires no backend database, Node.js environment, or external runtime libraries.
- **Strictly Local & Privacy-Preserving:** All evaluation inputs, scores, and notes remain inside local browser memory. Sensitive assessment details never traverse external networks or third-party cloud APIs.
- **Air-Gap & Jump-Box Ready:** Clone and run locally in isolated subnets, offline response laptops, or locked-down assessment hosts.

---

## 🚀 Getting Started

### Option 1: Direct File Access (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/jvat
