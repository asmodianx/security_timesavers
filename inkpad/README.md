# InkPad Local — Milestone 16 Final Fixed

This build fixes the `Cannot set properties of null (setting 'onclick')` startup error by ensuring every referenced UI ID exists and by using guarded event binding.

## Final Scope

OCR and handwriting recognition UI has been removed because automatic recognition engines were not implemented. Imported notebooks that contain `recognition.ocr` or `recognition.ink` metadata preserve that metadata in JSON for backward compatibility only.

## Features

- Canvas handwriting with mouse, touch, or stylus
- Pen, highlighter, and eraser
- Multi-page notebook
- Page duplicate, delete, reorder, and clear
- Page titles, notes, and tags
- Text objects
- Object lock/hide controls
- Search across page metadata and text objects
- JSON bundle import/export
- Autosave and recovery via localStorage
- PNG export for current/all pages
- Browser print preview and print-to-PDF workflow
- No CDN libraries
- No backend
- No telemetry

## Security Notes

- Recognition UI disabled to avoid misleading non-functional capabilities.
- Import file size cap: 15 MB.
- JSON import schema migration and field normalization.
- Text length caps for notebook/page/object fields.
- UI uses DOM node creation and `textContent` for active user-controlled list rendering.
- CSP meta tag restricts script execution to local self and disables object/embed execution.
- No `eval()` or `new Function()`.
- No remote requests or CDN dependencies.

## Known Limitations

- No automatic OCR.
- No automatic handwriting recognition.
- No collaboration or sync.
- No encryption at rest.
- PDF export uses the browser print dialog.

## About the file:// warning

Some browsers emit a warning that `file:` URLs are unique security origins. This warning is not the fatal app bug. The fatal issue was the missing-element JavaScript binding, fixed in this build.
