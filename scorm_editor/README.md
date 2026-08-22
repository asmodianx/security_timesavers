# SCORM Course Creator and Editor

A standalone, browser-based application for creating, editing, importing, validating, previewing, and exporting basic SCORM course packages.

The application runs entirely from a local HTML file and does not require installation, a web server, an internet connection, external JavaScript libraries, or CDN resources.

## Features

- Create basic SCORM courses locally
- Edit course metadata and course content
- Import existing SCORM ZIP packages
- Export LMS-ready SCORM ZIP packages
- Save an editable project as a local JSON file
- Reopen a previously saved project
- Preview course content before export
- Validate common course requirements
- Reorder and delete course items
- Attach local image and video files

## Supported SCORM Versions

- SCORM 1.2
- SCORM 2004 4th Edition

The exported package contains an `imsmanifest.xml` file, course player, course data, and referenced media assets.

## Supported Content Types

### Text / HTML

Creates formatted instructional content. The editor permits a limited set of safe formatting elements, including:

- Paragraphs
- Headings
- Ordered and unordered lists
- Bold and emphasized text
- Block quotes
- Preformatted text and code
- HTTP and HTTPS links

### Image

Adds a locally selected image to a course item and supports an accessible description.

### Video

Adds a locally selected video with standard browser playback controls and an optional caption or description.

### Knowledge Check

Creates a basic multiple-choice question with:

- Question text
- Multiple answer choices
- Correct-answer selection
- Learner feedback

Knowledge checks are intended for basic learner interaction and do not currently report detailed interaction data to the LMS.

## Getting Started

1. Download `SCORM_Course_Creator_fixed.html`.
2. Open the file in a current version of Microsoft Edge, Google Chrome, or Mozilla Firefox.
3. Enter a course title and identifier.
4. Select the required SCORM version.
5. Create and arrange course items.
6. Select **Validate** and correct any reported issues.
7. Select **Export SCORM ZIP**.
8. Upload the resulting ZIP file to the target LMS as a SCORM package.

No files are automatically uploaded or transmitted by the application.

## Course Identifier Rules

The course identifier may contain only:

- Letters
- Numbers
- Periods
- Underscores
- Hyphens

Example:

```text
security-awareness-2026
```

## Importing a SCORM Package

1. Select **Import SCORM ZIP**.
2. Choose a local `.zip` SCORM package.
3. Review the imported course outline and content.
4. Validate the course before exporting it again.

Packages originally created by this application can be reconstructed from their included `course.json` file.

For third-party packages, the application performs a best-effort import of the manifest and simple HTML launch resources. Complex sequencing, multiple SCO structures, custom JavaScript, LMS-specific extensions, and advanced interactions may not be preserved.

Imported scripts, forms, frames, objects, embedded resources, and other active content are not executed in the editor.

## Saving an Editable Project

Select **Save project** to export the current editor state as a `.scorm-project.json` file. This project file may contain embedded media data and can therefore be significantly larger than the final SCORM ZIP package.

To continue editing later:

1. Open the application.
2. Select **Open project**.
3. Choose the previously saved `.scorm-project.json` file.

Project files are specific to this editor and should not be uploaded to an LMS as SCORM packages.

## Exported Package Structure

A typical exported package contains:

```text
imsmanifest.xml
index.html
course.json
assets/
  image-or-video-files
```

The exported course uses one SCO with multiple internal course pages.

## LMS Communication

The generated player attempts to locate and initialize the LMS SCORM API.

At course completion, it reports:

- `cmi.core.lesson_status = completed` for SCORM 1.2
- `cmi.completion_status = completed` for SCORM 2004

The current implementation does not provide advanced score reporting, suspend-data restoration, interaction reporting, sequencing, objectives, or multi-SCO navigation.

## Validation

The built-in validator checks for common authoring issues, including:

- Missing course title
- Invalid course identifier
- Missing course items
- Missing item titles
- Missing image or video assets
- Missing image descriptions
- Knowledge checks with insufficient choices
- Knowledge checks with an invalid correct-answer number

Passing the built-in validation does not guarantee compatibility with every LMS. Test exported packages in a non-production LMS environment before deployment.

## Security Design

The application is designed to follow secure browser-development practices appropriate for a standalone local tool.

Implemented controls include:

- No external libraries or CDN dependencies
- No network requests from the editor
- Restrictive Content Security Policy
- Local-only file processing
- Allow-list sanitization for text/HTML content
- No execution of scripts imported from course content
- ZIP path traversal checks
- ZIP entry count and expanded-size limits
- Individual media asset size limits
- Safe DOM APIs for user-provided text
- `noopener` and `noreferrer` protections for generated external links
- Validation and normalization of filenames and course identifiers

## File and Package Limits

The application enforces the following safety limits:

- Maximum imported ZIP size: 100 MB
- Maximum project file size: 100 MB
- Maximum expanded ZIP content: 200 MB
- Maximum ZIP entries: 2,000
- Maximum individual media asset: 50 MB
- Maximum imported or project course items: 500

These limits reduce the risk of excessive local resource consumption. They are not LMS upload limits; the target LMS may impose stricter requirements.

## Browser Compatibility

Use a current desktop browser with support for:

- File API
- Blob URLs
- `TextEncoder` and `TextDecoder`
- `DOMParser`
- `crypto.randomUUID`, or equivalent browser functionality
- `DecompressionStream` for importing deflate-compressed ZIP packages

The application can create ZIP files without a compression library. ZIP import supports stored entries and deflate-compressed entries when the browser provides `DecompressionStream` support.

## Accessibility

The editor includes labeled controls, keyboard-focus indicators, status announcements, and image-description fields. Course authors are responsible for ensuring that content, media, captions, link text, color usage, and knowledge checks meet applicable accessibility requirements.

## Known Limitations

- One SCO per exported course
- No advanced SCORM sequencing or navigation rules
- No detailed quiz score or interaction reporting
- No resume or suspend-data support
- No multi-language authoring workflow
- No drag-and-drop item sorting
- No rich-text toolbar
- Third-party SCORM import is best effort
- Relative images and styles embedded in imported third-party HTML are not fully reconstructed
- Some ZIP compression methods are unsupported
- Large media files may consume substantial browser memory
- Browser playback depends on locally supported media codecs

## Data Handling

Course data, imported packages, and media assets remain in browser memory while the application is open. The application does not automatically save progress.

Use **Save project** regularly to preserve work. Closing or refreshing the browser tab before saving may result in data loss.

Project files may contain embedded course content and media. Store them according to applicable institutional data-classification, retention, and access-control requirements. Do not include restricted or sensitive information unless the storage location and target LMS are approved for that data.

## Recommended Testing

Before publishing a course:

1. Run the built-in validation.
2. Import the exported ZIP into a test LMS course.
3. Verify launch behavior.
4. Test previous and next navigation.
5. Verify completion reporting.
6. Test images, videos, and knowledge checks.
7. Test with keyboard-only navigation.
8. Test using the browsers supported by the organization.
9. Confirm that the LMS accepts the selected SCORM version.
10. Retain the editable project file separately from the LMS package.

## Troubleshooting

### The SCORM ZIP will not import

- Confirm that the package contains `imsmanifest.xml`.
- Confirm that the selected file is a ZIP package.
- Check whether the ZIP exceeds the application's limits.
- Try a current version of Edge, Chrome, or Firefox.
- The package may use an unsupported compression method or a complex structure that cannot be converted automatically.

### An exported course will not launch in the LMS

- Confirm that `imsmanifest.xml` is at the root of the ZIP file.
- Confirm that the LMS supports the selected SCORM version.
- Review the LMS import or launch logs.
- Reopen the editor, run validation, and export a new package.

### Video does not play

The browser and LMS environment must support the video's container and codec. MP4 video using broadly supported codecs is generally the safest option, but compatibility should be tested in the target environment.

### Changes were lost

The application does not automatically save. Use **Save project** before closing or refreshing the browser.

## Deployment

No installation is required. Distribute the single HTML application file to authorized course authors. The file can be opened from a local workstation or approved internal file location.

Because browser behavior for local `file://` resources can vary, test the application using the organization's supported browser configuration.

## License

No license has been assigned to this application. Add an organizational or open-source license before redistributing it outside the intended environment.

## Disclaimer

This application is an authoring utility, not a full SCORM conformance-testing suite. Course authors and administrators are responsible for validating exported packages against the requirements of the target LMS, organizational security standards, accessibility requirements, records-retention rules, and applicable policy.
