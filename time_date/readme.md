# Standalone Timezone Clock and Calendar Tool

A single-file, vanilla HTML/CSS/JavaScript browser tool for creating timezone-aware clock widgets, comparing time across multiple timezones, and displaying the same selected date across multiple calendar systems.

This tool is designed to run without external dependencies, build steps, CDNs, package managers, or server-side code. It can be opened directly from the filesystem using `file://` or hosted from any standard web server.

---

## Features

### Clock Widgets

Create one or more visual clock widgets with customizable settings:

- Digital clock
- Analog clock
- Combined digital and analog clock
- Specific timezone selection
- Custom label/tag per clock
- Accent color per widget
- 12-hour or 24-hour display
- Optional seconds display
- Duplicate or remove existing widgets

Default widgets include local time, UTC, and London.

---

### Timezone Comparison Slider

The timezone comparison view lets users stack multiple timezones and move a time slider to compare what time it is across those zones.

Capabilities include:

- Add multiple timezones to a comparison stack
- Select a base date
- Move a 15-minute increment slider across a 24-hour day
- View corresponding local time and date for each timezone
- Visual day-position bar for each timezone
- Remove individual timezone rows
- Clear the entire comparison stack

This is useful for scheduling meetings, coordinating SOC handoffs, vendor support windows, incident response coordination, or multi-region operational planning.

---

### Calendar Stack

The calendar stack displays a selected date and time across multiple calendar systems and date standards.

Included calendar and date layers:

- Gregorian
- Julian
- Chinese
- Islamic Hijri
- Hebrew
- Buddhist
- Japanese
- Indian National
- Persian
- Coptic
- Ethiopic
- ISO Week Date
- Ordinal / Day-of-Year
- Unix Time
- Julian Day Number
- Modified Julian Day
- Rata Die

Some calendars are rendered using the browser's built-in `Intl.DateTimeFormat` calendar support. Built-in local calculations are included for Julian calendar conversion, ISO week date, Unix time, Julian Day Number, Modified Julian Day, Rata Die, and day-of-year.

---

### Configuration and Persistence

The tool stores configuration locally in the browser using `localStorage`.

Supported data actions:

- Export current configuration to JSON
- Import a previously exported JSON configuration
- Restore default clocks, timezone stack, and calendar layers
- Persist clock widgets and user selections across page reloads

Because storage is browser-local, configurations are not sent anywhere and are not shared between browsers unless exported/imported manually.

---

## Requirements

- A modern browser with JavaScript enabled
- No internet connection required after the file is saved locally
- No external JavaScript libraries
- No CDN dependencies
- No server-side components
- No build process

Recommended browsers:

- Microsoft Edge
- Google Chrome
- Mozilla Firefox
- Safari

Calendar availability may vary depending on the browser and operating system's built-in internationalization/calendar data.

---

## File Structure

This tool is intentionally implemented as a single standalone file:

```text
index.html
```

No additional files are required.

---

## Installation

### Option 1: Run Locally

1. Save the tool as `index.html`.
2. Open the file directly in a browser.
3. The browser address bar may show a `file://` path.
4. Use the tool normally.

Example:

```text
file:///C:/Users/example/Desktop/clock-tool/index.html
```

or:

```text
file:///home/example/clock-tool/index.html
```

---

### Option 2: Host on a Web Server

1. Copy `index.html` to a web-accessible directory.
2. Browse to the hosted page.
3. No additional server configuration is required for basic use.

Example:

```text
https://example.org/tools/clock-calendar/index.html
```

Because the tool does not load external scripts, stylesheets, fonts, or assets, it can be hosted as a static HTML file.

---

## How to Use

## 1. Create a Clock Widget

1. In the left panel, go to **Create Clock Widget**.
2. Enter a label or tag, such as:
   - `SOC Shift`
   - `UTC`
   - `Vendor Support`
   - `London Team`
3. Select a timezone.
4. Choose a clock type:
   - `Digital`
   - `Analog`
   - `Both`
5. Select an accent color.
6. Choose `12-hour` or `24-hour` format.
7. Choose whether to show seconds.
8. Click **Add Clock**.

The new clock appears in the **Clock Widgets** tab.

---

## 2. Duplicate or Remove a Clock

Each clock widget has action buttons:

- **Duplicate** creates a copy of the widget.
- **Remove** deletes the widget.

Changes are saved automatically in the browser.

---

## 3. Compare Multiple Timezones

1. Open the **Timezone Slider** tab.
2. In the left panel under **Timezone Comparison**, select a timezone.
3. Click **Add Timezone**.
4. Repeat as needed for additional timezones.
5. Select a base date.
6. Move the slider to compare times across the stacked timezones.

The slider uses 15-minute increments from `00:00` through `23:45`.

Each timezone row shows:

- Short timezone label
- Full timezone identifier
- Corresponding local time
- Corresponding local date
- A visual position marker across the day

---

## 4. Use the Calendar Stack

1. Open the **Calendar Stack** tab.
2. Select a calendar timezone from the left panel.
3. Select one or more calendar layers using the checkboxes.
4. Choose a calendar date and time in the main panel.
5. Review the rendered values for each selected calendar/date standard.

The calendar timezone controls how the selected instant is interpreted for calendar display.

---

## 5. Export Configuration

To save the current configuration:

1. Click **Export JSON**.
2. Save the downloaded file.

The exported JSON includes:

- Theme setting
- Clock widgets
- Timezone comparison stack
- Calendar layers
- Calendar timezone
- Selected dates/times
- Slider position

---

## 6. Import Configuration

To restore a saved configuration:

1. Click **Import JSON**.
2. Select a previously exported configuration file.
3. The tool validates and loads the configuration.

Invalid or unsupported values are sanitized where possible.

---

## 7. Restore Defaults

To return the tool to its default configuration:

1. Click **Restore Defaults**.
2. Confirm the prompt.

This resets:

- Clock widgets
- Timezone comparison stack
- Calendar layers
- Calendar date/time selections
- Theme setting

---

## Data Storage and Privacy

This tool does not transmit data to a server.

Configuration is stored in the browser's local storage under the key:

```text
standaloneClockCalendarStateV1
```

Data remains local to the browser profile unless the user exports and shares the JSON configuration file.

If browser storage is cleared, the saved configuration may be lost.

---

## Browser Compatibility Notes

The tool uses standard browser APIs, including:

- `Intl.DateTimeFormat`
- `Date`
- `localStorage`
- `Blob`
- `URL.createObjectURL`
- `FileReader`

Most modern browsers support these APIs. However, some non-Gregorian calendar displays depend on the browser and operating system's internationalization data. If a calendar is unsupported, the tool displays a fallback message for that calendar layer.

---

## Known Limitations

- The timezone list is predefined rather than dynamically loaded from an external timezone database.
- Timezone and daylight saving behavior depend on the browser's built-in timezone data.
- Some non-Gregorian calendars may not be available in all browsers.
- The comparison slider uses the browser's local timezone as the base instant for the selected date/time.
- This is a lightweight standalone utility, not a replacement for a full calendaring or scheduling platform.

---

## Suggested Use Cases

- SOC shift coordination
- Incident response bridge planning
- Vendor support window comparison
- Global team scheduling
- UTC/local time conversion
- Multi-region operational dashboards
- Calendar/date standard reference
- Training and tabletop exercises involving distributed teams

---

## Security Notes

- No external scripts are loaded.
- No CDN dependencies are used.
- No data is sent over the network by the application code.
- JSON import is parsed and sanitized before being applied to application state.
- The tool is suitable for static hosting or local offline use.

As with any locally opened HTML file, users should only import configuration JSON files from trusted sources.

---

## Customization

The tool can be customized by editing `index.html` directly.

Common customization areas:

### Add or Remove Timezones

Edit the `TIMEZONES` array in the JavaScript section.

Example:

```javascript
var TIMEZONES = [
  "UTC",
  "America/Chicago",
  "Europe/London",
  "Asia/Tokyo"
];
```

### Add or Remove Calendar Layers

Edit the `CALENDARS` array in the JavaScript section.

Example:

```javascript
var CALENDARS = [
  { id: "gregory", label: "Gregorian" },
  { id: "julian", label: "Julian" },
  { id: "isoWeek", label: "ISO Week Date" }
];
```

### Change Default Widgets

Edit the `defaultState()` function and update the `clocks` array.

---

## Troubleshooting

### The page opens but my settings are gone

Browser local storage may have been cleared, or the page may be running under a different browser profile or path. Restore a saved configuration using **Import JSON** if available.

### A calendar says it is unsupported

That calendar may not be supported by the browser's built-in internationalization data. Try another modern browser or use one of the locally calculated layers such as Julian, ISO Week, Unix Time, Julian Day, Modified Julian Day, Rata Die, or Ordinal Day.

### The timezone output looks unexpected

Timezone and daylight saving behavior come from the browser's timezone database. Confirm the selected date, selected timezone, and browser/OS timezone data.

### The import does not load everything

The import process validates values and ignores unsupported or malformed fields. Confirm that the JSON file was exported from this tool or follows the expected structure.

---

## Version

Initial standalone version: `1.0.0`

---

## License / Usage

No license is embedded in the tool by default. Add an appropriate license statement before distributing publicly if required by your organization.
