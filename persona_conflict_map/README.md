# Journalist Identity Exposure Mapper

A standalone, offline-first identity-separation, operational-security, risk-register, and STIX 2.1 correlation tool for journalists and other people operating in high-risk environments.

The application helps identify where professional, personal, creative, public, research, and source-facing identities intersect through reused phone numbers, email addresses, physical addresses, social-media accounts, SaaS services, recovery accounts, activities, devices, and other identifiers.

It is designed for situations where an identity crossover could expose location, routines, confidential sources, friends, family, or other information that may create a life-safety risk.

## Key Features

### Persona inventory

Create distinct identity profiles such as:

- Work or reporting identity
- Personal identity
- Creative identity
- Public-facing identity
- Research identity
- Source-facing identity
- Other purpose-specific personas

Each persona can include:

- Threat level
- General region
- Identity and biography clues
- Information that must remain separated

### Communications and account inventory

Track communication channels and identity-linked resources, including:

- Telephone numbers
- Email addresses
- Physical addresses
- Social-media accounts
- SaaS services
- Messaging accounts
- Domains and websites
- Devices
- Payment methods
- Other identifying resources

Each entry can be associated with one or more personas and can record:

- Provider or platform
- Identifier, address, alias, or handle
- Recovery accounts
- Public exposure level
- Location exposure
- Links to friends or family
- Links to a legal identity
- MFA status
- Operational notes

### Activity mapping

Document work and life activities and connect them to the personas and accounts involved.

Activity risk factors include:

- Base risk level
- Location sensitivity
- Travel or routine disclosure
- Confidential-source involvement
- Exposure of friends, family, or associates
- Likely hostile-actor interest

Examples include field reporting, source communication, border crossings, conference appearances, publishing, travel booking, creative work, and personal social activity.

### Integrated risk register

Create risks and associate them directly with personas, activities, and communication channels.

Each risk record includes:

- Title and category
- Likelihood and impact
- Inherent risk score
- Residual likelihood and impact
- Residual risk score
- Status
- Risk owner or responsible role
- Risk description
- Existing controls
- Planned treatment
- Exposed personas
- Exposed activities
- Exposed accounts and channels

Included risk categories cover:

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

### Correlation and overlap warnings

The application analyzes the local inventory for identity-separation failures and related exposure. Examples include:

- One account assigned to multiple personas
- The same identifier reused across accounts
- Recovery accounts bridging different personas
- Discoverable accounts exposing location
- High-risk personas linked to friends or family
- Activities using cross-persona accounts
- A single risk affecting multiple personas
- Risk-linked activities crossing persona boundaries
- Life-safety risks with significant residual exposure

Warnings include a severity score, affected objects, and a suggested treatment or control.

The analysis is intended to support structured review. The absence of a warning does not prove that identities are unlinkable.

## STIX 2.1 Export

The tool exports a STIX 2.1 bundle for graphing and correlation in compatible STIX tools, including the companion STIX Palette project.

### Object mapping

- Personas become standard STIX `identity` objects.
- Email addresses become standard `email-addr` cyber-observable objects.
- Domains become standard `domain-name` cyber-observable objects.
- Social-media, SaaS, and messaging accounts become standard `user-account` objects.
- Physical addresses become standard `location` objects.
- Telephone numbers become custom `x-phone-number` objects.
- Activities become custom `x-journalist-activity` objects.
- Risk-register entries become custom `x-risk-record` objects.
- Correlation and overlap warnings become standard STIX `note` objects.

### Relationship mapping

Exported relationships may include:

- `represents`
- `uses`
- `performed-under`
- `recovered-by`
- `has-risk`
- `overlaps-with`

Warning notes reference the affected personas, accounts, activities, and risks. This preserves the context needed to visualize why a warning was generated.

### STIX preflight validation

Before export, the application performs local validation checks for:

- Bundle structure
- STIX object IDs and type-prefix agreement
- UUID structure and variant
- STIX 2.1 `spec_version`
- Duplicate object IDs
- RFC 3339 UTC timestamps
- Required object properties
- Relationship source and target references
- Note object references
- Unresolved references
- Self-referential relationships
- Custom-property interoperability warnings

STIX export is blocked when the local preflight detects a mandatory structural error.

The built-in validator is a defensive preflight and is not a replacement for the official OASIS STIX validator. For formal interoperability testing, validate exported bundles with the OASIS `cti-stix-validator` project and test them in the intended receiving platform.

## Internal and Interchange Formats

The tool maintains two separate data representations:

### Native JSON

The native format preserves the complete editable application state, including:

- Personas
- Channels and accounts
- Recovery links
- Activities
- Risk-register records
- Internal relationships
- Controls and treatments

Use this format for backups and continued editing in the application.

### STIX 2.1 JSON

The STIX format is intended for interchange, graphing, correlation, and visualization. It maps the internal assessment into standard and custom STIX objects and relationships.

Do not use the STIX export as the only backup of the editable project.

## Security Design

The application is intentionally built as a single standalone HTML file using vanilla JavaScript.

Security controls include:

- No CDN resources
- No external JavaScript libraries
- No network requests
- No analytics or telemetry
- No cloud synchronization
- No `eval()` use
- No `innerHTML` rendering of user-controlled data
- DOM construction with `textContent`
- Hash-based Content Security Policy
- No `unsafe-inline` CSP exception
- Framing disabled through CSP
- Object loading disabled
- Form submission disabled
- External connections disabled
- Import size limit
- Allowlisted native JSON schema
- Input length and record-count limits
- Control-character removal
- Numeric and Boolean normalization
- Visible validation and storage errors
- Removal of stale references when linked records are deleted

## Important Security Warning

This tool creates a consolidated map of identities, accounts, activities, risks, and sensitive relationships. That map may be more sensitive than any individual account record.

A completed inventory or STIX export could reveal:

- Hidden relationships between identities
- Personal and professional contact paths
- Recovery-account dependencies
- Home or travel information
- Source-handling patterns
- Friends, family, and associate exposure
- Existing security controls and gaps
- High-value targeting opportunities

Recommended handling practices include:

- Use the tool only on a trusted and fully patched device.
- Use full-disk encryption.
- Store exports in an encrypted container.
- Avoid shared or managed browser profiles when inappropriate for the threat model.
- Do not upload completed assessments to unapproved cloud services.
- Remove exports when no longer required.
- Consider using a dedicated offline device for highly sensitive assessments.
- Treat screenshots, browser backups, and exported JSON as sensitive records.

Browser local storage is not encryption. Anyone with access to the browser profile or device may be able to recover stored application data.

## Usage

1. Download the HTML file.
2. Open it in a modern browser.
3. Define the identities or personas that should remain separated.
4. Add communication methods, accounts, services, addresses, and devices.
5. Connect each account to its intended persona or personas.
6. Record recovery-account dependencies.
7. Add work and life activities and connect their supporting accounts.
8. Add risk-register entries and map them to exposed personas, activities, and accounts.
9. Review correlation warnings and suggested treatments.
10. Export the native JSON for an editable backup.
11. Validate and export STIX 2.1 JSON for visualization or exchange.

No installation, server, package manager, or internet connection is required.

## Suggested Assessment Workflow

### 1. Establish identity boundaries

Define what must remain separate and why. Document the consequences if two personas are correlated.

### 2. Inventory observable identifiers

Record phone numbers, email addresses, handles, domains, recovery methods, addresses, services, devices, and other identifiers that an investigator could discover.

### 3. Map activities

Connect physical and online activities to the identities and infrastructure that support them.

### 4. Record risks

Describe the adverse event, affected objects, likelihood, impact, controls, and residual exposure.

### 5. Review correlation warnings

Focus first on life-safety findings, location exposure, family or source exposure, and recovery-account bridges.

### 6. Apply treatments

Possible treatments include removing an identity bridge, creating a persona-specific account, changing a recovery path, disabling contact discovery, delaying publication, removing metadata, or changing the supporting device or workflow.

### 7. Reassess residual risk

Update residual likelihood and impact after controls are applied.

### 8. Export carefully

Use native JSON for continued assessment work and STIX 2.1 for graphing or correlation. Protect both formats according to the sensitivity of the information they contain.

## Limitations

- The application does not query social networks, data brokers, breach repositories, or OSINT services.
- It does not prove anonymity or unlinkability.
- It does not encrypt browser storage or exports.
- It cannot detect all behavioral, biometric, linguistic, photographic, device, network, or financial correlations.
- Risk scores are decision-support indicators, not objective predictions.
- Custom STIX objects and relationship types may not be supported by every STIX consumer.
- The local STIX validator does not replace independent validation with the official OASIS tooling.
- The application is not an emergency-response service or a substitute for a professional threat assessment.

## Privacy and Data Handling

The application does not intentionally transmit data. All processing occurs in the browser.

Data persists in browser local storage until it is removed through the application, browser controls, profile deletion, or other storage-management action. Native and STIX exports are written only when the user initiates a download.

Review the source before use in a high-risk environment. Browser behavior, extensions, endpoint-management tools, backup software, and operating-system features may affect the actual privacy of locally stored information.

## Compatibility

Use a current browser with support for:

- Modern JavaScript
- Web Crypto random-value generation
- Local storage
- FileReader
- Blob downloads
- Content Security Policy hashes

The project does not require Node.js, Python, a web server, build tools, or third-party browser libraries.

## Development Principles

Contributions should preserve the following requirements:

- Offline-first behavior
- No CDN or remote dependencies
- No silent validation failures
- No dynamic execution of imported content
- Safe DOM construction
- Explicit schema validation and normalization
- Backward-compatible native-data migration where practical
- Separation of internal state from STIX interchange data
- Deterministic STIX identifiers for stable graph correlation
- Visible STIX validation errors before export
- No reduction in CSP protections

## Testing Checklist

Before publishing a change:

- Confirm the HTML opens locally without network access.
- Parse the embedded JavaScript with a JavaScript syntax checker.
- Confirm the CSP script and style hashes match the embedded content.
- Confirm there is no `innerHTML`, `eval()`, or `unsafe-inline` use.
- Test native JSON export and import.
- Test migration from an earlier native format.
- Test deletion of linked personas, activities, accounts, and risks.
- Test correlation warnings with cross-persona data.
- Test STIX export with an empty project and a populated project.
- Run the STIX bundle through the official OASIS validator.
- Import the bundle into the intended STIX visualization tool.
- Verify that custom objects and relationships are handled as expected.

## Repository Structure

A minimal repository can use the following structure:

```text
journalist_identity_mapper/
├── README.md
└── journalist_identity_stix_mapper.html
```

## Related Project

This application is designed to complement the STIX Palette tool in the Security Timesavers collection by producing a STIX 2.1 relationship graph containing identities, activities, accounts, risks, and correlation warnings.

- [Security Timesavers repository](https://github.com/asmodianx/security_timesavers)
- [STIX Palette folder](https://github.com/asmodianx/security_timesavers/tree/main/stix_palette)
- [Risk Register folder](https://github.com/asmodianx/security_timesavers/tree/main/risk_register)
- [OASIS STIX validator](https://github.com/oasis-open/cti-stix-validator)

## Disclaimer

This project is provided as a decision-support and documentation tool. It is provided as-is, without warranty or any promise that it will identify every exposure, prevent identity correlation, or protect against surveillance, targeting, compromise, injury, or loss.

Users are responsible for reviewing the code, validating exported data, protecting stored information, and determining whether the tool is appropriate for their threat model, legal obligations, organizational requirements, and operating environment.

For an immediate or credible threat to life or safety, follow an established safety or emergency plan and contact appropriate trusted assistance.

## License

Add the repository's selected license here. If this tool is included in Security Timesavers, use the license and contribution terms adopted by that repository.
