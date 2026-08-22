# Detection Rule Workbench

A standalone, browser-based editor and testing workbench for **YARA**, **YARA-L 2.0**, and **Sigma** detection rules.

The application is written in plain HTML, CSS, and JavaScript. It does not require installation, a web server, a build process, external libraries, or CDN access. It can be opened locally or hosted as a static webpage in most modern browsers.

## Features

### Rule editing and management

- Create YARA, YARA-L 2.0, and Sigma rules.
- Maintain multiple rules in a rule group.
- Duplicate and delete individual rules.
- Automatically identify rule names from YARA declarations or Sigma titles.
- Format line endings, trailing whitespace, and excess blank lines.
- Import individual rules or previously exported rule groups.
- Export individual rules in their native format:
  - YARA: `.yar`
  - YARA-L: `.yaral`
  - Sigma: `.yml`
- Export mixed rule groups as a portable JSON file.

### Validation and suggestions

The built-in validator provides advisory checks for common structural problems.

#### YARA

- Missing or invalid rule declaration
- Missing `condition` section
- Unbalanced braces
- Excessive editor content size

#### YARA-L 2.0

- Missing rule declaration
- Missing required `meta`, `events`, or `condition` sections
- Incorrect section ordering
- Unbalanced braces
- Missing or unrecognized match windows
- Complete example structure using:
  - `meta`
  - `events`
  - `match`
  - `outcome`
  - `condition`
  - `options`

#### Sigma

- Missing `title`, `logsource`, or `detection` fields
- Missing detection condition
- Tab-based YAML indentation
- Unsupported or unrecognized severity level
- Missing false-positive documentation

> **Important:** Browser validation is advisory. Validate production rules with an authoritative YARA compiler, Google Security Operations, or appropriate Sigma tooling before deployment.

### Local sample testing

The workbench can compare a selected rule against sample data without sending content to a server.

- **YARA:** common quoted text strings and the `nocase` modifier
- **YARA-L:** simple equality and inequality comparisons against JSON event data
- **Sigma:** simple scalar field comparisons using:
  - Exact matching
  - `contains`
  - `startswith`
  - `endswith`

The local tester is intentionally limited and does not replace a complete detection engine. Advanced YARA conditions, binary scanning, YARA-L correlation and outcomes, full YAML interpretation, Sigma condition trees, and backend-specific field mappings require authoritative tooling.

### Built-in reference

The searchable reference includes common syntax and structural guidance for:

- YARA rule sections, strings, regular expressions, sets, occurrences, and modules
- YARA-L sections, variables, match windows, outcomes, options, and common functions
- Sigma metadata, log sources, selections, modifiers, conditions, and interoperability conventions

## Requirements

- A modern web browser with JavaScript enabled
- No internet connection required
- No external libraries, package manager, or development environment required

## Running locally

1. Save the application as an HTML file, such as:

   ```text
   YARA_SIGMA_EDIT.html
   ```

2. Open the file directly in a supported browser.

3. Create a new rule or import an existing `.yar`, `.yara`, `.yaral`, `.yml`, `.yaml`, `.txt`, or supported group `.json` file.

No local web server is required.

## Hosting as a static website

The application can be placed on a standard static web server. No server-side code is required.

When hosting the application, configure the web server to send an appropriate Content Security Policy header. The HTML includes a restrictive CSP meta tag, but an HTTP response header is preferred when the application is delivered from a web server.

## Import formats

The importer accepts:

- `.yar`
- `.yara`
- `.yaral`
- `.yml`
- `.yaml`
- `.txt`
- `.json`

Language detection uses file extensions and basic content inspection. Review the selected language after importing files with ambiguous extensions such as `.txt`.

### Rule group format

Exported groups use a JSON structure similar to:

```json
{
  "format": "detection-rule-workbench-group",
  "version": 3,
  "rules": [
    {
      "language": "yara",
      "name": "Example_Text_Match",
      "source": "rule Example_Text_Match { ... }"
    }
  ]
}
```

A group can contain any supported combination of YARA, YARA-L, and Sigma rules.

## Security design

The application is designed for offline and static-hosting use with security-focused defaults:

- No CDN or third-party JavaScript dependencies
- No network requests
- No use of `eval()` or dynamic execution of imported rule content
- Imported content is treated as data, not executable JavaScript
- User-controlled values are rendered through safe DOM text properties
- Restrictive Content Security Policy
- File-size and rule-count limits
- Temporary object URLs are revoked after downloads
- No automatic persistence to browser storage
- No server-side transfer or storage of rules or sample data

## Data handling

Rules and sample data remain in browser memory for the current session. The application does not automatically save progress. Closing or refreshing the page can discard unsaved changes.

Use **Export rule** or **Export group** to preserve work before closing the application.

Do not assume that a locally opened browser page provides suitable protection for highly sensitive malware samples, credentials, regulated data, or restricted institutional information. Follow applicable organizational handling requirements and use an appropriately isolated analysis environment when necessary.

## Known limitations

- The application does not embed a native YARA compiler or WebAssembly YARA engine.
- YARA binary, hexadecimal, regex, module, and complex-condition execution is not fully implemented by the sample tester.
- YARA-L testing does not reproduce Google SecOps UDM validation, correlation, aggregation, outcome processing, or detection execution.
- Sigma testing does not implement a full YAML parser, all modifiers, condition trees, correlations, field mappings, or backend conversion.
- Validation does not guarantee that a rule will compile or execute in its target platform.
- Imported files are limited to approximately 2 MB each.
- A rule group is limited to 200 rules.

## Recommended production workflow

1. Draft or import the rule in the workbench.
2. Review structural validation and suggestions.
3. Test against representative, non-sensitive sample data where appropriate.
4. Export the rule.
5. Compile or validate it with the authoritative platform.
6. Test it in a controlled detection-engine environment.
7. Document expected matches, false positives, performance considerations, and deployment scope.
8. Use normal change-control and peer-review processes before production deployment.

## Project structure

The application is distributed as a single standalone HTML file:

```text
YARA_SIGMA_EDIT.html
README.md
```

All application HTML, CSS, JavaScript, templates, validators, references, and local testing logic are contained in the HTML file.

## Disclaimer

This application is a rule-authoring aid and does not guarantee the correctness, safety, efficiency, or detection quality of generated or edited rules. Rules and test results must be independently reviewed and validated before operational use. AI-assisted content may contain errors or omissions.

## License

No license has been assigned to this project. Add an approved license file and update this section before public distribution or reuse outside the intended environment.
