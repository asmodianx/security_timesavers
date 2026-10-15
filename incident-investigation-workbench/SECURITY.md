# Security

## Boundary
Static, offline application. No backend, accounts, telemetry or network access. CSP:
`default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'`.
No inline scripts, inline styles or event-handler attributes.

## Untrusted input
Case files, STIX bundles, MISP events, CSV files, email artifacts, evidence file names, notes and anything typed are
treated as data:
- Rendered only through `textContent`, text nodes and `createElement` (no `innerHTML`, `eval`, `new Function`).
- **Markdown** is parsed into a fixed set of elements (headings, paragraphs, emphasis, code, lists, quotes, tables,
  rules). Raw HTML in a note is shown as text. Links are rendered as text, not anchors, so notes cannot navigate or
  trigger requests.
- JSON: 4 MiB, depth 32, 100,000 values; `__proto__`, `prototype`, `constructor` keys rejected.
- CSV: 10 MiB, 5,000 rows per import. Notes: 1 MiB each. Key and signature files: 8 MiB.
- Every import is validated and previewed before it changes the case.

## Storage
Browser `localStorage` holds autosave copies for recovery and is readable by anyone with access to the browser
profile. It is not an evidence store. Evidence file contents are never stored; only hashes and metadata. Evidence
notes and phase notes are stored in the case because they are authored in the tool; treat the case file with the
same handling as the evidence it describes.

## Signing keys
See CRYPTOGRAPHY.md. Keys are loaded from files, used in memory and cleared after signing.

## Third-party code
One dependency, OpenPGP.js, vendored with a recorded checksum. No CDN.

## Reporting a vulnerability
Report privately to the Security Time Savers maintainer. Do not weaken the output boundary by inserting case content
or rendered Markdown with `innerHTML`.
