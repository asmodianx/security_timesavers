# Con Scroller standalone bundle

Open `con_scroller.html` locally. Keep `app.js`, `styles.css`, and `config.js` in the same directory.

## Default configuration
Edit `config.js` to define the automatically loaded schedule. The browser validates and normalizes all configuration values. Changes made in the UI are stored in localStorage and override `config.js`; use **Clear browser override** to return to the file configuration.

## Features
- Follow Now centers the current-time line; manual wheel/touch scrolling pauses recentering for 10 seconds.
- Summary Mode displays every scheduled event in chronological order and advances through event cards automatically.
- Overlapping events are assigned to independent columns, regardless of category or track, so talks, workshops, villages, and other concurrent items do not cover one another.
- JSON import/export, local autosave, configurable categories, local logo, dark theme, and responsive layout.

## Security design
- No external libraries, CDNs, network calls, dynamic code execution, or HTML injection.
- Strict CSP blocks scripts and resources outside the local bundle; inline styles are allowed only because timeline positions and category colors are calculated locally.
- Imported data is size-limited, type-checked, normalized, length-limited, and rendered with `textContent`/DOM APIs.
- Logos are restricted to approved raster image MIME types and 2 MB.
- Event imports are capped at 5,000 records and JSON files at 5 MB.

For stronger deployment controls, serve the directory from a local web server and set the CSP as an HTTP response header.
