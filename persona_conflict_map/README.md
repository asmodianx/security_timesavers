# Journalist Identity Exposure Mapper

A standalone, offline-first identity-separation, operational-security, risk-assessment, relationship-visualization, and STIX 2.1 export tool for journalists and other people working in high-risk environments.

The application helps identify where professional, personal, creative, public, research, and source-facing identities intersect through communication methods, accounts, recovery paths, activities, risks, and shared identifiers.

It is designed for situations where identity crossover may expose location, routines, confidential sources, friends, family, or other information that could create a targeting or life-safety risk.

## Overview

The tool combines five related capabilities in one local application:

1. Persona and identity-boundary inventory
2. Communication-channel and account mapping
3. Work and life activity mapping
4. Risk register and correlation analysis
5. Interactive relationship visualization and STIX 2.1 export

All processing occurs in the browser. The application has no server component, external JavaScript libraries, analytics, CDN resources, or required network connection.

## Current Features

### Persona inventory

Create purpose-specific identities such as:

- Work or reporting persona
- Personal persona
- Creative persona
- Public-facing persona
- Research persona
- Source-facing persona
- Other specialized identities

Each persona can record:

- Name
- Category
- Threat level
- General region
- Identity or biography clues
- Information that must remain separated

### Communication channels and accounts

Track resources that may disclose or correlate identities, including:

- Telephone numbers
- Email addresses
- Physical addresses
- Social-media accounts
- SaaS services
- Messaging accounts
- Domains and websites
- Devices
- Payment methods
- Other identifiers

Each entry can record:

- Label
- Resource type
- Provider or platform
- Address, number, handle, username, or identifier
- Assigned personas
- Recovery accounts
- Exposure level
- Location exposure
- Links to friends or family
- Links to a legal identity
- MFA status
- Operational notes

### Activity mapping

Document work and life activities and connect them to the personas and accounts involved.

Activity fields include:

- Associated persona
- Frequency
- Base risk level
- Linked communication channels and accounts
- Location sensitivity
- Travel or routine exposure
- Confidential-source involvement
- Exposure of friends, family, or associates
- Likely hostile-actor interest
- Notes

Example activities include field reporting, source communication, public appearances, border crossings, travel booking, publication, research, creative work, and personal social activity.

### Integrated risk register

Create risk records and associate each risk directly with affected personas, activities, and communication channels.

Each risk record includes:

- Risk title
- Category
- Likelihood
- Impact
- Inherent risk score
- Residual likelihood
- Residual impact
- Residual risk score
- Status
- Risk owner or responsible role
- Risk description
- Existing controls
- Planned treatment
- Exposed personas
- Exposed activities
- Exposed channels and accounts

Risk categories include:

- Life safety
- Identity correlation
- Location exposure
- Source protection
- Account compromise
- Surveillance
- Legal or regulatory exposure
- Reputation
- Operational risk
- Other risks

## Editing and Record Management

Personas, channels and accounts, activities, and risks can all be edited after creation.

Each inventory card provides:

- **Edit** to reopen the complete record in its original form
- **Remove** to delete the record after confirmation

When editing a record:

- Existing text, selections, flags, and relationships are restored into the form.
- The form clearly changes to an edit state.
- The submit action changes to **Save changes**.
- **Cancel edit** returns the form to its add-record state without altering the saved record.
- Saving immediately recalculates warnings, graph relationships, and STIX output.

When a record is removed, dependent references are cleaned up automatically. For example:

- Removing a persona removes its references from accounts and risks.
- Activities assigned to a removed persona are removed.
- Removing an account removes recovery, activity, and risk references to it.
- Removing an activity removes corresponding risk references.
- Removing a risk removes the risk record and its graph relationships.

## Independent Relationship Selection

Relationship fields use explicit checkbox pickers rather than native HTML multi-select controls.

This applies to:

- Personas assigned to an account
- Recovery accounts
- Accounts linked to an activity
- Personas exposed to a risk
- Activities exposed to a risk
- Accounts exposed to a risk

Each relationship can be selected or deselected independently with a normal click. Ctrl-click and Shift-click are not required. This avoids browser-dependent range selection and accidental over-selection.

When a record is edited, its existing relationships are restored as checked items. Saving preserves only the relationships that remain checked.

An account is prevented from saving itself as its own recovery account.

## Interactive Relationship Canvas

The application includes a standalone browser-canvas visualization of relationships among:

- Personas
- Channels and accounts
- Activities
- Risks

### Color coding

- Blue: personas
- Green: accounts and communication channels
- Yellow: activities
- Red: risks

### Full graph layout

The default view organizes objects by type so broad identity and risk paths can be reviewed across the complete assessment.

### Focused relationship layout

Clicking a node:

1. Centers the selected object.
2. Arranges directly related objects around it.
3. Places unrelated objects in an outer ring.
4. Highlights the selected node.
5. Displays the selected object's relationship list in a details panel.

This focused view helps isolate a specific persona, account, activity, or risk from a dense graph.

### Canvas controls

The visualization supports:

- Fit all
- Clear focus
- Zoom in
- Zoom out
- Mouse-wheel zoom
- Node dragging
- Optional warning-link display
- Click-to-focus organization
- Direct edit access from the selected-object panel
- Responsive resizing

Graph relationships include:

- Persona assignment
- Account recovery dependencies
- Activity-to-persona relationships
- Activity use of accounts
- Risk exposure of personas
- Risk exposure of activities
- Risk exposure of accounts
- Correlation-warning links

## Correlation and Overlap Warnings

The application recalculates correlation warnings whenever data is added, edited, imported, or removed.

Examples include:

- One account assigned to multiple personas
- Recovery accounts bridging different personas
- A high residual risk affecting one or more identities
- One risk affecting multiple personas
- Risk-linked activities crossing persona boundaries
- Shared channels creating an identity-correlation path
- Life-safety risks with significant remaining exposure

Each warning includes:

- Warning type
- Severity score
- Affected objects
- Relevant details

The warning links can also be displayed in the relationship canvas.

The absence of a warning does not prove that identities are anonymous, isolated, or unlinkable.

## Risk Scoring

The risk register uses a basic likelihood-impact model.

### Inherent risk

```text
Inherent Risk = Likelihood × Impact
```

### Residual risk

```text
Residual Risk = Residual Likelihood × Residual Impact
```

Likelihood and impact values use a 1-to-5 scale, producing scores from 1 to 25.

The automated warning score is a prioritization aid. It is not an objective prediction and should be reviewed against the journalist's actual threat model, operating environment, adversaries, and safety plan.

## Native JSON Format

The native JSON export preserves the application's complete editable state, including:

- Personas
- Channels and accounts
- Recovery-account links
- Activities
- Risks
- Internal relationship IDs
- Controls and treatments
- Application metadata

Use native JSON for:

- Backup
- Transfer to another trusted browser or device
- Continued editing
- Preserving application-specific fields

Native JSON imports are limited to 5 MB.

The native format should be treated as the authoritative editable project format. STIX export is intended for interchange and visualization, not as the only project backup.

## STIX 2.1 Export

The application creates a relationship-oriented STIX 2.1 bundle for compatible visualization and correlation tools, including the related STIX Palette project.

### Object mapping

- Personas become standard STIX `identity` objects.
- Email addresses become standard `email-addr` objects.
- Domains become standard `domain-name` objects.
- Supported accounts can become `user-account` objects.
- Other communication resources use custom `x-identity-channel` objects.
- Activities become custom `x-journalist-activity` objects.
- Risks become custom `x-risk-record` objects.
- Correlation findings become standard STIX `note` objects.

### Relationship mapping

Relationships may include:

- `represents`
- `recovered-by`
- `performed-under`
- `uses`
- `has-risk`
- `overlaps-with`

Warning notes reference the affected STIX objects so the reason for a correlation warning remains visible in graph-oriented consumers.

### Deterministic identifiers

STIX identifiers are generated from the internal object identifiers. This helps the same local object retain a stable STIX identity across exports.

### STIX preflight

Before downloading a STIX bundle, the application performs local structural checks including:

- Bundle structure
- Object ID and object-type agreement
- Required relationship references
- Resolution of relationship source and target references
- Presence of object references on warning notes

The built-in check is a defensive preflight, not a replacement for the official OASIS STIX validator. Validate exported bundles with the official validator before relying on interoperability with another platform.

## Security Design

The application is delivered as one standalone HTML file using vanilla JavaScript.

Security controls include:

- No CDN resources
- No third-party JavaScript libraries
- No required network access
- No analytics or telemetry
- No cloud synchronization
- No `eval()`
- No `innerHTML` rendering of user-controlled data
- DOM construction using `textContent`
- Hash-based Content Security Policy
- No `unsafe-inline` CSP exception
- External connections disabled through CSP
- Object loading disabled
- Base-URI changes disabled
- Form submission disabled
- Framing disabled
- Native import size limit
- Control-character removal from entered text
- Confirmation before record deletion
- Automatic stale-reference cleanup

## Important Security Warning

This application creates a consolidated relationship graph of identities, accounts, activities, risks, and protective controls. A completed assessment may be more sensitive than any individual record used to create it.

The application and its exports may reveal:

- Hidden relationships between identities
- Personal and professional communication paths
- Recovery-account dependencies
- Location and travel information
- Source-handling patterns
- Friends, family, and associate exposure
- Existing controls and remaining gaps
- High-value targeting opportunities

Recommended handling practices include:

- Use a trusted and fully patched device.
- Use full-disk encryption.
- Store native and STIX exports in an encrypted container.
- Avoid inappropriate shared or synchronized browser profiles.
- Do not upload completed assessments to unapproved cloud services.
- Remove exports when they are no longer required.
- Consider a dedicated offline device for highly sensitive reviews.
- Treat screenshots, browser backups, and exported files as sensitive records.

Browser local storage is not encryption. A person with access to the device or browser profile may be able to recover stored application data.

## Usage

1. Download the HTML file.
2. Open it in a current browser.
3. Define the personas that should remain separated.
4. Add telephone numbers, email addresses, physical addresses, accounts, services, and devices.
5. Assign each channel or account to the appropriate persona.
6. Record account-recovery dependencies.
7. Add work and life activities.
8. Link activities to the accounts they use.
9. Add risks and link them to affected personas, activities, and accounts.
10. Review correlation warnings.
11. Open the relationship canvas to inspect the full graph.
12. Click a node to focus and reorganize its direct relationships.
13. Edit records to correct relationships or update controls.
14. Export native JSON for backup and continued editing.
15. Export and independently validate STIX 2.1 for visualization or interchange.

No installation, web server, build process, package manager, or internet connection is required.

## Suggested Assessment Workflow

### 1. Define persona boundaries

Document what must remain separate and the consequences if those boundaries fail.

### 2. Inventory observable identifiers

Record phone numbers, email addresses, handles, websites, recovery paths, physical addresses, services, devices, and payment-related identifiers.

### 3. Map activities

Connect physical and online activities to the identities and infrastructure that support them.

### 4. Register risks

Document adverse events, exposed objects, likelihood, impact, existing controls, planned treatment, and residual exposure.

### 5. Review warnings

Prioritize life safety, location disclosure, family or source exposure, account recovery bridges, and risks spanning multiple personas.

### 6. Explore the graph

Use the full layout to identify broad patterns. Select high-risk nodes to isolate direct relationships and locate the shortest identity-crossover paths.

### 7. Apply controls

Possible controls include:

- Creating persona-specific accounts
- Replacing shared recovery paths
- Disabling contact discovery
- Removing location metadata
- Separating devices or browser profiles
- Delaying publication
- Reducing real-time posting
- Changing payment or registration workflows
- Restricting access to friends, family, or source information

### 8. Reassess residual risk

Update the risk record after applying controls and review the graph and warnings again.

## Browser Compatibility

Use a current browser with support for:

- Modern JavaScript
- HTML Canvas
- Pointer events
- Web Crypto random-value generation
- Local storage
- FileReader
- Blob downloads
- Content Security Policy hashes

The application does not require Node.js, Python, a web server, or a browser extension.

## Limitations

- The tool does not query social networks, data brokers, breach repositories, or OSINT services.
- It does not prove anonymity or unlinkability.
- It does not encrypt browser storage or exports.
- It cannot detect every behavioral, linguistic, photographic, biometric, network, device, or financial correlation.
- Risk scores are decision-support indicators, not predictions.
- Graph proximity represents recorded relationships, not geographic distance or proof of adversary knowledge.
- Custom STIX objects and relationships may not be supported by every STIX consumer.
- Local STIX checks do not replace the official OASIS validator.
- The application is not an emergency-response service or a substitute for a professional threat assessment.

## Development Requirements

Contributions should preserve:

- Offline-first operation
- A single-file deployment option
- No CDN or remote runtime dependency
- Safe DOM construction
- No dynamic execution of imported content
- Explicit native-state normalization
- Stable object identifiers during editing
- Cleanup of deleted relationship references
- Separation of native state from STIX interchange data
- Visible export-validation failures
- CSP protection without `unsafe-inline`
- Keyboard-accessible forms and controls
- Independent checkbox-based relationship selection
- Responsive graph rendering

## Testing Checklist

Before publishing a change:

- Open the file locally with network access disabled.
- Add, edit, cancel editing, and remove each object type.
- Verify removal cleans dependent references.
- Verify relationship checkboxes select independently without Ctrl or Shift.
- Edit a record and confirm existing relationships are restored.
- Test account recovery relationships.
- Test risk relationships to personas, activities, and accounts.
- Review the full graph layout.
- Click each node type and verify focused organization.
- Drag nodes and test zoom controls.
- Toggle warning links.
- Use the selected-object edit shortcut.
- Export and re-import native JSON.
- Export STIX from empty and populated projects.
- Run the STIX bundle through the official OASIS validator.
- Import STIX into the intended visualization tool.
- Confirm CSP script and style hashes match.
- Confirm there is no `innerHTML`, `eval()`, or `unsafe-inline` use.

## Repository Structure

```text
journalist_identity_mapper/
├── README.md
└── journalist_identity_stix_mapper_editable_graph.html
```

## Related Projects

- [Security Timesavers](https://github.com/asmodianx/security_timesavers)
- [STIX Palette](https://github.com/asmodianx/security_timesavers/tree/main/stix_palette)
- [Risk Register](https://github.com/asmodianx/security_timesavers/tree/main/risk_register)
- [OASIS STIX Validator](https://github.com/oasis-open/cti-stix-validator)

## Privacy and Data Handling

The application does not intentionally transmit assessment data. All processing occurs locally in the browser.

Data remains in browser local storage until it is removed through the application, browser controls, profile deletion, or another storage-management action. Native and STIX files are created only when an export is initiated.

Browser extensions, endpoint-management software, backup tools, synchronized profiles, operating-system features, and forensic access may affect the actual privacy of locally stored data.

## Disclaimer

This project is a decision-support and documentation tool. It is provided as-is, without warranty or any promise that it will identify every exposure, prevent identity correlation, or protect against surveillance, compromise, targeting, injury, or loss.

Users are responsible for reviewing the source, validating exported data, protecting stored information, and determining whether the tool is appropriate for their threat model, legal obligations, organizational requirements, and operating environment.

For an immediate or credible threat to life or safety, follow an established safety or emergency plan and contact appropriate trusted assistance.

## License

Apply the license and contribution terms selected for the repository. If this project is included in Security Timesavers, use the license adopted by that repository.
