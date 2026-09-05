# Nonprofit Security and Threat Intelligence Requirements Wizard

A standalone, offline-capable browser application for helping nonprofit and nongovernmental organizations assess foundational cybersecurity risks and produce a structured cyber threat intelligence collection profile.

The wizard is designed for organizations with limited budgets, low cybersecurity maturity, volunteer or outsourced technology support, and little or no dedicated threat intelligence capability. It moves complexity into the application rather than requiring users to understand formal intelligence terminology or operate an enterprise threat intelligence platform.

## Revision

**Current model:** 3.0, corrected CTI-enhanced OWASP revision

This revision retains the expanded threat intelligence functionality and applies the Priority 1 OWASP hardening changes. Model 3.0 uses a separate browser storage key and does not automatically import assessments from earlier model versions.

## Purpose

The application supports two related outcomes:

1. **Nonprofit security risk assessment**
   - Identify important information, services, accounts, systems, and vendors.
   - Describe plausible financial, data-loss, and operational outage scenarios.
   - Assess a focused set of foundational security controls.
   - Produce prioritized actions based on modeled risk reduction, effort, and cost.

2. **Threat intelligence requirements development**
   - Identify relevant sectors, missions, geographies, technologies, dependencies, and previous incident types.
   - Determine who should receive cyber warnings and what those recipients can realistically do.
   - Define suitable delivery methods and intelligence product types.
   - Derive Priority Intelligence Requirements and collection filters without requiring the user to understand CTI-specific terminology.

## Key Features

### Organizational intake

- Organization name and mission
- Staff and volunteer counts
- Internal assessment owner
- Owner authority and technology support model
- Primary country and additional operating regions
- Mission and sector classification
- Identification of missions that may attract ideological, political, criminal, or state-linked attention
- Referral conditions for active compromise, physical-safety concerns, or lack of an actionable owner

### Threat model

- Five broadly understandable sources of adverse events
- Critical information and service inventory
- Confidentiality and availability consequences
- Crown-jewel selection
- Financial-fraud, data-disclosure, and operational-outage scenarios
- Most likely, most damaging, and least-prepared-for events
- Prior incident experience and continuing concerns

### Attack-surface discovery

- Organization domains, registrar, expiration, email hosting, and spoofing posture
- Systems and technology inventory
- Vendor and service-provider inventory
- Professional account and administrator review
- Review of publicly available organizational information
- Leadership and personal-account safety prompts
- Travel, device, and home-network considerations

### Security control assessment

- Foundational account, authentication, backup, payment, access, endpoint, web, file-sharing, training, retention, vendor, and governance controls
- Tiered maturity model
- Modeled exposure index
- Attack-path status
- Top three recommended actions
- Named owners and target dates
- Follow-up questions for uncertain answers

### Threat intelligence capability

- Intended cyber-warning recipients
- Realistic response capabilities
- Preferred delivery methods
- Preferred intelligence product types
- Primary warning and escalation roles
- Operational constraints responders should understand

### Derived CTI output

The application derives an organizational collection profile that can include:

- Critical assets
- Relevant technologies
- Mission and sector interests
- Operating geographies
- Critical vendors and dependencies
- Previous incident interests
- Priority Intelligence Requirements
- Intended recipients
- Available response capabilities
- Delivery preferences
- Suitable intelligence product formats

## Files

Keep these files together in the same directory:

```text
NPO_CTI_Requirements_Wizard_v3_corrected/
├── index.html
├── styles.css
├── app.js
└── README.md
```

No installation, build process, package manager, web server, or external library is required for local use.

## Running Locally

1. Extract the application folder.
2. Keep `index.html`, `styles.css`, and `app.js` in the same folder.
3. Open `index.html` in a current desktop browser.
4. Complete the wizard.
5. Use the report and export functions as needed.

The application is intended to work directly from a local folder. Browser security settings or organizational endpoint policies may restrict local JavaScript or local storage in some environments.

## Data Storage

The application does not automatically transmit information to a server.

Assessment data remains in browser memory unless the user explicitly saves progress. When saved, the assessment is stored in the browser's local storage for the current browser profile.

Browser local storage is **not encrypted**. Anyone with access to the same browser profile or device may be able to access saved information.

Do not enter:

- Passwords
- Authentication tokens
- Recovery codes
- Complete Social Security numbers
- Complete payment-card or bank-account numbers
- Protected client case details
- Home addresses
- Information whose disclosure could create immediate physical danger

Use the application's erase function when locally saved information is no longer needed.

## Exports

### Full assessment JSON

Contains the recorded assessment responses and tables. This file may include sensitive information about organizational assets, technologies, vendors, accounts, control gaps, and prior incidents.

### CTI collection profile JSON

Contains the information needed to guide threat-intelligence collection and packaging, such as relevant technologies, sectors, assets, dependencies, recipients, and derived intelligence requirements.

### Printable report

Provides the risk-assessment summary, control results, recommended actions, follow-up items, and derived intelligence requirements.

Review every export before sharing it. Treat exports as sensitive organizational security information and provide them only to authorized personnel or designated service providers.

## OWASP-Oriented Security Design

This revision applies the project's Priority 1 browser-security improvements.

### Content Security Policy

The application uses a restrictive Content Security Policy intended to:

- Deny resources by default
- Load JavaScript and CSS only from the same local folder or origin
- Prevent outbound application connections
- Disable plugins and embedded objects
- Prevent base-URL modification
- Prevent form submission

Inline JavaScript and inline CSS are not required. The policy does not use `unsafe-inline` for scripts or styles.

### Safe DOM handling

User-controlled and imported values should be rendered through safe browser APIs, including:

- `textContent`
- `document.createElement()`
- `append()`
- `replaceChildren()`
- Direct assignment to an input element's `value`

User-supplied values must not be interpreted as executable HTML.

### JSON import validation

Imported assessments are subject to defensive limits, including:

- Model-version validation
- Expected root-object validation
- Maximum nesting depth
- Maximum property count
- Maximum array length
- Maximum string length
- Finite-number checks
- Required table validation
- Table and field allowlists
- Rejection of prototype-pollution property names
- Imported file-size limit

An imported file must still be treated as untrusted input. Do not weaken or bypass these checks when extending the application.

### Dependency and network controls

The application has:

- No CDN dependencies
- No third-party JavaScript libraries
- No external fonts
- No package-manager dependencies
- No analytics or telemetry
- No application API calls
- No normal outbound network requests
- No use of `eval()` or `new Function()`

## Hosted Deployment

The application can be hosted as static files, but production hosting should add server-side controls that a locally opened file cannot provide.

Recommended deployment practices include:

- HTTPS only
- Restrictive `Content-Security-Policy` response header
- `frame-ancestors 'none'` unless trusted framing is explicitly required
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- Restrictive `Permissions-Policy`
- Appropriate cache controls for sensitive shared workstations
- Access restrictions when assessments are not intended for public use

If framing is required, allow only explicitly trusted origins. Do not permit arbitrary third-party websites to frame the assessment.

## Security Testing

Before publishing a modified revision, verify that representative hostile values remain inert when typed, imported, displayed, reported, saved, and exported.

Suggested test values:

```text
<script>alert(1)</script>
"><img src=x onerror=alert(1)>
</textarea><script>alert(1)</script>
javascript:alert(1)
&<>"'
__proto__
constructor
prototype
```

Expected behavior:

- Permitted text is displayed as text.
- No new executable element is created.
- No script executes.
- Forbidden object property names are rejected when used as imported JSON keys.
- Ordinary text values containing words such as `prototype` are not treated as property names.
- Excessively deep, large, or malformed imports are rejected.

Also verify:

```bash
node --check app.js
```

Search the codebase for prohibited patterns:

```bash
grep -RInE "eval\(|new Function|document\.write|unsafe-inline" .
```

Any remaining `innerHTML` use should be reviewed to confirm it handles only static, developer-controlled templates and never includes assessment or imported data.

## Threat Intelligence Design Notes

The application treats the assessment as an organizational requirements compiler:

```text
Organizational answers
        ↓
Organization profile
        ↓
Threat interests
        ↓
Priority Intelligence Requirements
        ↓
Collection filters
        ↓
Appropriate recipient and product format
```

The nonprofit user is not expected to define formal PIRs, understand STIX/TAXII, identify named threat actors, map ATT&CK techniques, or operate a threat intelligence platform. The tool derives useful requirements from questions that organizational leaders and general IT personnel can reasonably answer.

The derived profile is intended to help a separate collection or analysis workflow determine:

- Whether incoming information applies to the organization
- Which technologies and vendors should receive additional attention
- Which threats are relevant to the mission and operating environment
- Whether the organization has the capability to act
- How the resulting intelligence should be packaged

## Assessment Boundaries

This application is:

- A self-assessment aid
- A structured discovery tool
- A prioritization model
- A threat-intelligence requirements generator

It is not:

- A security audit
- A compliance certification
- A vulnerability scanner
- A penetration test
- An incident-response service
- A legal opinion
- A breach-probability calculator
- A tool for comparing organizations against one another

If an active compromise is suspected, stop the assessment and follow the organization's incident-response and escalation process.

## Scoring Limitations

The exposure index represents modeled residual risk relative to the organization's own unmitigated baseline. It does not predict whether a breach will occur and should not be interpreted as an audit grade.

Use the same model version for reassessments. Do not use the result to rank or compare separate organizations.

## Accessibility and Usability

The interface is designed to support:

- Keyboard navigation
- Visible focus indicators
- Semantic headings and fieldsets
- Explicit labels
- Responsive layouts
- Screen-reader status updates
- Print-friendly reporting
- Light and dark browser color schemes

Accessibility should be retested whenever fields, dynamic controls, navigation, or report structures are changed.

## Extending the Application

When adding functionality:

1. Preserve offline operation.
2. Do not add CDN or runtime dependencies.
3. Do not add telemetry or network calls without an explicit architectural review.
4. Use safe DOM creation instead of HTML-string assembly for untrusted values.
5. Add new fields to import validation and export handling.
6. Enforce field-specific type and length limits.
7. Update `MODEL_VERSION` and the storage key when the saved schema changes.
8. Document migration behavior between model versions.
9. Test malicious input in every new rendering path.
10. Review whether new fields create additional privacy or physical-safety concerns.

## License

No license is specified in this revision. Add an explicit repository license before distributing, modifying, or accepting external contributions if the project is intended for public reuse.

## Disclaimer

This tool provides general cybersecurity assessment and threat-intelligence planning assistance. Results depend on the accuracy and completeness of self-reported information. The tool does not verify configurations or replace qualified technical, legal, compliance, privacy, safety, or incident-response advice.
