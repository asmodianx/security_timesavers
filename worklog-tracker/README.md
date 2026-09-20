# 🛡️ InfoSec WorkLog Tracker

A standalone, offline-capable daily work-log tool for information security professionals aligned to **O\*NET occupational codes 15-1212.00 (Information Security Analysts)** and **15-1299.05 (Information Security Engineers)**. No frameworks, no CDN dependencies, no external calls — all data stays local.

---

## ✨ Features

### 📋 Task Logging
- Click any task from the left panel to open a log entry dialog
- Time auto-fills to the current time (editable)
- **Duration slider** (0–8h in 5-minute steps; 0 = open-ended)
- Optional free-text notes per entry (up to 500 characters)
- Edit or delete any logged entry inline

### 🎨 Color-Coded Task Categories

| Color | Category | O\*NET Code |
|---|---|---|
| 🔵 Blue | Information Security Analyst tasks | 15-1212.00 |
| 🟢 Green | Information Security Engineer tasks | 15-1299.05 |
| ⬛ Slate | General / Workday tasks | — |
| 🟣 Purple | Custom user-defined tasks | — |

### ⭐ Favorites
- Star any task (☆) to pin it to the top of the task list
- Favorites persist through import/export cycles

### 🎫 Ticket Flagging
- Mark ticketable tasks as **Needs Ticket** when logging
- Flagged items are called out separately in the end-of-day report
- Ticket system API integration is **stubbed** in `config.js` (not active in v1)

### 📊 Summary Tab
- Live counters: total entries, logged time, remaining workday time, ticket items
- Per-category time breakdown with visual progress bars

### 🖨️ Print / PDF Report
- Opens a print-ready browser window with:
  - Analyst name, organization, and date header
  - Summary cards (entries, logged time, remaining, ticket count)
  - Category breakdown table with percentages
  - Full chronological work log table
  - Itemized list of all ticket-flagged entries
- Use your browser's **Print → Save as PDF** to export

### ⬇️⬆️ Import / Export
- Export current session to a validated JSON file
- Import a previous session JSON with full schema validation and field sanitization
- Custom tasks and favorites are included in the export

### ➕ Custom Tasks
- Add tasks on-the-fly from the **Custom Tasks** tab (name, emoji icon, ticketable toggle)
- Pre-load custom tasks, favorites, org name, and analyst name via `config.js`
- Remove custom tasks at any time (also removes them from the log)

---

## 🗂️ File Structure

```
worklog-tracker/
├── index.html   # App shell — layout, modal, tabs, semantic HTML
├── style.css    # Full responsive stylesheet, category color system
├── app.js       # All application logic (OWASP hardened)
├── tasks.js     # 55 built-in O*NET task definitions
└── config.js    # Pre-load configuration (edit this to customize)
```

---

## 🚀 Getting Started

1. **Download** all five files into the same folder.
2. **Open** `index.html` in any modern browser (Firefox, Chrome, Edge, Safari).
3. *(Optional)* Edit `config.js` to set your name, organization, default favorites, and pre-loaded custom tasks before opening.

> No web server required. The app runs entirely from the local filesystem (`file://`).

---

## ⚙️ Configuration (`config.js`)

Edit `config.js` to customize the app before first use:

```js
const WORKLOG_CONFIG = {
  appTitle:     "InfoSec WorkLog Tracker",
  orgName:      "Your Org Name",        // shown in header and reports
  analystName:  "Jane Smith",           // pre-fills the analyst name field
  workdayHours: 8,                      // used for "remaining time" calculations

  // Pre-load custom tasks
  customTasks: [
    { id: "custom_rd",    label: "R&D / Research",  category: "custom", icon: "🔬" },
    { id: "custom_bench", label: "Bench Time",       category: "custom", icon: "🪑" }
  ],

  // Pre-set favorite task IDs (built-in or custom)
  defaultFavorites: ["gen_clockin", "gen_clockout", "gen_meeting"],

  // Ticket system API stub (set enabled: true to activate in a future revision)
  ticketSystem: {
    enabled:  false,
    provider: "servicenow",   // "servicenow" | "jira" | "freshdesk" | "generic"
    baseUrl:  "https://your-instance.service-now.com",
    apiPath:  "/api/now/table/incident",
    authType: "bearer"        // "bearer" | "basic" | "apikey"
  }
};
```

---

## 📋 Built-in Task Coverage

### General / Workday (15 tasks)
Clock In, Clock Out, Break, Lunch, Meeting, Stand-up/Scrum, Admin Time, Email/Communications, Transitioning Tasks, Documentation, Training, Onboarding/Mentoring, Queue/Ticket Triage, Project Planning, Bench/Idle Time

### Analyst — 15-1212.00 (20 tasks)
Risk Assessment, Vulnerability Management, Incident Response, SIEM Alert Triage, Phishing Analysis, Firewall/Encryption Configuration, Access Management, Virus/Malware Monitoring, Policy Review, Security Awareness Training, Data Protection Planning, Threat Intelligence/CTI, Compliance Review (FERPA/HIPAA/PCI/NIST), Log Analysis, Vendor Coordination, Digital Forensics, Security Reporting, Endpoint Detection & Response, Cloud Security Review, IAM Review

### Engineer — 15-1299.05 (20 tasks)
Penetration Testing, Vulnerability Assessment, Security Architecture Design, Policy/Standards Development, Security Tool Development/Scripting, Firewall/Encryption Build, Network/System Monitoring, Breach Investigation, Incident Recovery Strategy, Security Control Assessment, Risk Identification & Mitigation, Security Software Installation, Technical Support, OS/System Hardening, Detection Engineering/SIEM Rules, Security Documentation, Management Briefings, SIEM Deployment/Log Onboarding, RBAC/IAM Management, Threat Modeling

---

## 🔒 Security & OWASP Compliance

This application follows OWASP secure coding best practices for client-side JavaScript:

| Practice | Implementation |
|---|---|
| No XSS via DOM | All user data written via `textContent`; no `innerHTML` with user input |
| Input validation | All fields validated before use; length limits enforced |
| Import sanitization | Imported JSON is schema-validated and all fields sanitized before applying to state |
| No `eval()` | Not used anywhere in the codebase |
| No inline handlers | All event listeners attached programmatically via `addEventListener` |
| CSP-compatible | No inline scripts or styles; all JS/CSS loaded as external files |
| No CDN dependencies | Fully self-contained; no external network requests |
| File size limits | Import capped at 2MB; note fields capped at 500 characters |

> **Recommended server headers** (if served via a web server rather than `file://`):
> ```
> Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none';
> X-Content-Type-Options: nosniff
> X-Frame-Options: SAMEORIGIN
> ```

---

## 🎫 Ticket System Integration (v1 Stub)

The ticket creation API is architected but **not active** in this revision. To prepare for v2 integration:

1. Flag log entries as **🎫 Needs Ticket** while logging
2. They appear in the Summary tab counter and the Print Report's flagged section
3. When ready to integrate, set `ticketSystem.enabled = true` in `config.js` and fill in your provider details

Planned support: **ServiceNow**, **Jira**, **Freshdesk**, and generic REST APIs.

---

## 📁 Import / Export Format

Session files are standard JSON with the following structure:

```json
{
  "_version": "1.0",
  "_app": "WorkLog Tracker",
  "date": "2026-09-20",
  "analystName": "Jane Smith",
  "entries": [
    {
      "id": "entry_...",
      "taskId": "an_siemalert",
      "label": "SIEM Alert Triage & Investigation",
      "category": "analyst",
      "icon": "📡",
      "time": "09:15",
      "duration": 45,
      "note": "Investigated 3 medium alerts, 1 escalated",
      "needsTicket": true,
      "ticketable": true,
      "timestamp": 1758000000000
    }
  ],
  "favorites": ["gen_clockin", "gen_clockout"],
  "customTasks": []
}
```

---

## 🖥️ Browser Compatibility

| Browser | Support |
|---|---|
| Firefox 90+ | ✅ Full |
| Chrome / Edge 90+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Opera 80+ | ✅ Full |

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🤝 Contributing

Pull requests welcome. When contributing:
- Maintain zero CDN dependencies
- Follow OWASP client-side security guidelines
- Use `textContent` (never `innerHTML` with user-supplied data)
- Validate all new input fields before use

---

*Built for information security professionals. O\*NET task data sourced from [O\*NET OnLine](https://www.onetonline.org/) (15-1212.00 & 15-1299.05).*
