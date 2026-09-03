# WBS Assistant

An interactive, browser-based project scoping and decomposition utility designed to help security leads, IT managers, and engineers build, refine, and structure Work Breakdown Structures (WBS) directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Scoping complex security and infrastructure initiatives—such as zero trust architectures, cloud migrations, EDR rollouts, or compliance gap remediations—requires breaking ambiguous, high-level objectives into granular, manageable work packages. When scoping is done haphazardly in ad-hoc notes or cluttered spreadsheets, teams risk scope creep, missed dependencies, and inaccurate resourcing.

The **WBS Assistant** (`index.html`) provides a guided, lightweight planning canvas to systematically decompose initiatives following the standard 100% Rule. Responders, architects, and project leaders can outline deliverables, define parent-child work packages, and establish structured task hierarchies without requiring heavyweight enterprise project management suites.

---

## 🌳 Hierarchical Decomposition Architecture

The tool organizes project scope using standard hierarchical work breakdown levels:

```text
  Level 1: Project Objective / Deliverable
  │   (e.g., Enterprise EDR Deployment)
  │
  ├── Level 2: Major Phases / Work Streams
  │   ├── 1.0 Planning & Architecture Assessment
  │   ├── 2.0 Pilot Group Deployment
  │   └── 3.0 Production Fleet Rollout
  │
  └── Level 3: Work Packages / Discrete Tasks
      ├── 1.1 Define Exclusion Baselines
      ├── 1.2 Validate PKI & Network Connectivity
      ├── 2.1 Deploy to IT/Security Canary Fleet
      └── 3.1 Phased Workstation Group Enforcement
