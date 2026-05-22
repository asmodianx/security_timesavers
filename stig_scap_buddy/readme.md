Here is a clean, professional **README.md** tailored to your tool and your typical KU/SOC use case:

***

# STIG / SCAP Editor & Implementation Script Builder

**Standalone Browser-Based Security Compliance Utility**

***

## Overview

This tool is a **fully standalone HTML/JavaScript application** designed to load, view, edit, and generate implementation scripts from **STIG, SCAP, XCCDF, OVAL, and CKL files**.

It runs entirely in the browser and requires:

* ✅ No server
* ✅ No internet access
* ✅ No external libraries (no CDN)
* ✅ Works from `file://` or `https://`

The tool also includes a **script generation workflow**, allowing users to select configuration findings and build implementation scripts using a running command notepad.

***

## Key Features

### File Handling

* Load:
  * STIG XML
  * SCAP / XCCDF benchmarks
  * OVAL definitions
  * DISA CKLs
  * JSON exports
* Create:
  * New XCCDF template
  * New CKL-style checklist
* Save:
  * Edited XML
  * Findings as JSON
  * Generated scripts (.sh, .ps1, .txt)

***

### Findings Management

* Browse findings with:
  * Search
  * Severity filter (high/medium/low)
  * Status filter (Open, NotAFinding, etc.)
  * Sorting (ID, severity, title)
* Multi-select findings (Ctrl/Command click)
* Bulk selection of filtered results

***

### Editing Capabilities

Edit key fields for each finding:

* ID / Rule ID
* Severity
* Title
* Description
* Check content
* Fix text
* Status (CKL-style)
* Platform/target
* Custom **implementation command template**

Includes:

* Form-based editor
* Raw XML editor (advanced use)

***

### Implementation Script Builder

#### Running Notepad

* Append commands from:
  * Selected findings
  * Current finding
* Manual editing supported

#### Script Generation

Build scripts in:

* Bash
* PowerShell
* Plain text

Includes:

* Script header customization
* Export + copy functionality

***

### Security Hardening (OWASP-Aligned)

This tool includes multiple security controls:

#### Input & Output Safety

* No use of `innerHTML` (prevents DOM XSS)
* All content rendered using `textContent`
* Control character stripping
* Input size limits

#### XML Security

* Blocks:
  * `<!DOCTYPE>`
  * `<!ENTITY>`
* Mitigates XXE and entity expansion attacks

#### File Handling

* Filename sanitization
* 25 MB size limit to prevent local DoS

#### Content Security Policy (CSP)

* Blocks:
  * External requests
  * Object embedding
  * Form submission
* Allows only inline script/styles (required for standalone operation)

#### Script Safety

* Flags dangerous patterns in generated scripts:
  * `rm -rf`
  * `mkfs`
  * `dd if=`
  * `shutdown`, `reboot`

***

## Usage Instructions

### 1. Launch the Tool

* Open the `.html` file in any modern browser:
  * Chrome / Edge / Firefox recommended
* No installation required

***

### 2. Load a File

1. Click **"Open XML / XCCDF / SCAP / CKL"**
2. Select your local file
3. Findings will populate in the left panel

***

### 3. Browse & Select Findings

* Use:
  * Search box
  * Filters (severity/status)
* Click to select a finding
* Use **Ctrl/Command + Click** for multi-select
* Use **"Select visible"** to bulk select filtered results

***

### 4. Edit Findings

1. Select a finding
2. Modify fields in the editor
3. Click **"Apply Edit"**

Optional:

* Add new findings manually
* Edit raw XML for advanced scenarios

***

### 5. Build Implementation Commands

#### Option A – From Findings

* Ensure findings have command templates
* Click:
  * **"Append Selected Commands"**
  * or **"Append Current Command"**

#### Option B – Manual Entry

* Directly type commands into the notepad

***

### 6. Generate Script

1. Choose script type:
   * Bash
   * PowerShell
   * Plain
2. Click **"Generate Script"**
3. Review output carefully

***

### 7. Save Outputs

* Save edited STIG/SCAP XML
* Export findings JSON
* Save generated script file

***

## Important Notes

### ⚠️ Script Safety

This tool:

* **Does NOT execute commands**
* Only generates output scripts

You must:

* Review all commands
* Test in non-production environments
* Follow change control procedures

***

### ⚠️ Schema Limitations

* Designed for **common STIG/SCAP structures**
* May not fully preserve:
  * Complex namespaces
  * Full SCAP datastream relationships
  * Profile logic

***

### ⚠️ New Findings

* Newly added findings without XML nodes:
  * Will appear in JSON export
  * May require manual XML integration for full compliance workflows

***

## Recommended Use Cases

* STIG remediation planning
* Compliance gap analysis
* Script generation for:
  * Linux hardening
  * Windows baseline enforcement
* SOC / IR standardization workflows
* Audit preparation (HECVAT, NIST, DISA alignment)

***

## Future Enhancements (Suggested)

* Full SCAP datastream support
* Profile selection (XCCDF)
* CCI / NIST 800-53 mapping view
* CKL round-trip fidelity improvements
* OS-specific command template libraries
* Export to Ansible / DSC / Chef formats

***

## License / Usage

Intended for internal operational and compliance use.  
No external dependencies or licensing requirements.


