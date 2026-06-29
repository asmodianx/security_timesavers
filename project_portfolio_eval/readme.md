# Project Portfolio Management Wizard

A standalone, local HTML/JavaScript utility for basic project portfolio intake, scoring, prioritization, risk tracking, decision logging, JSON import/export, and printable project/portfolio reports.

This application is designed to run locally in a browser with **no CDN dependencies, no external JavaScript libraries, and no network connectivity requirements**.

---

## Purpose

The Project Portfolio Management Wizard helps collect and organize project portfolio information, including:

- Project and portfolio identifiers
- Project metadata and ownership
- Target and actual start/completion dates
- Business case information
- Mission, vision, strategic, and balanced scorecard alignment
- Time/cost analysis fields
- Resource availability by category and group
- Risk register entries
- Project scoring and prioritization
- Approval, rejection, delay, and lifecycle status tracking
- Project and portfolio reporting

The tool is intended for lightweight local portfolio planning, intake discussions, draft analysis, and structured project review preparation.

---

## Features

### Project Intake and Metadata

Each project can be tracked with:

- Project ID
- Portfolio ID
- Project name
- Sponsor
- Business owner
- Project manager
- Department or unit
- Project type
- Priority
- Lifecycle stage
- Health/status indicators
- Notes and supporting metadata

---

### Business Case and Charter Inputs

The wizard includes fields for:

- Project description
- Problem or opportunity statement
- Mission alignment
- Vision alignment
- Measurable objectives
- In-scope work
- Out-of-scope work
- Deliverables
- Success metrics / KPIs
- Assumptions
- Constraints

---

### Time and Cost Analysis

The application includes planning fields for:

- Target begin date
- Target completion date
- Actual begin date
- Actual completion date
- Estimated one-time cost
- Annual operating cost
- Estimated benefit/value
- Cost avoidance
- NPV / net value
- ROI %
- Payback months
- Schedule confidence

Each major time/cost field includes embedded help text with suggested calculation guidance.

---

### Selection Criteria and Scoring

Projects can be evaluated using weighted scoring criteria, including:

- Mission alignment
- Vision alignment
- Strategic objective fit
- Regulatory / policy compliance
- Customer / stakeholder value
- Financial value / cost avoidance
- Internal process improvement
- Learning, growth, and innovation
- Risk reduction
- Technical feasibility
- Resource availability fit
- Urgency / deadline criticality

The tool calculates:

- Total weighted score
- Maximum possible weighted score
- Weighted score percentage
- Recommended portfolio decision category

---

### Resource Availability

The resource section tracks general capacity and demand by category, including:

- Project Management
- Business Analysis
- Application Development
- Infrastructure
- Security / Compliance
- Data / Reporting
- Operations
- Training / Change Management
- Vendor / Contractor
- Subject Matter Experts

For each resource category, the tool tracks:

- Resource category
- Group/team
- Available FTE
- Required FTE
- Calculated FTE gap
- Notes

---

### Risk Register

The risk register supports multiple risks per project.

Each risk entry includes:

- Risk ID
- Description
- Category
- Probability
- Impact
- Calculated risk score
- Response strategy
- Owner
- Due date
- Status
- Mitigation plan

The tool also calculates:

- Overall project risk score
- Total risk register score

---

### Project Decision Tracking

Projects may be marked as:

- Proposed
- Approved
- Rejected
- Delayed
- In Progress
- Completed
- On Hold

The decision section includes:

- Decision status
- Decision date
- Decision maker / governance body
- Decision rationale

---

### Dashboard

The dashboard provides a portfolio-level view with:

- Total project count
- Approved project count
- Delayed / on-hold project count
- Average score
- Project status list
- Status filtering
- Portfolio ID filtering
- Search
- Individual project delete buttons

---

### Import and Export

The application supports:

- Exporting project portfolio data to JSON
- Importing previously exported JSON files
- Browser-local draft saving using `localStorage`

---

### Reports and PDF Output

Reports are generated using the browser print dialog.

Available report views include:

- Selected project report
- Project status list
- Portfolio status list

To create a PDF:

1. Open the desired report.
2. Click the appropriate print button.
3. In the browser print dialog, choose **Save as PDF**.

---

## How to Use

1. Download the HTML file.
2. Open it locally in a modern browser such as Microsoft Edge, Chrome, or Firefox.
3. Click **New Project** to create a project.
4. Use the wizard steps on the left side to enter project information.
5. Review scoring, risks, resources, and recommendations.
6. Use the dashboard to filter, review, or delete projects.
7. Export JSON when you need a portable copy of the data.
8. Use the print buttons to generate PDF reports.

---

## Local-Only Design

This tool is designed as a standalone browser-based utility.

It does not require:

- A web server
- A database
- Node.js
- npm
- CDN libraries
- External JavaScript libraries
- Internet access

All application logic is contained in the single HTML file.

---

## Security Notes

This tool includes several basic hardening controls:

- No external network dependencies
- No CDN references
- No external JavaScript libraries
- No `eval()` or `new Function()` usage
- Basic Content Security Policy meta tag
- Input normalization
- Output encoding
- JSON import size limit
- Allow-list validation for controlled values
- Numeric value clamping for scoring and risk inputs

However, this is still a local browser utility and should not be treated as a hardened enterprise application.

---

## Storage Security Disclaimer

This application stores browser draft data using `localStorage` when the **Save Browser Draft** button is used.

`localStorage` is not encrypted by this application and should not be considered secure storage. Data saved in browser storage may be accessible to anyone with access to the user profile, browser profile, device, backups, or forensic artifacts.

Do **not** store confidential, regulated, sensitive, classified, contractual, financial, student, personnel, health, security-sensitive, or otherwise restricted data in this tool unless your organization has reviewed and approved that use.

For official or sensitive records, export the JSON file and store it only in an approved location according to applicable organizational data handling, records retention, privacy, and security requirements.

---

## Calculation and Best-Practice Disclaimer

This application includes project scoring, risk scoring, time/cost guidance, ROI guidance, payback guidance, and portfolio recommendation logic.

These calculations are intended as lightweight planning aids only. They may not reflect your organization’s required financial, accounting, project management, governance, risk management, or portfolio management standards.

All formulas, scoring models, prioritization logic, risk thresholds, resource calculations, and recommendation outputs should be independently reviewed and validated by qualified personnel before being used for actual decision-making.

Because this application includes AI-generated code and AI-assisted calculation guidance, users should independently verify that all calculations are accurate, appropriate, and consistent with current best practices, organizational policy, and applicable governance standards.

Do not rely on the tool as the sole basis for project approval, rejection, delay, budget prioritization, risk acceptance, or resource allocation decisions.

---

## AI-Generated Code Disclaimer

This application was generated with AI assistance.

Before production or official use, the code should be independently reviewed for:

- Functional correctness
- Security risks
- Data handling requirements
- Accessibility
- Browser compatibility
- Calculation accuracy
- Project management methodology alignment
- Compliance with organizational standards
- Compliance with applicable laws, policies, and contractual requirements

Use of this tool is at the user’s discretion and should be governed by local review and approval processes.

---

## Recommended Review Before Use

Before using this tool in an operational setting, review and customize:

- Project scoring criteria
- Criterion weights
- Risk probability and impact scales
- Risk thresholds
- Approval/rejection/delay recommendation logic
- Resource categories
- Portfolio metadata fields
- Cost and benefit formulas
- ROI guidance
- Payback guidance
- NPV / net value guidance
- Report fields
- Data retention expectations
- Storage and export procedures

---

## JSON Data Handling

The JSON export contains the project portfolio information entered into the tool.

Treat exported JSON files according to the sensitivity of the data they contain.

Recommended handling practices:

- Store exported JSON only in approved locations.
- Do not email exported JSON if it contains sensitive information.
- Do not upload exported JSON to unapproved systems.
- Apply appropriate access controls.
- Retain or dispose of exported data according to records retention requirements.
- Review JSON content before sharing.

---

## Browser Compatibility

The tool is intended for current versions of modern browsers, including:

- Microsoft Edge
- Google Chrome
- Mozilla Firefox

Because it is a local HTML/JavaScript utility, behavior may vary depending on browser security settings, local file restrictions, and enterprise browser policies.

---

## Known Limitations

- No multi-user collaboration
- No authentication
- No role-based access control
- No server-side validation
- No database backend
- No encryption of browser draft data
- No automatic synchronization
- No authoritative financial model
- No formal project governance workflow engine
- No audit logging beyond exported/local data
- No guarantee that scoring or recommendations match organizational standards

---

## Suggested Workflow

1. Create or import a project portfolio.
2. Enter project metadata and business case details.
3. Enter time, cost, benefit, and resource estimates.
4. Score each project using agreed-upon criteria.
5. Add risks to the risk register.
6. Review calculated score, risk, and resource gap.
7. Record the governance decision.
8. Export JSON for recordkeeping.
9. Print/save reports as PDF as needed.
10. Store exported records according to approved procedures.

---

## File Structure

This application is distributed as a single HTML file:

```text
project_portfolio_management_wizard_v4_dashboard_delete.html
