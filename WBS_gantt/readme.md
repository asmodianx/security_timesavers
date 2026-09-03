# WBS & Gantt Chart Tool

An interactive, browser-based project scheduling utility designed to help security leads, IT managers, and engineers decompose projects into a Work Breakdown Structure (WBS) and visualize deliverables on a dynamic Gantt chart.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Coordinating cybersecurity deployments, quarterly compliance initiatives, and infrastructure remediations requires balancing task breakdowns with clear chronological timelines. However, enterprise project management suites are often bloated for tactical planning, while manual spreadsheets quickly become cumbersome when dates shift or dependencies adjust.

The **WBS & Gantt Chart Tool** (`index.html`) provides a lightweight, client-side planning canvas directly in your browser. Users can structure project deliverables hierarchically, assign start dates and durations, define predecessor relationships, and immediately visualize timelines on an interactive Gantt chart.

---

## 📅 Planning & Scheduling Mechanics

```text
  [ Project Deliverable / WBS Phase ]
                 │
                 ├── Task 1: Scoping & Architecture Review  [===]
                 │                                              \
                 ├── Task 2: Baseline Config Deployment          [====]
                 │                                                    \
                 └── Task 3: Production Rollout & Sign-off             [===]
                                                                  Timeline ──►
