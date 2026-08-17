# Nonprofit Risk Assessment Wizard

A standalone, browser-based application that guides a general-purpose nonprofit organization through a structured cybersecurity risk assessment and engagement workflow.

The wizard combines intake, threat modeling, attack-surface discovery, control assessment, exposure scoring, action planning, engagement tracking, and report generation in one portable HTML file. It can be opened locally, hosted as a static webpage, or embedded in an iframe. No server, build process, CDN, external library, or network connection is required.

## Purpose

The application is designed to help a nonprofit organization:

- Identify likely threat actors and failure scenarios.
- Determine which information, systems, and capabilities are most important to protect.
- Inventory domains, systems, vendors, accounts, administrators, and publicly exposed information.
- Assess the implementation of 20 foundational security controls.
- Calculate a relative exposure index across 16 modeled attack paths.
- Determine the organization's current maturity tier.
- Identify three prioritized, practical remediation actions.
- Assign action owners and target dates.
- Produce a concise assessment report for leadership or board review.
- Save progress manually, export results, and reassess using the same model later.

## Application Sections

1. **Start or Resume**
   - Begin a new assessment.
   - Resume a manually saved browser copy.
   - Import a previous JSON export.
   - Review privacy and assessment-scope notices.

2. **Intake**
   - Record the organization's mission, size, internal owner, technology support model, assessment trigger, and 90-day objective.
   - Identify conditions that may require referral, specialized assessment, or incident response.

3. **Threat Model**
   - Rate five potential sources of harm.
   - Identify sensitive or mission-critical assets.
   - Select organizational “crown jewels.”
   - Develop realistic money, data-loss, and system-outage scenarios.
   - Document the most likely, most damaging, and least-prepared-for outcomes.

4. **Attack Surface**
   - Review domains, registrars, expiration risks, email hosting, and email authentication.
   - Inventory systems, vendors, users, administrators, and access.
   - Review publicly available organizational information.
   - Identify shared credentials, incomplete offboarding, excessive administrator access, and single-person dependencies.
   - Provide private security checklists for leadership and other personnel who can move money.

5. **Controls and Exposure Score**
   - Assess 20 controls using **Yes**, **No**, **Not sure**, or **Not applicable**.
   - Apply organizational context adjustments.
   - Calculate the exposure index and path status.
   - Determine the highest fully completed maturity tier.

6. **Results and Action Plan**
   - Display the exposure index, paths closed, and maturity tier.
   - Generate three prioritized remediation recommendations.
   - List questions requiring follow-up with an IT provider or internal owner.
   - Assign owners, 90-day review dates, and six-month reassessment dates.

7. **Engagement Runbook**
   - Track intake, kickoff, self-assessment, advisor review, readout, 90-day follow-up, and six-month reassessment.
   - Reinforce scope boundaries for an advisory engagement.
   - Provide review and pre-engagement checklists.

8. **Report and Export**
   - Generate a structured assessment report.
   - Export the complete assessment as JSON.
   - Print the report or save it as a PDF through the browser.
   - Copy report text for use in another document.
   - Erase the locally saved browser copy.

## Exposure Model

The application implements model version **1.0**, containing:

- 16 attack paths.
- 20 security controls.
- Four maturity tiers, from **Tier 0 — Survive** through **Tier 3 — Sustain**.
- Context adjustments for online donations, client records, large payments, account count, and personal or mixed email use.
- Multiplicative control reductions to account for overlapping protections.
- A residual-risk floor of 8 percent for each attack path.
- Path classifications of **Open**, **Reduced**, or **Closed**.
- Priority ranking based on modeled exposure reduction, implementation time, and cost.

The exposure index is relative to the assessed organization's own unmitigated baseline. It is not a breach probability, audit grade, certification, or valid basis for comparing one organization with another.

## Manual Progress Saving

The application does **not** autosave.

Responses remain in memory while the page is open. To store the current assessment in the browser, select:

> **Save my progress so far**

This button is the only application action that writes the assessment to browser local storage.

Additional behavior:

- Moving between sections does not save automatically.
- Typing does not write to browser storage.
- Exporting JSON does not create or update the browser's saved copy.
- Importing JSON loads the assessment into memory but does not save it locally.
- Closing or refreshing the page before manually saving may discard changes made since the last save.
- Only one saved browser copy is maintained for the application and browser profile.

## Running the Application

### Run Locally

1. Download `nonprofit-risk-assessment-wizard-manual-save-final.html`.
2. Open the file in a current web browser.
3. Complete the assessment.
4. Select **Save my progress so far** periodically.
5. Export a JSON copy for backup or transfer.

No installation or internet connection is required.

### Host as a Static Webpage

Place the HTML file on a static web server and open it through its URL. No server-side application logic is required.

When hosted, use HTTPS and configure appropriate HTTP response headers at the web server or hosting platform. The HTML file includes a restrictive Content Security Policy, but server-delivered security headers provide stronger and more consistent protection.

### Embed in an iframe

The responsive interface can be embedded in an iframe. The containing site must allow the application to run scripts and use browser storage if manual save and resume are required.

Example:

```html
<iframe
  src="nonprofit-risk-assessment-wizard-manual-save-final.html"
  title="Nonprofit Risk Assessment Wizard"
  width="100%"
  height="900"
  loading="lazy">
</iframe>
```

If the iframe uses a `sandbox` attribute, test storage, download, printing, and clipboard behavior in the target browsers. Restrictive sandbox settings may disable one or more of these features.

## Import and Export

### JSON Export

The exported JSON file contains:

- Model version and assessment metadata.
- All recorded responses.
- Systems, vendor, and account tables.
- Control answers.
- Context selections.
- Action owners and target dates.
- Engagement-checklist status.

Treat the JSON export as a potentially sensitive document.

### JSON Import

The wizard validates imported files before loading them. Imports must:

- Use model version 1.0.
- Contain the expected response and table structures.
- Keep supported tables within the defined row limit.
- Contain text values within the defined size limits.
- Be no larger than 5 MB.

Importing a file does not overwrite browser storage until the user selects **Save my progress so far**.

## Printing and PDF Output

Use **Print / Save as PDF** to open the browser's print interface. The print layout:

- Removes navigation and interactive controls.
- Expands the assessment sections for printing.
- Formats tables for paper or PDF output.
- Omits fields marked as sensitive from the printed version.

Review the print preview before saving or distributing the report.

## Privacy and Data Handling

Assessment answers may reveal sensitive information about organizational systems, personnel, vendors, security gaps, and incident readiness.

- Browser local storage is not encrypted by this application.
- Anyone with access to the same browser profile may be able to retrieve saved data.
- Do not enter passwords, authentication codes, credentials, bank account numbers, full Social Security numbers, private recovery details, or detailed protected-client information.
- Store exported JSON files only in an approved location.
- Delete browser data and exported files according to the organization's retention requirements.
- Avoid completing sensitive portions on public or shared devices.
- Private leadership checklists should be shared only when appropriate.

## Security Design

The application is designed to limit unnecessary attack surface:

- No third-party JavaScript or CSS libraries.
- No CDN dependencies.
- No external fonts, images, analytics, or tracking.
- No network requests.
- Restrictive Content Security Policy.
- No use of `eval` or dynamic code execution.
- Untrusted values are escaped before insertion into generated HTML.
- JSON imports are validated and size-limited.
- Text fields and dynamic tables have length and row limits.
- Browser-storage writes occur only after an explicit user action.
- The application does not request or transmit credentials.

When hosting the file, security also depends on the configuration of the web server, parent website, browser, and iframe policy.

## Accessibility and Browser Support

The wizard includes:

- Semantic headings, sections, tables, labels, and fieldsets.
- Keyboard-accessible controls.
- Visible focus indicators.
- Screen-reader status messages.
- Responsive layouts for desktop and mobile browsers.
- High-contrast light and dark color schemes.
- Accessible names for dynamic table controls.
- Print-specific formatting.

The application is intended for current versions of Microsoft Edge, Google Chrome, Mozilla Firefox, and Safari. Browser privacy modes, storage restrictions, iframe policies, and managed-device settings may affect local storage, clipboard, printing, or file downloads.

## Assessment Boundaries

This application supports a self-reported advisory assessment. It does not perform:

- Vulnerability scanning.
- Penetration testing.
- Configuration verification.
- Credential validation.
- Malware analysis.
- Incident response.
- Legal or regulatory interpretation.
- Certification or compliance attestation.

If the organization believes it is currently compromised, stop the assessment and follow an appropriate incident-response process. Organizations facing targeted, state-level, or physical-safety threats require a threat model and engagement scope appropriate to those risks.

## Known Limitations

- Results depend on the accuracy and completeness of self-reported answers.
- A **Yes** answer indicates that a control is reported as present; the application does not verify implementation quality.
- Impact, likelihood, and control-reduction factors are professional-judgment estimates for general-purpose nonprofits.
- The model does not comprehensively assess deliberate abuse by a trusted current insider.
- Some risks remain partly outside the organization's control and cannot be fully closed by the modeled controls.
- A score is meaningful primarily when the same organization is reassessed using the same model version.

## Recommended Workflow

1. Confirm that the engagement is appropriate during intake.
2. Complete the threat model with organizational leadership.
3. Complete the attack-surface inventory with the person who knows the systems.
4. Answer each control question using the strict “done looks like” description.
5. Review contradictions, unknown answers, administrator concentration, domain ownership, and single-person dependencies.
6. Select and assign the three recommended actions.
7. Export the assessment JSON and create the report.
8. Conduct a 90-day follow-up.
9. Reassess after six months using the same model version.
10. Compare the organization with its own previous result rather than with another organization.

## File

Primary application file:

```text
nonprofit-risk-assessment-wizard-manual-save-final.html
```

The entire application is contained in this single file.

## Version Information

- **Application save model:** Manual save
- **Exposure model:** 1.0
- **Attack paths:** 16
- **Controls:** 20
- **External dependencies:** None
- **Network access required:** No

## Disclaimer

This application and its output are provided for informational and advisory purposes only. They do not constitute legal advice, a security audit, a warranty, a compliance determination, or a prediction of whether a security incident will occur. Organizations remain responsible for validating findings, selecting appropriate safeguards, protecting assessment data, and obtaining qualified professional assistance when needed.
