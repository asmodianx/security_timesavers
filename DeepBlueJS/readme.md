# DeepBlueJS

Browser-based Windows event log triage utilities inspired by DeepBlue-style detection workflows.

## Overview

DeepBlueJS is a small collection of standalone investigation helpers for Windows event log review and detection engineering workflows. The toolkit is intended to help analysts collect Windows logs, inspect exported log data in a browser, and convert Sigma rules into a JSON-friendly format that can be consumed by browser-based detection logic or other lightweight tooling.

This directory contains three primary tools:

- `index.html` — Browser-based DeepBlueJS log analysis interface.
- `Sigma_to_SigmaJSON_Converter.html` — Browser-based Sigma rule conversion utility.
- `Extract-WindowsLogs.ps1` — PowerShell helper for exporting Windows event logs for offline review.

The tools are designed for local/offline analyst workflows and are useful when you need a lightweight, dependency-minimal way to review Windows log exports or prepare detection content without standing up a full SIEM pipeline.

## Important Security Disclaimer

Use caution when loading log files, Sigma rules, or any other inputs from unknown or untrusted sources.

Windows event logs, exported text, JSON, XML, CSV, Sigma YAML, and other parsed artifacts may contain attacker-controlled strings. If those values are inserted into the browser DOM as HTML instead of displayed as plain text, they can create a cross-site scripting risk. This is especially important for browser-based analysis tools because malicious log content could include HTML, SVG, JavaScript event handlers, script-like payloads, encoded markup, or other strings intended to execute when rendered.

Recommended handling precautions:

- Treat all imported logs and rules as untrusted input.
- Prefer displaying parsed values with `textContent` or equivalent safe text rendering instead of `innerHTML`.
- Avoid loading unknown samples in a browser profile that has sensitive authenticated sessions open.
- Consider using a dedicated browser profile, temporary VM, or disposable analysis workstation for suspicious logs.
- Do not import logs that may contain regulated, confidential, or personally identifiable information unless you are authorized to handle that data.
- Review generated output before sharing it externally.

## Tool Descriptions

### `index.html` — DeepBlueJS Log Analyzer

`index.html` is the main browser-based analysis interface. It is intended to let an analyst load exported Windows event log data and review events for suspicious patterns commonly associated with Windows compromise, post-exploitation activity, account abuse, service installation, scheduled task abuse, log clearing, and other host-based indicators.

Typical use cases include:

- Reviewing exported Windows Security, System, and PowerShell-related event data.
- Performing quick triage of logs from a potentially compromised Windows endpoint.
- Searching or filtering event records for suspicious activity.
- Mapping parsed events to detection logic derived from built-in checks or Sigma-style rules.
- Supporting offline review where a full SIEM is not available.

Suggested workflow:

1. Export relevant Windows logs from the source host using Event Viewer, `wevtutil`, PowerShell, or the included `Extract-WindowsLogs.ps1` helper.
2. Open `index.html` in a modern browser.
3. Load the exported log artifact supported by the page.
4. Review parsed events, alerts, matched detections, and any summary output.
5. Validate findings against source logs before making incident-response decisions.

Analyst notes:

- Browser-only analysis is best suited for triage and review, not as the sole source of evidence.
- Large logs may be constrained by browser memory and performance limits.
- Detection results should be treated as leads requiring analyst validation.

### `Sigma_to_SigmaJSON_Converter.html` — Sigma Rule Converter

`Sigma_to_SigmaJSON_Converter.html` is a standalone conversion utility for transforming Sigma rule content into a JSON-oriented representation. This can be useful when detection rules need to be embedded in JavaScript tools, stored as structured browser-readable data, or reviewed in a normalized format.

Typical use cases include:

- Converting Sigma YAML-style detection content into JSON-like detection objects.
- Preparing rules for use in browser-side analysis tools.
- Reviewing Sigma fields, logsource metadata, detection selections, conditions, tags, and rule metadata in a structured format.
- Supporting lightweight detection engineering without requiring a backend parser.

Suggested workflow:

1. Open `Sigma_to_SigmaJSON_Converter.html` in a modern browser.
2. Paste or load Sigma rule content.
3. Run the conversion process.
4. Review the generated JSON output for accuracy.
5. Save or copy the converted output for use with DeepBlueJS or other tools.

Analyst notes:

- Sigma syntax can vary between rule authors and repositories; manually validate converted rules.
- Complex Sigma conditions may require review before they are used in production detection logic.
- Conversion output should be tested against representative log samples.

### `Extract-WindowsLogs.ps1` — Windows Log Export Helper

`Extract-WindowsLogs.ps1` is a PowerShell collection helper intended to export Windows event logs from a system so they can be reviewed offline. This supports investigations where logs need to be collected from a host and analyzed later using DeepBlueJS or other forensic tools.

Typical use cases include:

- Exporting key Windows event logs for incident triage.
- Creating a portable evidence bundle for offline review.
- Collecting logs from Security, System, Application, PowerShell, and other relevant Windows channels.
- Preserving logs before remediation actions are performed.

Suggested workflow:

1. Run PowerShell with the permissions required to read the desired event logs.
2. Execute `Extract-WindowsLogs.ps1` from a trusted location.
3. Save exported logs to a controlled evidence directory.
4. Record collection time, hostname, analyst, and case/ticket number if applicable.
5. Transfer logs using approved evidence-handling procedures.
6. Load the exported artifacts into `index.html` or another log review platform.

Operational notes:

- Some logs require administrative privileges to export.
- Exported logs may contain sensitive information, including usernames, hostnames, IP addresses, process command lines, domain details, and authentication events.
- Preserve original exports when possible and work from copies during analysis.
- Follow organizational evidence handling, retention, and privacy requirements.

## Recommended Logs for Triage

The most useful Windows log channels depend on endpoint configuration and audit policy, but common starting points include:

- Security
- System
- Application
- Windows PowerShell
- Microsoft-Windows-PowerShell/Operational
- Microsoft-Windows-Sysmon/Operational, if Sysmon is deployed
- Microsoft-Windows-TaskScheduler/Operational
- Microsoft-Windows-TerminalServices-LocalSessionManager/Operational
- Microsoft-Windows-TerminalServices-RemoteConnectionManager/Operational
- Microsoft-Windows-Windows Defender/Operational

## General Usage Pattern

1. Collect logs from the endpoint.
2. Preserve original evidence.
3. Open the browser-based tool locally.
4. Load copied/exported log data.
5. Review detections and parsed events.
6. Validate suspicious findings against the original logs.
7. Document findings, timestamps, affected accounts, affected hosts, and supporting evidence.
8. Escalate confirmed findings through the appropriate incident-response process.

## Data Handling Guidance

Because Windows event logs can contain sensitive operational and user data, analysts should handle exported logs carefully.

Recommended practices:

- Store exported logs in an approved secure location.
- Limit access to authorized investigation personnel.
- Avoid uploading sensitive logs to third-party tools unless explicitly approved.
- Redact sensitive values before sharing examples or screenshots.
- Maintain chain-of-custody notes when logs are used for formal investigations.
- Delete temporary working copies when they are no longer needed and retention requirements allow deletion.

## Browser Compatibility

These tools are intended for modern desktop browsers. For best results, use a current version of Microsoft Edge, Chrome, Firefox, or another standards-compliant browser.

Potential limitations:

- Very large files may exceed browser memory limits.
- Local file handling behavior may vary by browser.
- Some browser security controls may restrict local file access or downloads.
- Offline use should be tested before relying on the tool during an active incident.

## Security Recommendations for Maintainers

When maintaining or extending these tools, use secure browser coding practices:

- Render untrusted data as text, not HTML.
- Avoid `innerHTML` for parsed log values unless the content is strictly sanitized.
- Escape special characters before displaying user-controlled strings.
- Avoid dynamic script execution, including `eval`, `new Function`, and string-based event handlers.
- Keep parsing logic defensive and fail closed on malformed input.
- Add file size checks and graceful error handling for unsupported or malformed files.
- Keep detection logic transparent so analysts can understand why an event matched.
- Use Content Security Policy where practical, while recognizing that CSP in a local standalone HTML file has limitations.
- Do not send imported logs to remote services unless the user explicitly enables and understands that behavior.

## Validation Checklist

Before using the results operationally, confirm:

- The log source and hostname are correct.
- Timestamps are interpreted in the expected timezone.
- The event channel and event ID match the detection being reviewed.
- The detection logic applies to the operating system and audit policy in use.
- The matched event is not expected administrative activity.
- Corroborating evidence exists in additional logs, EDR telemetry, network data, or account activity.

## Suggested Repository Layout

```text
DeepBlueJS/
├── index.html
├── Sigma_to_SigmaJSON_Converter.html
├── Extract-WindowsLogs.ps1
└── README.md
```

## Troubleshooting

### The browser freezes or becomes slow

Try a smaller log export, split large logs by time range, or analyze only the most relevant event channels first.

### The tool does not parse my file

Confirm the export format is supported by the page. If the input is EVTX, XML, JSON, CSV, or text, verify that the tool supports that specific format and that the file is not corrupted.

### Detection output looks incorrect

Review the original event record, detection rule, event ID, provider/channel, and field mapping. Treat browser-generated findings as triage leads until validated.

### Sigma conversion output is incomplete

Complex Sigma rules may use conditions, modifiers, or field mappings that require manual review. Validate converted output before using it in detections.

## Intended Audience

- SOC analysts
- Incident responders
- Detection engineers
- System administrators performing Windows log review
- Security teams needing lightweight offline triage utilities

## License

Use according to the license and terms of the parent repository.

## Final Reminder

These tools can speed up Windows log triage, but they do not replace analyst judgment, forensic validation, or enterprise logging platforms. Always validate findings, preserve original evidence, and handle imported logs as potentially sensitive and potentially malicious input.
