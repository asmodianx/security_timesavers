# Incident Post-Mortem & Root Cause Analysis Tool

An interactive, browser-based incident review and root cause analysis (RCA) utility designed to help security leads, incident responders, and engineering teams conduct blameless post-mortems, establish chronological timelines, and document corrective actions directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

The conclusion of an incident is where the most valuable security improvements occur. However, post-incident reviews often struggle with inconsistent reporting formats, disorganized timelines, finger-pointing, or unassigned remediation items that get forgotten once services recover.

The **Post-Mortem Tool** (`index.html`) provides a structured, client-side retrospective environment aligned with industry blameless post-mortem practices. Responders and technical leads can reconstruct incident timelines, run root cause analyses (such as the 5 Whys), capture contributing factors, and establish clear, assignable action items—all without enterprise software lock-in or sending sensitive incident notes to external cloud services.

---

## 🔄 Post-Mortem Workflow Lifecycle

```text
  [ 1. Incident Overview & Impact Assessment ]
  (Severity, Systems Affected, Detection Source, Business Impact)
                        │
                        ▼
  [ 2. Chronological Timeline Reconstruction ]
  (T0: Trigger -> T1: Detection -> T2: Containment -> T3: Recovery)
                        │
                        ▼
  [ 3. Root Cause & Contributing Factor Analysis ]
  (5 Whys / Ishikawa Diagram / Process & Technical Failures)
                        │
                        ▼
  [ 4. Lessons Learned & Corrective Action Items ]
  (Preventative Controls, Detection Upgrades, Assigned Owners)
