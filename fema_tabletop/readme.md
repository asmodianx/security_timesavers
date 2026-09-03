# FEMA Tabletop Exercise (TTX) Planner & Facilitator

An interactive, browser-based tabletop exercise facilitation and planning utility structured around FEMA Homeland Security Exercise and Evaluation Program (HSEEP) principles and Incident Command System (ICS) methodologies.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Conducting structured tabletop exercises (TTX) is critical for validating incident response plans, testing cross-departmental coordination, and meeting compliance mandates (NIST CSF, HIPAA, PCI-DSS, ISO 27001). However, facilitating an engaging exercise often degenerates into clicking through static slide decks while scrambling to capture participant feedback, timing, and inject responses in separate notes.

The **FEMA Tabletop Exercise Tool** (`index.html`) provides an interactive facilitator console and scenario manager directly in your browser. Exercise directors, incident commanders, and security leads can present scenarios, deliver timed operational injects, track discussion prompts across functional roles, and record observations for the After-Action Report (AAR).

---

## 🔄 Exercise Progression Lifecycle (HSEEP-Aligned)

```text
  [ 1. Scenario Presentation & Baseline ]
  (Threat Profile, Initial Conditions, Threat Actor Actions)
                     │
                     ▼
  [ 2. Timed Module Injects & Escalations ]
  (Inject 1: Detection -> Inject 2: Lateral Movement -> Inject 3: Extortion)
                     │
                     ▼
  [ 3. Multi-Agency / Cross-Functional Discussion ]
  (Technical Ops, Legal, Exec Comms, Logistics, Safety)
                     │
                     ▼
  [ 4. Hotwash & Evaluation Capture ]
  (Strengths, Gaps, Action Items for After-Action Report / IP)
