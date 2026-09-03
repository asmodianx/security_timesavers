# Project Cost Calculator

A lightweight, browser-based financial evaluation and project budgeting tool designed to help security leads, IT managers, and project managers model costs, forecast expenses, and calculate project ROI directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

Building business cases for security tools, infrastructure upgrades, or compliance projects requires clear financial metrics to justify expenditures to leadership. Relying on complex spreadsheet models or enterprise accounting software for early-stage estimates often introduces unnecessary friction.

The **Project Cost Calculator** (`index.html`) provides a streamlined, client-side interface to project expenditures over time, factor in capital and operational expenses, and evaluate financial viability metrics (such as Net Present Money / NPV, cash flows, and payback periods) instantly without manual formula errors.

---

## ✨ Features

- **Comprehensive Expense Modeling:** Account for initial capital expenditures (CapEx), recurring operational expenses (OpEx), software licensing, infrastructure, and ongoing labor/consulting fees.
- **Dynamic Financial Metrics:** Calculate running totals, Net Present Money (NPM/NPV) with customizable discount rates, and payback horizons in real time.
- **Zero Dependencies:** Pure vanilla HTML, CSS, and JavaScript. No build tools, external styling libraries, or backend databases required.
- **Strictly Local & Confidential:** Internal budget figures, staff labor rates, and vendor quotes remain entirely in local browser memory—never sent to external analytics or cloud services.
- **Immediate Iteration:** Adjust variables like project duration, annual maintenance increases, or team allocation on the fly to review best-case and worst-case budget scenarios.

---

## 🚀 Getting Started

### Option 1: Direct File Access (Fastest)

1. Clone the repository:
   ```bash
   git clone [https://github.com/asmodianx/security_timesavers.git](https://github.com/asmodianx/security_timesavers.git)
   cd security_timesavers/project_cost_calc
