# Standalone Task Checklist

A single-file, local-first HTML/JavaScript task checklist utility for creating printable nested task lists with due dates, JSON backup/restore, and controlled iCalendar export.

This tool is designed to run entirely in the browser with **no CDN dependencies, no external JavaScript libraries, and no network access required**. It can be opened directly from a local file path and used offline.

## Features

- Create top-level tasks.
- Create unlimited nested subtasks, including sub-subtasks and deeper levels.
- Record task details/notes.
- Record due dates and times.
- Mark tasks complete or incomplete.
- Automatically mark child subtasks complete when a parent task is checked.
- Search tasks and task details.
- Filter by:
  - All tasks
  - Open tasks
  - Completed tasks
  - Tasks with due dates
  - Overdue tasks
- Expand or collapse nested task sections.
- Export the checklist as JSON.
- Import a checklist from JSON.
- Print the checklist or save it as a PDF using the browser print dialog.
- Export due-date tasks to iCalendar `.ics` format.
- Includes iCalendar export guardrails to help prevent excessive calendar event creation.

## Files

| File | Description |
|---|---|
| `standalone_task_checklist.html` | The complete standalone checklist application. |
| `README.md` | This documentation file. |

## Requirements

A modern web browser such as:

- Microsoft Edge
- Google Chrome
- Mozilla Firefox
- Safari

No web server is required. No package manager is required. No build step is required.

## Quick Start

1. Download or copy `standalone_task_checklist.html` to your workstation.
2. Open the file directly in a web browser.
3. Add tasks using the **Add / Edit Task** form.
4. Use **Add subtask** on any task to create nested child tasks.
5. Use **Export JSON** periodically to create a portable backup.

## Creating Tasks

1. Enter a task title in the **Task title** field.
2. Optionally enter details in the **Details** field.
3. Optionally select a due date and time using the **Due date and time** picker.
4. Click **Add Task**.

The task will appear in the checklist area.

## Creating Subtasks

1. Find the task that should contain the subtask.
2. Click **Add subtask** on that task.
3. Enter the subtask title, details, and optional due date/time.
4. Click **Add Task**.

Subtasks can contain their own subtasks, allowing deeply nested task structures.

## Editing Tasks

1. Click **Edit** on an existing task.
2. Update the title, details, or due date/time.
3. Click **Save Changes**.

To exit edit mode without saving, click **Cancel**.

## Completing Tasks

- Check the box next to a task to mark it complete.
- Uncheck the box to mark it open again.
- When a parent task is checked, its child subtasks are also marked complete.

## Searching and Filtering

Use the search box above the checklist to search across task titles and details.

Use the filter dropdown to show:

- **All tasks**
- **Open only**
- **Completed only**
- **With due date**
- **Overdue**

Use **Expand All** or **Collapse All** to control nested task visibility.

## Saving and Local Storage

The tool automatically saves checklist data in the browser's `localStorage` under the key:

```text
standalone-task-checklist-v1
```

This means data remains available in the same browser profile after the page is closed and reopened.

Important notes:

- Browser local storage is local to the browser profile and device.
- Clearing browser site data may delete saved tasks.
- Opening the file in a different browser or on another computer will not automatically transfer tasks.
- Use **Export JSON** for backups or migration.

## Exporting JSON

Click **Export JSON** to download a file named:

```text
task-checklist.json
```

The exported JSON includes:

- Application data version
- Export timestamp
- Task hierarchy
- Task titles
- Details
- Due dates
- Completion state
- Created/updated timestamps
- Nested children

## Importing JSON

1. Click **Import JSON**.
2. Select a previously exported checklist JSON file.
3. Confirm the replacement prompt.

Importing replaces the current checklist in the browser. Export your current checklist first if you need a backup.

## Printing or Exporting to PDF

The utility does not use an external PDF library. Instead, it uses the browser's built-in print capability.

To create a PDF:

1. Click **Print / Save PDF**.
2. In the browser print dialog, choose **Save as PDF** or your system's PDF printer.
3. Confirm the destination and save the file.

The print view is optimized to include:

- Task hierarchy
- Printable checkboxes
- Task titles
- Task details
- Due date/time metadata

Interactive controls are hidden during printing.

## Exporting iCalendar Due-Date Events

Click **Export iCal** to create an `.ics` calendar file from tasks that have due dates.

The generated file is named:

```text
task-due-dates.ics
```

Each exported task becomes a calendar event with:

- Task title as the event summary
- Due date/time as the event start time
- A default 30-minute event duration
- Task path in the event description
- Task details in the event description
- Completion state in the event description/status

## iCalendar Export Guardrails

The iCalendar export dialog includes controls to reduce the risk of generating too many calendar events.

Available controls:

| Control | Purpose |
|---|---|
| Maximum events | Limits how many events can be exported. Defaults to `100`. Hard capped at `500`. |
| Maximum task depth | Limits how deep nested tasks can be included. |
| Start date | Excludes due-date tasks before the selected date/time. |
| End date | Excludes due-date tasks after the selected date/time. |
| Include completed tasks | Allows completed tasks to be included if checked. Completed tasks are excluded by default. |
| Large export confirmation | Requires explicit acknowledgement when the eligible event count exceeds the configured maximum. |

If the eligible task count is higher than the configured maximum, export is blocked unless the confirmation checkbox is selected. Even then, the exported list is limited to the configured maximum event count.

## Security and Privacy Notes

This tool is intended to be local-first and privacy-preserving.

Security-conscious design choices include:

- No CDN usage.
- No external JavaScript libraries.
- No network calls.
- No server-side storage.
- Task data remains in browser local storage unless manually exported.
- Imported task text is rendered using DOM APIs and `textContent`, not dynamic HTML injection.
- JSON import is sanitized to expected task fields and length-limited.
- Downloaded exports are generated locally in the browser.

Operational considerations:

- Treat exported JSON files as potentially sensitive if they contain work details, incident notes, names, dates, or internal project information.
- Store exported JSON and `.ics` files according to your organization's data handling requirements.
- Review imported JSON before use if it comes from an untrusted source.
- Calendar imports can create events in the target calendar application; use the guardrails before importing `.ics` files into production calendars.

## Data Format Overview

A simplified exported task object looks like this:

```json
{
  "id": "task-id",
  "title": "Review incident report",
  "details": "Confirm timeline and action items.",
  "due": "2026-06-18T15:30",
  "completed": false,
  "createdAt": "2026-06-18T18:00:00.000Z",
  "updatedAt": "2026-06-18T18:05:00.000Z",
  "children": []
}
```

The full export wraps tasks in a versioned object:

```json
{
  "version": 1,
  "exportedAt": "2026-06-18T18:00:00.000Z",
  "tasks": []
}
```

## Backup Recommendations

For important checklists:

1. Export JSON regularly.
2. Store backups in an approved location.
3. Use descriptive filenames, for example:

```text
project-task-checklist-2026-06-18.json
```

4. Export before importing another checklist.
5. Export before clearing browser data.

## Troubleshooting

### My tasks disappeared

Possible causes:

- Browser local storage was cleared.
- The file was opened in a different browser profile.
- The file was opened on a different workstation.
- Private/incognito browsing mode was used.

Restore from a previously exported JSON backup if available.

### The PDF button does not directly download a PDF

This is expected. The tool uses the browser print dialog to avoid external PDF libraries. Select **Save as PDF** in the print dialog.

### My calendar import created too many events

Before importing an `.ics` file into a calendar application, use the iCalendar export controls to narrow the export by date range, depth, completion state, and maximum event count.

### Imported JSON failed

The import file must contain either:

- A top-level `tasks` array, or
- A raw array of task objects

Malformed JSON or unsupported structures will be rejected.

## Limitations

- No multi-user synchronization.
- No cloud storage.
- No recurring calendar events.
- No notifications or reminders inside the tool.
- No direct calendar API integration.
- PDF export depends on browser print behavior.
- Data is scoped to the browser profile unless exported/imported manually.

## Suggested Usage Patterns

This utility works well for:

- Project task breakdowns
- Incident response checklists
- Audit preparation checklists
- Implementation runbooks
- Meeting follow-up task lists
- Personal work planning
- Offline checklist management

## License

No license is embedded in the generated file. Add the license that matches your intended use before publishing or distributing the tool.
