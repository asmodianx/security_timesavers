# Tests

## Automated (maintainers)
    node tests/dev/smoke.js
Drives all eight tabs through a minimal DOM stub with a mock OpenPGP object (76 checks). Exits non-zero on failure.

## In the application
Task 1.6 **Run self-tests**: hostile JSON cases, prototype-pollution check, native round trip, OpenPGP library presence.

## Browser acceptance checklist (Edge, Chrome, Firefox)
1. Open `index.html` from a local folder. Status bar shows no failed features; 1.6 all PASS.
2. Work tabs 1 → 8 in order (NIST lifecycle); reload the page and confirm the case recovers.
3. **Save case file**, **New case**, **Open case file**; confirm all content, including notes, returns.
4. Enter `<img src=x onerror=alert(1)>` as an entity name, case title and in a phase note; confirm it displays as text.
5. Add two notes to a phase, preview, edit one, delete one. Check headings, bold, lists, checklists, tables and code
   blocks render. Confirm a `[link](https://example.org)` shows as text and is not clickable.
6. Register a Markdown evidence note (2.3). In 2.9 download it and run `shasum -a 256` on the file: it must equal the register.
7. Declare an incident in 4.5; confirm status, Discovered and Declared update. Complete a containment action and confirm
   Contained is recorded. Add a 72 h obligation (1.3) and confirm 7.1 shows its deadline.
8. Import a CSV export; check the suggested mapping, preview, commit.
9. Export STIX 2.0 (8.5) and re-import it (2.7). A bundle with a bad id must not merge.
10. Build every report type (8.4), including technical (phase notes) and evidence manifest (evidence-note content); Print / Save as PDF.
11. Sign (8.6) with a test key, download both files, then verify in 8.7 → GOOD; `gpg --verify file.json.asc file.json`
    → Good signature; change one character in the JSON → BAD.
12. With developer tools → Network open, repeat steps 2–11: no requests other than the application's own files.
