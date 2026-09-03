# FEMA ICS Operational Planner & Org Builder

An interactive, browser-based Incident Command System (ICS) planning and organizational chart utility aligned with FEMA National Incident Management System (NIMS) principles.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

During major security incidents, disasters, or cross-functional crises, technical teams frequently need to interface with broader emergency management frameworks. The Incident Command System (ICS)—standardized by FEMA under NIMS—provides a proven organizational structure for command, control, and coordination of response efforts.

The **FEMA ICS Planner** (`index.html`) gives incident commanders, security leads, and exercise planners an interactive workspace to assemble command structures, assign staff across primary functional sections, and track key incident objectives without complex software or cloud dependencies.

---

## 🏛️ Standard ICS Structure Coverage

The utility models the modular hierarchy defined by FEMA NIMS:

```text
                  +-----------------------------------+
                  |         Incident Commander        |
                  |          (or Unified Command)     |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
  +---------+---------+   +---------+---------+   +---------+---------+
  |    Public Info    |   |   Safety Officer  |   |  Liaison Officer  |
  |      Officer      |   |                   |   |                   |
  +-------------------+   +-------------------+   +-------------------+
                                    |
      +-----------------------------+-----------------------------+
      |                             |                             |                             |
+-----+-----+                 +-----+-----+                 +-----+-----+                 +-----+-----+
| Operations|                 |  Planning |                 | Logistics |                 |Finance/Admin|
|  Section  |                 |  Section  |                 |  Section  |                 |  Section  |
+-----------+                 +-----------+                 +-----------+                 +-----------+
