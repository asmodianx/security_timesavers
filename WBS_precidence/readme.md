# WBS & Precedence Diagram Utility

An interactive, browser-based project planning tool designed to construct Work Breakdown Structures (WBS) and visualize activity precedence networks directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Executing complex security implementations—such as enterprise IAM modernizations, SIEM/SOAR migrations, or segmentation architectures—requires strict task sequencing and dependency mapping. A delay in an upstream milestone (like firewall rule deployment or PKI issuance) immediately impacts downstream tasks.

The **WBS & Precedence Diagram Utility** (`index.html`) gives security architects, IT leads, and technical project managers a streamlined workspace to break projects down into hierarchical work packages, define logical predecessors, and map dependency paths to surface project critical paths and sequencing bottlenecks.

---

## 🔄 Precedence Mapping Concepts

The tool supports standard activity-on-node sequencing logic to establish clear execution relationships:

```text
  [ Task A: Requirements & Scope ]
                 |
                 v
     [ Task B: PKI / Auth Setup ]
        /                   \
       v                     v
  [ Task C: Agent Rollout ]   [ Task D: Ingestion Rules ]
       \                     /
        v                   v
     [ Task E: Full Production Cutover ]
