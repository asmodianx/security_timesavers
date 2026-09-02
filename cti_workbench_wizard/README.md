# CTI Workbench Wizard

CTI Workbench Wizard is a standalone, browser-based application for creating, importing, editing, enriching, grouping, and exporting cyber threat intelligence data.

The application uses a guided, event-centered workflow. It starts with an empty event, allows analysts to import supported CTI data or author it manually, presents objects and attributes in editable tables, supports enrichment and evidence collection, and produces STIX, MISP, project, and printable report output.

## Key Characteristics

- Single standalone HTML file
- Vanilla HTML, CSS, and JavaScript
- No CDN resources
- No NPM dependencies
- No external JavaScript libraries
- Runs locally or from a web server
- Event-centered wizard interface
- Supports root-level attributes and grouped object attributes
- Preserves source and provenance information where available
- Requires explicit analyst review before applying extracted or enriched candidates

## Wizard Workflow

### 1. Dashboard

The dashboard starts with an empty event and provides a summary of the current workspace.

Event metadata includes:

- Event title or MISP event information
- Document format
- Classification
- Description
- Event tags
- Created and modified timestamps

The dashboard displays live counts for:

- Objects
- Attributes
- Evidence items

### 2. Import

The import stage previews data before it is committed to the active event.

Supported imports:

- STIX 2.0 JSON
- STIX 2.1 JSON
- STIX bundles
- Arrays of STIX objects
- Native MISP event JSON
- Common MISP wrappers:
  - `Event`
  - `response[0].Event`
  - `event.Event`
- CTI Workbench project JSON

The UI explicitly reports the detected format and import diagnostics before data is committed.

> **Important:** STIX 1.x XML is not supported in the current build. The application displays this limitation in the Import stage rather than silently failing.

### 3. Objects and Attributes

The authoring stage displays root attributes and object attributes in editable tables.

#### Root Attributes

Root attributes belong directly to the event and do not require a custom object. In MISP exports, these become entries in `Event.Attribute`.

#### Objects

Objects group related attributes into a meaningful structure, such as:

- Email
- File
- Domain and IP
- Network connection
- Indicator
- Observed data
- Identity
- Malware
- Vulnerability
- Generic MISP object

In MISP exports, grouped attributes become entries in `Event.Object[].Attribute`.

#### Editable Attribute Columns

Each attribute can be edited directly using the following fields:

- `to_ids`
- MISP category
- MISP type
- Object relation
- Value
- Attribute comment
- Tags
- Delete action

The application includes a broad MISP-oriented attribute type registry, including:

- `domain`
- `domain|ip`
- `hostname`
- `hostname|port`
- `ip-src`
- `ip-src|port`
- `ip-dst`
- `ip-dst|port`
- `url`
- `email-src`
- `email-dst`
- `email-subject`
- `email-message-id`
- `email-header`
- `filename`
- `filename|sha256`
- `md5`
- `sha1`
- `sha256`
- `sha384`
- `sha512`
- `attachment`
- `malware-sample`
- `regkey`
- `regkey|value`
- `mutex`
- `named pipe`
- `sigma`
- `yara`
- `stix2-pattern`
- `vulnerability`
- `x509-fingerprint-sha256`
- `comment`
- `text`
- `other`

The type registry is based on the terminology used by the [MISP Categories and Types documentation](https://www.circl.lu/doc/misp/categories-and-types/).

#### Comments

Comments can be represented in two ways:

1. **Attribute annotation:** Use the Comment column on an existing attribute. This maps to the MISP attribute `comment` property.
2. **Comment attribute:** Add a separate attribute with:
   - Category: `Other`
   - Type: `comment`
   - Object relation: `comment`

### 4. Enrichment and Evidence

The enrichment stage operates on a selected target:

- Root event attributes
- A selected object

#### Candidate Review Queue

Extractors and enrichment tools produce candidates rather than immediately modifying the event.

Each candidate can be:

- Included or excluded
- Reviewed before application
- Reclassified with a different MISP type
- Applied to the selected target

This prevents raw utility output from being silently promoted into CTI.

#### EML Extraction

The EML extractor can propose candidates for fields such as:

- `email-src`
- `email-dst`
- `email-reply-to`
- `email-subject`
- `email-message-id`
- `email-x-mailer`
- `dkim-signature`

Folded headers are unfolded before candidate generation.

#### File Intake and Hashing

File intake can propose:

- `attachment`
- `size-in-bytes`
- `sha256`

Candidates can be reviewed and applied to the root event or a selected object.

#### Contextual Utilities

The current wizard includes:

- DNS lookup
- Reverse DNS lookup
- URL defanging
- URL encoding
- Base64 encoding

DNS results enter the candidate review queue before they are added to the event.

#### Evidence

Evidence records include:

- Filename
- File size
- Media type
- SHA-256
- Target object or root-event association
- Creation timestamp

The application also provides browser-based screen or window capture through `getDisplayMedia` when supported by the browser and execution context.

## Export

The Export stage provides a validation summary and serialized preview before download.

Available formats:

- MISP Event JSON
- STIX 2.1 Bundle JSON
- CTI Workbench project JSON

### MISP Export Behavior

- Root attributes export to `Event.Attribute`
- Grouped attributes export to `Event.Object[].Attribute`
- Attribute categories, types, values, comments, tags, object relations, and `to_ids` values are retained where represented in the workspace
- Event tags export to `Event.Tag`

### STIX Export Behavior

Common MISP-style attributes are mapped to corresponding STIX Cyber-observable Objects when a direct mapping is available.

Examples:

- `domain` → `domain-name`
- `hostname` → `domain-name`
- `ip-src` → `ipv4-addr`
- `ip-dst` → `ipv4-addr`
- `email-src` → `email-addr`
- `email-dst` → `email-addr`
- `url` → `url`

Attributes without a direct mapping are retained as custom `x-misp-attribute` objects with MISP type, category, value, and comment properties.

Related attributes are grouped using STIX grouping objects.

## Final Report and PDF

The Final Report stage creates a printable event report containing:

- Report title
- Case ID
- Event format
- Classification
- Created timestamp
- Event tags
- Event description
- Analyst narrative
- Root attributes
- Every object
- Every object attribute
- Attribute type
- Attribute value
- Category
- Object relation
- Comment
- Tags
- Evidence manifest

Use **Print / Save PDF** to open the browser print dialog and save the report as a PDF.

PDF output uses the browser's print engine. The application does not include a third-party PDF library.

## Running the Application

### Local Use

Download the HTML file and open it in a modern browser:

```text
cti-workbench-wizard-v2.2.html
```

Most authoring, import, export, hashing, and reporting features work entirely in the browser.

Some browser features may be restricted when the file is opened directly with a `file://` URL, including:

- DNS-over-HTTPS requests
- Screen or window capture
- Clipboard or permission-controlled browser APIs

If those features are unavailable, serve the file from a local web server.

Example using Python:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/cti-workbench-wizard-v2.2.html
```

### Remote Hosting

The file can be hosted by any static web server. No application server or build step is required.

For remote screen-capture support, browsers generally require delivery through HTTPS.

## Security Design

The application follows a local-first and explicit-action model.

Implemented controls include:

- Restrictive Content Security Policy
- No third-party runtime dependencies
- No CDN resources
- No `eval()`
- No assignment to `innerHTML`
- DOM creation through explicit element APIs
- No rendering of imported email HTML
- No execution of RTF, OLE, or attachment content
- XML entity and DTD rejection in builds that accept XML
- Local SHA-256 evidence hashing
- Explicit DNS actions
- Explicit screen-capture permission
- Candidate review before enrichment results modify event data
- Blob URL revocation after downloads

### Network Access

The application is local-first. Network access is limited to analyst-initiated DNS-over-HTTPS requests to configured resolvers permitted by the Content Security Policy.

No imported CTI data is automatically submitted to an external enrichment service.

## Data Model

The project model is event-centered:

```text
Event
├── Metadata
├── Tags
├── Root Attributes
├── Objects
│   └── Attributes
├── Relationships
├── Evidence
└── History
```

An attribute contains fields similar to:

```json
{
  "id": "uuid",
  "category": "Network activity",
  "type": "ip-dst",
  "value": "192.0.2.10",
  "relation": "destination-ip",
  "toIds": true,
  "comment": "Observed in message routing headers",
  "tags": ["tlp:amber"],
  "provenance": {
    "method": "EML extractor",
    "source": "Received header",
    "at": "ISO-8601 timestamp"
  }
}
```

## Known Limitations

- STIX 1.x XML import is not supported
- STIX and MISP validation is conservative and is not official conformance certification
- STIX mapping is incomplete for MISP types without direct STIX equivalents
- Custom `x-misp-attribute` objects may not be accepted by tools that reject STIX custom objects
- MISP object-template validation is not complete
- MSG parsing remains more limited than EML parsing and requires additional real-world file testing
- DNS may be blocked by local-file or browser security restrictions
- Screen capture depends on browser permission and secure-context requirements
- PDF generation uses browser print-to-PDF
- Evidence records are not a substitute for a forensic evidence-management platform
- Imported content should still be reviewed by an analyst before sharing

## Recommended Analyst Workflow

1. Create a new event and enter its metadata.
2. Preview and commit supported STIX or MISP input.
3. Review root attributes and imported objects.
4. Correct MISP categories, types, values, relations, comments, and tags.
5. Create objects to group related attributes.
6. Extract EML or file candidates.
7. Review and apply selected candidates to the appropriate target.
8. Run contextual enrichment only when needed.
9. Attach supporting evidence.
10. Validate and preview the selected export format.
11. Download STIX, MISP, or project JSON.
12. Build and print the final report.

## Repository Structure

A minimal repository can use:

```text
.
├── README.md
├── cti-workbench-wizard-v2.2.html
├── LICENSE
└── samples/
    ├── sample-misp-event.json
    └── sample-stix-bundle.json
```

## Testing

Before publishing a release, test at minimum:

- Empty event creation
- Root attribute creation
- Object creation
- Inline attribute editing
- Attribute comments
- Separate `comment` attributes
- MISP import and round-trip export
- STIX 2.0 and 2.1 import
- STIX indicator-pattern preservation
- EML candidate extraction
- Candidate application to root and object targets
- DNS behavior from local and hosted contexts
- File hashing and evidence attachment
- Screen capture in a secure context
- Report completeness
- Browser print-to-PDF
- Project save and reload

## Privacy

CTI data may contain sensitive operational, organizational, or personal information. Review event classifications, tags, comments, evidence metadata, and export contents before sharing.

Avoid adding sensitive personal information unless it is necessary, authorized, and handled according to applicable organizational policy.

## Contributing

Issues and pull requests should include:

- A clear description of the problem or proposed behavior
- Browser and operating-system information
- A sanitized sample file when the issue concerns an importer or extractor
- Expected and observed output
- Security impact, if applicable

Do not submit live credentials, active malware, private keys, regulated data, or unredacted sensitive incident material.

## License

No license has been selected for this project yet. Add a `LICENSE` file before publicly distributing or accepting contributions.

## Disclaimer

This application is an analyst workbench, not an authoritative threat-intelligence platform, forensic suite, malware sandbox, or official STIX/MISP conformance validator. Validate exported data in the destination platform before production use or external sharing.
