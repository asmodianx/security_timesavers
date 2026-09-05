# CTI-to-Project Bridge Prototype

**Revision 1.0.1:** Corrects canonical PMBOK template initialization by separating the template process factory from project process lookup.

A standalone, offline browser application that converts CTI Intelligence Requirements Architect JSON into a project JSON file accepted by the PMBOK Predictive Process Wizard.

## Files

- `index.html`
- `styles.css`
- `app.js`

Keep the files together and open `index.html` locally. No web server, build process, CDN, package manager, or external library is required.

## Workflow

1. Import CTI Architect JSON containing `girs`, `fcrs`, `iers`, `dirs`, `pirs`, and `sirs`.
2. Review requirements and broken parent relationships.
3. Answer project identity, governance, scope, deliverable, ownership, schedule, quality, and handling questions.
4. Review the CTI-to-PMBOK field mapping.
5. Export a PMBOK project JSON containing the canonical five process groups and 49 process IDs.

## Project-generation behavior

- Starts from the PMBOK application's canonical process template.
- Keeps all generated process statuses at `not_started`.
- Does not invent sponsors, managers, owners, approvals, or dates.
- Places unresolved decisions in `TBD` notes or leaves unsupported fields blank.
- Adds source/provenance notes to directly derived and generated content.
- Maps CTI requirements into charter, requirements, scope, activity, communications, quality, risk, monitoring, and closure processes.

## Security design

- Restrictive Content Security Policy with no `unsafe-inline`.
- No network requests or third-party dependencies.
- Safe DOM construction with `textContent`, `createElement`, and `replaceChildren`.
- JSON file-size, nesting, property-count, array-length, type, priority, ID, and property allowlist validation.
- Prototype-pollution key rejection.
- No dynamic code execution.
- All processing remains in the browser.

## Input schema

The required CTI top-level shape is:

```json
{
  "girs": [],
  "fcrs": [],
  "iers": [],
  "dirs": [],
  "pirs": [],
  "sirs": []
}
```

## Output schema

The PMBOK export uses schema version `1.1`, project metadata, and the exact canonical group and process IDs expected by the PMBOK Predictive Process Wizard.

## Limitations

This is a prototype. It creates a project skeleton and proposed planning content, not an approved or execution-ready plan. Users must review mappings, assign authority, validate requirements, approve acceptance criteria, estimate resources and costs, and establish dates.

## Development rules

- Preserve offline operation and the canonical PMBOK process IDs/order.
- Do not add CDN dependencies or telemetry.
- Do not render imported values with `innerHTML`.
- Update validators whenever input or session schemas change.
- Keep generated work `not_started` unless a user explicitly changes it in the project-management application.

## Disclaimer

The bridge provides planning assistance based on imported requirements and user-entered setup information. It does not provide project approval, legal advice, security assurance, or confirmation that requirements are complete.
