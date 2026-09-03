# File IOC Analyzer & Hasher

An interactive, browser-based file analysis and indicator of compromise (IoC) extraction utility designed to help security analysts, incident responders, and malware triagers calculate cryptographic hashes, inspect file metadata, and extract observable indicators directly in the browser.

Part of the **[security_timesavers](https://github.com/asmodianx/security_timesavers)** utility toolkit.

---

## 📌 Overview

During active investigations, security analysts regularly handle suspicious binaries, scripts, email attachments, and downloaded payloads. Generating cryptographic checksums (MD5, SHA-1, SHA-256) and inspecting raw file artifacts often requires switching to a command-line terminal or uploading samples to third-party public scanners—risking accidental data leakage or alerting threat actors.

**File IOC Analyzer & Hasher** (`index.html`) provides a secure, client-side triage bench. Using modern browser-native cryptography APIs (Web Crypto API) and local file readers, analysts can drop suspicious files directly into the viewport to instantly compute cryptographic hashes, inspect basic file structure, extract printable strings, and prepare defanged indicators without files ever leaving the local host.

---

## 🔍 Client-Side Triage Pipeline

```text
  [ Suspicious File Drag & Drop / File Selector ]
                        │
                        ▼
  [ Local Browser FileReader (Zero Network Upload) ]
                        │
                        ▼
  [ Web Crypto API Hash Calculation ]
  (MD5, SHA-1, SHA-256 Checksums)
                        │
                        ▼
  [ Structure & Metadata Extraction ]
  (File Size, MIME Type, Header Magic Bytes)
                        │
                        ▼
  [ Printable String Carving & Artifact Extraction ]
  (Embedded URLs, IP Addresses, Suspicious Filenames)
                        │
                        ▼
  [ Defanged IoC Output & Threat Intel Ready Strings ]
