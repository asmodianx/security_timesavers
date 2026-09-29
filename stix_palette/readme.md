# ⬡ STIX Palette v2

**A standalone, browser-based visual composer for STIX 2.1 threat intelligence graphs.**

No server. No CDN. No build step. Drop the four files in a folder and open `index.html`.

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [STIX 2.1 Object Coverage](#stix-21-object-coverage)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
  - [Adding Objects](#adding-objects)
  - [Creating Relationships](#creating-relationships)
  - [Editing Properties](#editing-properties)
  - [Visual Layout Tools](#visual-layout-tools)
  - [Import & Export](#import--export)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
- [File Structure](#file-structure)
- [Security & OWASP Compliance](#security--owasp-compliance)
- [Limitations & Known Issues](#limitations--known-issues)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

STIX Palette v2 is a fully client-side threat intelligence diagramming tool built on the [STIX 2.1 specification](https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html). It allows analysts to visually construct, edit, import, and export STIX bundles without requiring any backend infrastructure, installed software, or internet connectivity.

It is designed for use in security operations, threat intelligence workflows, and incident response reporting — including in air-gapped or restricted environments.

```
stix_palette/
├── index.html       ← Entry point (open this in a browser)
├── app.js           ← Application logic, canvas engine, import/export
├── stix_schema.js   ← STIX 2.1 object definitions and field schemas
└── style.css        ← Dark-theme UI stylesheet
```

---

## Screenshots

> **Demo data loads automatically on first open** — a Threat Actor → Malware → Vulnerability chain showing the graph, relationship labels, and properties panel.

| Feature | Description |
|---|---|
| 🖼 Canvas | SVG force graph with curved bezier edges and labeled arrows |
| 📋 Properties Panel | Full field editor for every STIX 2.1 attribute |
| 🗺 Minimap | Bottom-right overview; click to pan |
| 🎨 Palette | Categorized, searchable object picker on the left |

---

## Features

### 🎨 Visual Graph Canvas
- **SVG-based force graph** — nodes, curved bezier edges, labeled relationship arrows
- Each node displays: **object type** (top color strip), **emoji icon**, **friendly type label**, and **name/value**
- Color-coded by STIX category:
  - 🔵 **SDO** — Domain Objects (`#4fc3f7` blue)
  - 🟢 **SRO** — Relationship Objects (`#81c784` green)
  - 🟣 **SCO** — Cyber Observables (`#ce93d8` purple)
  - 🟠 **Meta** — Meta Objects (`#ffb74d` orange)
- **Minimap** with click-to-pan navigation
- **Pan** with middle-click drag or Alt+left-drag
- **Zoom** with scroll wheel, `+`/`−` buttons, or `Fit` button

### ⚙️ Physics & Layout
| Button | Algorithm | Description |
|---|---|---|
| ⚛ Force | Force-directed | Repulsion + link attraction + center gravity; settles automatically |
| ⟳ Gravity | Toggle on/off | Continuous force simulation while editing |
| 🔵 Radial | Circular | All nodes arranged in a circle |
| 🌳 Tree | BFS Hierarchy | Root nodes at top, children below; auto-detects graph roots |
| ⊞ Grid | Uniform grid | Rows/columns sized by sqrt of node count |
| ⤢ Fit | Auto-zoom | Fits all objects into the visible viewport |

### 📋 Full STIX Object Editor
- Clicking any node or edge opens a **Properties Panel** with every STIX 2.1 field for that type
- **Input types supported:** text, number, datetime, select/dropdown, boolean checkbox, tags (comma or Enter to add), JSON editor (with validation), kill chain phase builder, external reference builder (CVE-style)
- Required fields are marked with `*`
- Identity fields (ID, created, modified, spec_version) are shown read-only
- **Save** button updates the `modified` timestamp; changes are reflected immediately in the graph

### 📦 Import / Export

| Button | Format | Description |
|---|---|---|
| ⬆ Import | STIX 2.1 JSON / palette state | Loads a STIX bundle or saved palette session |
| ⬇ Export | Palette state JSON | Saves all objects + node positions for re-opening |
| 📦 Bundle | STIX 2.1 bundle | Clean `bundle` JSON for MISP, TAXII, or other CTI tools |
| 🖼 SVG | SVG image | Exports the diagram as a standalone SVG with all styles inlined |
| 🖨 Print PDF | Browser print dialog | Opens a print-ready popup with legend and object summary table; use browser "Save as PDF" |

---

## STIX 2.1 Object Coverage

**40 total object types** with full field schemas.

### Domain Objects (SDO) — 18 types
| Object | Icon | Object | Icon |
|---|---|---|---|
| Attack Pattern | ⚔ | Malware | 🦠 |
| Campaign | 🎯 | Malware Analysis | 🔬 |
| Course of Action | 🛡 | Note | 📝 |
| Grouping | 📂 | Observed Data | 👁 |
| Identity | 🪪 | Opinion | 💬 |
| Indicator | 🔍 | Report | 📊 |
| Infrastructure | 🖧 | Threat Actor | 😈 |
| Intrusion Set | 🕵 | Tool | 🔧 |
| Location | 📍 | Vulnerability | ⚠ |

### Relationship Objects (SRO) — 2 types
| Object | Icon | Notes |
|---|---|---|
| Relationship | ↔ | 26 standard `relationship_type` values supported |
| Sighting | 👀 | Rendered with dashed yellow edge |

### Cyber Observable Objects (SCO) — 18 types
`artifact` · `autonomous-system` · `directory` · `domain-name` · `email-addr` · `email-message` · `file` · `ipv4-addr` · `ipv6-addr` · `mac-addr` · `mutex` · `network-traffic` · `process` · `software` · `url` · `user-account` · `windows-registry-key` · `x509-certificate`

### Meta Objects — 2 types
`marking-definition` · `extension-definition`

---

## Getting Started

### Requirements
- Any modern browser (Chrome, Firefox, Edge, Safari)
- No internet connection required
- No server, Node.js, or build tools needed

### Installation

```bash
# Clone the repo
git clone https://github.com/asmodianx/security_timesavers.git

# Navigate to the tool
cd security_timesavers/stix_palette
```

Then open `index.html` directly in your browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or simply drag `index.html` into an open browser window.

> **Note:** No web server is required. All four files must remain in the same directory.

---

## Usage Guide

### Adding Objects

1. **Browse** the left palette panel — objects are grouped by category (SDO, SRO, SCO, Meta)
2. **Search** by typing in the filter box at the top of the palette
3. **Drag** any object onto the canvas to place it
4. The object is auto-selected and its properties open in the right panel

### Creating Relationships

1. **Hover** over any node — a blue connection handle (●) appears on the right edge
2. **Drag** from the handle to another node
3. A dialog appears to choose the relationship type (`relationship` or `sighting`) and label
4. The relationship edge is drawn with a labeled curved arrow

> **Tip:** `sighting` relationships render as dashed yellow arrows; `relationship` objects render as solid blue arrows with the `relationship_type` label.

### Editing Properties

1. **Click** any node or edge to open the Properties Panel on the right
2. Edit any field — changes are applied immediately to the in-memory object
3. Click **💾 Save** to update the `modified` timestamp and refresh the node label
4. Click **🗑 Delete** to remove the selected object (and any connected edges)
5. Press `Esc` or click **✕** to deselect without saving

**Tags fields:** Type a value and press `Enter` or `,` to add. Press `Backspace` on an empty input to remove the last tag.

**JSON fields:** Enter valid JSON. An invalid entry is highlighted in red and not applied.

**Kill Chain Phases:** Add rows with kill chain name + phase name. Used on Attack Pattern, Indicator, Malware, Tool.

**External References:** Add CVE-style references with source name, URL, and external ID.

### Visual Layout Tools

| Action | How |
|---|---|
| Pan the canvas | Middle-click drag, or Alt + left-click drag |
| Zoom in/out | Scroll wheel, or `+`/`−` buttons |
| Fit all objects | Click **⤢ Fit** or press `F` |
| Force layout | Click **⚛ Force** to run one settling pass |
| Continuous gravity | Click **⟳ Gravity** or press `G` to toggle |
| Radial layout | Click **🔵 Radial** |
| Tree layout | Click **🌳 Tree** |
| Grid layout | Click **⊞ Grid** |
| Move a node | Left-click drag |
| Minimap navigation | Click anywhere on the minimap to pan to that area |

### Import & Export

#### Importing a STIX Bundle
1. Click **⬆ Import**
2. Select a `.json` file — accepts:
   - Standard STIX 2.1 `bundle` (`{"type":"bundle","objects":[...]}`)
   - Palette session state (previously exported with **⬇ Export**)
   - Raw array of STIX objects

#### Exporting

| Goal | Button | Output |
|---|---|---|
| Save session with layout | **⬇ Export** | `stix_palette_state.json` — re-importable with node positions preserved |
| Share with MISP / TAXII | **📦 Bundle** | `stix_bundle.json` — valid STIX 2.1 bundle |
| Embed in a report | **🖼 SVG** | `stix_diagram.svg` — standalone, all styles inlined |
| Create a PDF report | **🖨 Print PDF** | Opens print popup → use browser "Save as PDF" |

#### Print PDF Report Contents
- Title, timestamp, object/relationship counts
- Color legend (SDO / SRO / SCO / Meta)
- Full diagram (SVG embedded)
- Object summary table (type, label, name/value, STIX ID)

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Delete` / `Backspace` | Delete selected object or relationship |
| `Escape` | Deselect / close properties panel |
| `F` | Fit all objects to screen |
| `G` | Toggle gravity simulation |
| Scroll wheel | Zoom in / out |
| Alt + drag | Pan canvas |
| Middle-click drag | Pan canvas |

---

## File Structure

```
stix_palette/
│
├── index.html
│   Entry point. Defines the app shell (header, palette panel,
│   SVG canvas, properties panel, modal overlay). Sets a strict
│   Content-Security-Policy meta tag. No inline scripts.
│
├── style.css
│   Dark-theme stylesheet. Uses CSS custom properties (variables)
│   for all colors. Includes @media print rules that hide UI
│   chrome when printing from the main window.
│
├── stix_schema.js
│   STIX 2.1 object registry. Exports the STIX_SCHEMA constant
│   containing all 40 object type definitions: type, label, icon,
│   category, description, required fields, and full field schemas
│   (including field types, select options, and validation hints).
│   No DOM access. No side effects. Pure data module.
│
└── app.js
    Main application. Manages canvas state (objects, nodes, edges),
    SVG rendering, force-directed physics, drag-and-drop, pan/zoom,
    properties panel, import/export, SVG export, and print/PDF.
    All DOM manipulation uses safe APIs (textContent, createElement,
    appendChild). No innerHTML of user-supplied data.
```

---

## Security & OWASP Compliance

This tool is designed for use in security-sensitive environments. The following OWASP controls are enforced throughout the codebase:

| Control | Implementation |
|---|---|
| **No XSS via innerHTML** | All DOM manipulation uses `textContent`, `createElement`, `appendChild`, `createTextNode` — never `innerHTML` or `outerHTML` with user data |
| **No code injection** | `eval()`, `new Function()`, and `setTimeout(string)` are never used |
| **Input validation** | All imported JSON is parsed in `try/catch`; STIX object keys are validated against an alphanumeric allowlist regex before being stored |
| **Input sanitization** | String values are length-capped on import; object keys with unexpected characters are silently dropped |
| **Safe SVG serialization** | SVG export uses `XMLSerializer.serializeToString()` — no string concatenation of user data into markup |
| **Safe print popup** | The print window is built entirely with DOM APIs; `doc.write()` is not used for user content |
| **Blob URL hygiene** | All `URL.createObjectURL()` calls are paired with `URL.revokeObjectURL()` after use |
| **Content Security Policy** | `<meta http-equiv="Content-Security-Policy">` restricts script sources to `'self'` and `'unsafe-inline'` (required for the same-file architecture) |
| **Strict mode** | `'use strict'` declared in both `app.js` and `stix_schema.js` |
| **No external dependencies** | Zero CDN calls, zero npm packages, zero network requests at runtime |

---

## Limitations & Known Issues

- **Browser pop-up blocker:** The Print PDF feature opens a new window. If your browser blocks pop-ups for local files, either allow pop-ups for `file://` origins or use the **🖼 SVG** export instead and print from an image viewer.
- **Large graphs:** Force layout performance degrades above ~150 nodes. Use Grid or Tree layout for large bundles.
- **SCO edge routing:** Cyber Observable objects (SCO) can be connected via relationships but the tool does not enforce STIX 2.1 SCO reference constraints (e.g., `resolves_to_refs`) as visual edges — those are managed through the properties panel only.
- **No undo/redo:** Deletes are immediate. Export your session before making bulk changes.
- **Marking definitions:** `marking-definition` objects are rendered as nodes but the tool does not automatically apply `object_marking_refs` visually.

---

## Contributing

Pull requests are welcome. If you are adding a new STIX object type or field, all schema changes belong in `stix_schema.js` — `app.js` is schema-agnostic and renders whatever fields are declared there.

Please maintain:
- Zero external dependencies
- OWASP-safe DOM manipulation (no `innerHTML` of user data)
- `'use strict'` in all JS files
- Consistent dark-theme CSS variable usage in `style.css`

---

## Related Tools in this Repository

This tool is part of the [`security_timesavers`](https://github.com/asmodianx/security_timesavers) collection:

| Tool | Description |
|---|---|
| **stix_palette** | ← This tool — STIX 2.1 visual composer |
| **stix_palette / STIX2 export** | Produces MISP-importable STIX 2.1 bundles |
| **risk_register** | Risk register and assessment workflow tool |

---

## License

See [LICENSE](../../LICENSE) in the repository root.

---

*Built for the KU IT Security Office. STIX 2.1 specification: [docs.oasis-open.org](https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html)*
