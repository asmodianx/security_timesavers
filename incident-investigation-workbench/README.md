# Incident Investigation Workbench

An offline, single-folder browser application for running a security incident investigation through the
NIST incident response lifecycle, from first report to signed case file. Built for security analysts,
engineers and managers working on managed devices with ordinary user rights, no admin rights, and possibly
no Internet connection.

Part of the **Security Time Savers** toolkit. Evolved from CTI Workbench Wizard v2.2.1.

- Plain HTML, CSS and JavaScript. No build step, no framework, no server, no CDN.
- Runs from a local folder (`file://`) or any static web server.
- Makes no network requests. The Content Security Policy blocks them (`connect-src 'none'`).
- Markdown notes on every phase, and Markdown notes that can be registered as hashed evidence.
- Imports and exports OASIS STIX 2.0, native case JSON and MISP event JSON.
- Prints reports to PDF through the browser.
- Signs case files with OpenPGP detached signatures that `gpg --verify` accepts.

---

## Quick start

1. Copy the `incident-investigation-workbench` folder to the workstation.
2. Put OpenPGP.js 6.3.2 at `vendor/openpgp/openpgp.min.js` (see [vendor/openpgp/README.md](vendor/openpgp/README.md)).
   It is not shipped in this package. Without it, everything except signing works.
3. Open `index.html` in Microsoft Edge, Google Chrome or Mozilla Firefox.
4. Work through the numbered tabs. Each card is a numbered task.
5. Use **Save case file** in the header whenever you need a durable copy.

| Header button | Purpose |
|---|---|
| **New case** | Start an empty case. The previous case stays in browser storage. |
| **Open case file…** | Open a saved case (`.json`). Earlier Workbench files and CTI Workbench v2.2.1 projects are converted. |
| **Save case file** | Download the whole case as native Security Time Savers JSON. |

Every change is autosaved to browser storage. Browser storage is for recovery only; it is **not** a secure
evidence repository.

---

## Workflow: NIST incident response lifecycle

The tabs follow NIST SP 800-61. Rev. 2's four phases group the tabs, and each tab names the CSF 2.0
Functions/Categories that SP 800-61 Rev. 3 (April 2025) maps incident response onto. Communication is
cross-cutting, so it has its own tab you can use at any time. **Every tab ends with a Phase notes task.**

| Phase (SP 800-61 Rev. 2) | Tab | CSF 2.0 | Tasks |
|---|---|---|---|
| Preparation | **1 Prepare** | GV / ID / PR | 1.1 Case record · 1.2 Contacts · 1.3 Communication plan and obligations · 1.4 Lifecycle overview · 1.5 Cases in this browser · 1.6 Diagnostics · 1.7 Phase notes |
| Detection & Analysis | **2 Detect** | DE.CM, DE.AE | 2.1 Initial report · 2.2 Register evidence files · 2.3 Markdown note as evidence · 2.4 Screenshot · 2.5 Chain of custody · 2.6 Extract indicators · 2.7 Import external intelligence · 2.8 Text utilities · 2.9 Evidence register · 2.10 Phase notes |
| | **3 Scope & Timeline** | RS.AN | 3.1 Add entity · 3.2 Review entities · 3.3 Relationships · 3.4 Add event · 3.5 CSV import · 3.6 Review timeline · 3.7 Phase notes |
| | **4 Assess** | RS.AN, RS.MA | 4.1 Analytical question · 4.2 Hypotheses · 4.3 Evidence matrix · 4.4 Information gaps · 4.5 Categorize, prioritize and declare · 4.6 Phase notes |
| Containment, Eradication & Recovery | **5 Contain** | RS.MI | 5.1 Findings · 5.2 Strategy and decisions · 5.3 Containment actions · 5.4 Tasks · 5.5 Phase notes |
| | **6 Eradicate & Recover** | RS.MI, RC.RP | 6.1 Eradication actions · 6.2 Recovery actions · 6.3 Status, validation and closure · 6.4 Phase notes |
| Throughout | **7 Communicate** | RS.CO, RC.CO | 7.1 Notifications and obligations · 7.2 SITREP · 7.3 Phase notes |
| Post-Incident Activity | **8 Close & Improve** | ID.IM | 8.1 Conclusion · 8.2 Lessons learned · 8.3 Evidence retention · 8.4 Reports · 8.5 Share indicators · 8.6 Sign · 8.7 Verify · 8.8 Phase notes |

Each tab ends with **Back** and **Next**, so it works as a wizard or for free navigation.

### Lifecycle tracking
- **Case status** uses lifecycle values: Reported, Triage, Analysis, Containment, Eradication, Recovery,
  Post-incident review, Closed, Reopened. The header shows status, phase and severity.
- Status only moves **forward** automatically: declaring an incident (4.5) moves Reported/Triage to Analysis;
  adding containment, eradication or recovery actions moves the case to that phase; saving the conclusion moves
  it to Post-incident review, or to Closed if you tick the box. You can always set status manually in 1.1.
- **Times** fill in only when empty: declaring sets Discovered (from 2.1) and Declared; completing a
  containment action sets Contained; closing sets Closed. All remain editable in 1.1.
- **1.4 Lifecycle overview** shows progress for each phase.

---

## Notes

### Phase notes (last task on every tab)
- Add as many notes as you need to each phase. Each has a title, author and Markdown body.
- **Preview** before saving; **Edit** later (the created time is kept and an edited time is shown);
  **Delete**; or **Download .md**.
- Notes are listed oldest first and rendered as formatted Markdown. The task heading shows the count.
- Each note records its tab and NIST phase. Technical and full-case reports include all phase notes, grouped by phase.

### Markdown note as evidence (2.3)
For observations that are evidence in their own right: interview notes, console output, what you saw on screen.
- Write and preview the note, then **Hash and register as evidence**. The SHA-256 of the note's UTF-8 text is
  recorded, it appears in the evidence register (2.9) as type *Markdown note*, and a `created` custody record is added.
- Unlike evidence files, the note's text is stored in the case, because you wrote it.
- **It cannot be edited once registered**: editing would invalidate the hash. Record corrections as a new note.
- In 2.9, **View** renders it and **Download .md** saves it. The downloaded file's hash matches the register:
  `shasum -a 256 file.md`.
- It can be assessed against hypotheses (4.3) and linked to findings like any other evidence. The evidence
  manifest and full-case reports include its content.

### Supported Markdown
Headings (`#`), **bold**, *italic*, ~~strikethrough~~, `inline code`, fenced code blocks, `>` quotes,
bulleted and numbered lists, `- [ ]` / `- [x]` checklists, pipe tables and `---` rules.

Rendering is built element by element with text nodes. HTML typed into a note (including `<script>` or
`<img onerror>`) is displayed as text and never executed. Links are shown as text with the URL beside them and
are not clickable, so nothing navigates away or loads from the network. Each note is limited to 1 MiB.

---

## The tabs in detail

**1 Prepare.** Case record and lifecycle times; contacts (role, organization, details, when to notify); the
communication and escalation plan; systems in scope; notification obligations with a deadline in hours after discovery.

**2 Detect.** Initial report (source, reporter, first detected time, description). Evidence files are hashed with
SHA-256 in the browser; **file contents are never stored in the case**, only the hash and metadata. Registration
creates the first custody record. Artifact extraction parses `.eml` headers and records name, size and hash for any
file. STIX 2.0 bundles or MISP events can be validated and merged. Text utilities (defang, refang, URL and Base64) run locally.

**3 Scope & Timeline.** Entities with CTI attributes and relationships. Timeline events keep the original value and a
normalized UTC time. CSV import reads the header row, suggests a mapping (`TimeGenerated` → Timestamp, `DeviceName` →
Entity), previews, then commits. Limits: 10 MiB, 5,000 rows per import.

**4 Assess.** A competing-hypotheses matrix with reliability, quality, relevance and reasoning for each assessment,
plus information gaps. 4.5 records the determination (under assessment / event / incident declared), attack vector,
and the SP 800-61 Rev. 2 functional impact, information impact and recoverability categories. It suggests a severity
but never sets it.

**5 Contain and 6 Eradicate & Recover.** Findings, decisions tagged by phase, and separate action lists for
containment, eradication and recovery. Recovery actions record how success will be verified. 6.3 tracks every
finding, action and task with editable status, verification and closure notes. Actions are tracked, never executed.

**7 Communicate.** A notification log. Linking a notification to an obligation from 1.3 shows pending, met, met late
or **overdue**. SITREP snapshots are kept as a history and can be printed.

**8 Close & Improve.** Disposition and confidence; lessons learned with improvement actions; response metrics (time
to detect, declare, contain, close); evidence retention. Reports: executive, technical, SITREP, evidence manifest,
findings, post-incident review and full case, printed to PDF through the browser. Indicators export as STIX 2.0 or
MISP. Sign the final case file last.

STIX 2.0 export puts entities with a cyber-observable equivalent (IP, domain, URL, email address, file, user account)
in `observed-data`, linked by `relationship` objects, plus case indicators. Investigation records such as custody,
tasks, notes and SITREPs have no faithful STIX equivalent and stay in the case file. Local STIX validation is
structural, not a replacement for the official OASIS validator.

---

## Signing and verification

Signatures are OpenPGP **detached** signatures over the exact bytes of a case file. They prove which key signed the
file and that it has not changed. They do not encrypt it.

**Sign (8.6)**
1. Export your secret key: `gpg --export-secret-keys --armor YOUR_KEY_ID > signing-key.asc` (binary `.gpg` works too).
2. Step 1: choose that file, enter its passphrase, **Load key**. The fingerprint and user ID are shown.
3. Step 2: **Sign case snapshot**. The case is captured once, signed, checked against the key, and then the
   secret key and passphrase are cleared.
4. Step 3: download **both** files, `CASE-signed-<time>.json` and `CASE-signed-<time>.json.asc`.

Do not pair the signature with a file from **Save case file**: any edit after signing changes the bytes.

**Verify (8.7)**: choose the case file, the `.asc` (or binary `.sig`) and the signer's public key. The result shows
GOOD or BAD, signing time, key ID, fingerprint and the file's SHA-256. Command line:

    gpg --verify CASE-signed-<time>.json.asc CASE-signed-<time>.json

Confirm the fingerprint belongs to the expected person through a trusted channel. See [CRYPTOGRAPHY.md](CRYPTOGRAPHY.md).

---

## Native case format

`security-timesavers-case`, `format_version` 1.0. Structural schema: [sts-case-schema.json](sts-case-schema.json).

    case, preparation, detection, categorization, lessons, retention, conclusion,
    contacts, obligations, rootAttributes, entities, evidence (files and markdown notes), custody,
    events, indicators, relationships, hypotheses, information_gaps, findings, tasks,
    actions (with phase), decisions (with phase), notifications, notes, sitreps, history, extensions

Files from earlier builds open normally: missing sections are added and old status values are mapped
(New → Reported, Investigation → Analysis, Remediation → Eradication, Monitoring → Recovery).

---

## Security design

- Strict CSP: scripts and styles only from the application folder; no inline script or style; no frames,
  objects, form posts or network connections.
- All case data, including rendered Markdown, is written with `textContent`, text nodes and `createElement`.
  No `innerHTML`, `eval` or `new Function`.
- JSON imports are limited to 4 MiB, 32 levels and 100,000 values; `__proto__`, `prototype` and `constructor`
  keys are rejected. Notes are limited to 1 MiB each.
- Imports are validated and previewed before they change the case.
- Evidence files are hashed, not stored. Signing keys are read from a file, used in memory and cleared.

Details: [SECURITY.md](SECURITY.md).

---

## Project structure

    index.html                 Shell, tabs and tasks, CSP
    css/app.css, css/print.css Screen and report/PDF styles
    js/util.js                 DOM and data helpers, module registry
    js/hardening.js            Hostile-input limits and self-tests
    js/model.js                Case model, normalisation, migration, metrics, serializer
    js/storage.js              Browser storage (autosave and recovery)
    js/prepare.js              1.2-1.3 contacts, plan, obligations
    js/evidence.js             2.2, 2.4-2.6, 2.8-2.9 evidence, custody, extraction, utilities
    js/notes.js                Markdown renderer, 2.3 evidence notes, phase notes on every tab
    js/exchange.js             2.7 import, 8.5 export
    js/entities.js             3.1-3.3
    js/timeline.js             3.4-3.6
    js/analysis.js             4.1-4.4, 5.2 decisions
    js/lifecycle.js            2.1, 4.5, 7.1, 8.2, 8.3
    js/response.js             5.1, 5.3-5.4, 6.1-6.3
    js/reporting.js            7.2 SITREP, 8.1 conclusion, 8.4 reports
    js/signing.js              8.6-8.7
    js/app.js                  Header, 1.1, 1.4-1.6, autosave, start-up (loaded last)
    vendor/openpgp/            Place OpenPGP.js here; checksum and instructions
    tests/                     Browser-console cases, Node smoke test, acceptance checklist
    sts-case-schema.json       Native format schema

Feature modules register with `IW.modules`; `app.js` starts them in order. If one fails to load, the others still
run and the status bar names the failed feature.

---

## Testing

- **In the app:** task 1.6.
- **Maintainers:** `node tests/dev/smoke.js` (Node 20+) drives every tab through a minimal DOM stub: 76 checks
  including notes, Markdown safety, evidence-note hashing, hostile imports, CSV mapping, STIX round trip, save/open
  round trip, legacy import and signed-bytes-equal-downloaded-bytes. It uses a mock OpenPGP object, so real signing
  must be checked in a browser.
- **Browser acceptance:** [tests/README.md](tests/README.md).

## Browser support
Current managed releases of Edge, Chrome and Firefox. Safari 15+ expected to work. Screen capture (2.4) may be
blocked from `file://`.

## Limitations
Not a SIEM, EDR, scanner, packet-capture tool, malware sandbox, SOAR executor, forensic imager, evidence vault or
multi-user case system.

## Third-party component
OpenPGP.js 6.3.2 (LGPL-3.0), vendored locally for signing and verification only.

## Licence
Follow the licence of the Security Time Savers repository.
