# Packet Viewer v3.0 — Performance / Architecture

**Packet Viewer v3.0** is a browser-based, local-only packet-analysis prototype designed to move the project from a feature-heavy proof of concept toward a more scalable, extensible, Wireshark-like architecture. This release focuses on **performance**, **large-capture usability**, **lazy packet inspection**, **plugin-style dissector organization**, and a foundation for future detection and advanced TLS/HTTP analysis.

> **Important:** Packet Viewer is not a Wireshark replacement. v3.0 is an architectural milestone that establishes the performance model and extension points needed for deeper protocol work in later releases.

---

## 1. Release Summary

Version 3.0 introduces a major architectural shift:

- Parsing is moved into a **Web Worker** so the UI remains responsive.
- The packet table uses **virtual scrolling** instead of rendering every packet row at once.
- Packet details are generated through **lazy dissection** only when a packet is selected.
- A **plugin-style dissector registry** provides a foundation for modular protocol parsing.
- A **detection-rule engine foundation** enables future Sigma/SNORT-like or custom rule matching.
- TLS and HTTP analysis are carried forward with **JA3 MD5 generation**, lightweight certificate metadata extraction, HTTP transaction parsing, and HTTP/2 control-frame analysis.
- Advanced capabilities such as TLS decryption, full ASN.1 parsing, HPACK/QPACK decoding, and encrypted HTTP/2 inspection are represented as explicit **capability states** and UI surfaces, but are not fully implemented yet.

---

## 2. Major Changes from v2.9

### 2.1 Architecture Changes

v2.9 focused on TLS and HTTP feature depth. v3.0 shifts focus to the underlying architecture required to support larger captures and future dissector growth.

Major architectural changes include:

- Added `worker.js` for background parsing and analysis.
- Added a virtualized packet table to reduce DOM load.
- Added lazy packet detail generation.
- Added a plugin registry model.
- Added detection-rule scaffolding.
- Added explicit capability reporting for advanced features.

### 2.2 User Interface Changes

The interface is reorganized around architecture and workflow:

- **Packets** — virtualized packet list.
- **Lazy Details** — on-demand packet dissection and hex view.
- **Plugins** — registered dissector/plugin list and capability states.
- **Detection Rules** — rule-engine foundation and current detections.
- **TLS / JA3 / Certs** — TLS metadata, JA3 MD5, and certificate metadata.
- **HTTP / H2 / H3** — HTTP transactions and HTTP/2 control-frame data.
- **Validation** — built-in worker-side validation harness.

---

## 3. Feature Overview

## 3.1 Web Worker Parser

Parsing now occurs inside a Web Worker rather than the main browser UI thread.

### Benefits

- Keeps the interface responsive during parsing.
- Separates parsing logic from UI rendering.
- Provides a safer architecture for future large-file and malformed-input handling.
- Creates a foundation for cancelable parsing, progress events, and background analysis.

### Current Worker Responsibilities

The worker currently handles:

- Classic PCAP parsing.
- Packet summary generation.
- Lazy packet dissection requests.
- TLS / HTTP / HTTP2 summary analysis.
- JA3 MD5 generation.
- Lightweight X.509 metadata extraction.
- Detection-rule execution foundation.
- Built-in validation tests.

### Current Limitation

The v3.0 worker implementation focuses on classic PCAP handling. PCAPNG support is represented as a future hook and should be restored/expanded in later versions.

---

## 3.2 Virtualized Packet Table

The packet table is now virtualized. Instead of rendering all packet rows into the DOM, the UI renders only the visible slice of the table plus a small overscan buffer.

### Benefits

- Much better browser performance for larger captures.
- Reduced memory overhead from DOM elements.
- Faster scrolling compared with full-table rendering.
- Provides a foundation for indexed filtering and lazy sorting later.

### Current Behavior

The packet table displays:

- Packet number
- Relative time
- Source
- Destination
- Protocol
- Length
- Info

The visible row range is shown in the packet table header.

---

## 3.3 Lazy Dissection

v3.0 introduces lazy packet dissection.

Earlier versions built packet detail trees more eagerly. In v3.0, only packet summaries are generated during initial parse. The detailed packet tree and hex output are generated only when the user selects a packet.

### Benefits

- Faster initial parse-to-view time.
- Lower memory consumption.
- Better scalability for large captures.
- Cleaner future path for deeper dissectors.

### Current Lazy Detail Output

When a packet is selected, the UI requests detail data from the worker and displays:

- Frame metadata
- Ethernet metadata when available
- Plugin list applied to the packet
- Hex / ASCII view

### Future Direction

Later versions should expand lazy dissection to include the full protocol stack:

- IPv4 / IPv6
- TCP / UDP
- DNS
- DHCP
- TLS
- HTTP
- HTTP/2
- QUIC / HTTP/3
- Protocol-specific expert annotations

---

## 3.4 Large-File Handling Foundation

v3.0 introduces the beginning of a large-capture strategy.

### Implemented

- Worker-based parsing.
- Large-file warning guard.
- Summary-first packet model.
- Virtualized rendering.
- Lazy detail generation.

### Current Large-File Behavior

If the capture exceeds the configured large-file threshold, the worker emits a warning but continues parsing.

### Not Yet Implemented

- Streaming/chunked parsing.
- Cancel parse button.
- Indexed filtering.
- Lazy protocol tree cache eviction.
- Memory usage dashboard.
- Progressive packet loading.
- Capture-size hard stop controls.

---

## 3.5 Plugin-Style Dissector Registry

v3.0 introduces a plugin-style registry to organize dissectors and future protocol modules.

### Current Registered Plugins

The default registry includes:

- `frame`
- `ethernet`
- `ipv4`
- `tcp`
- `udp`
- `tls`
- `http1`
- `http2`
- `x509-lite`
- `hpack-foundation`
- `qpack-foundation`

### Purpose

The registry is intended to provide a future structure for:

- Ordered dissector execution.
- Protocol handoff logic.
- Plugin metadata.
- Capability reporting.
- Optional dissector loading.
- Third-party or custom dissector modules.

### Current Limitation

The registry is currently a foundation model. Dissector execution is still mostly hardcoded in the worker. Later versions should move protocol dispatch into the registry itself.

---

## 3.6 Detection-Rule Engine Foundation

v3.0 includes a starter detection-rule engine model.

### Rule Model

The current built-in rules use a lightweight structure containing:

- Rule ID
- Severity
- Match function
- Detail/evidence output

### Built-In Starter Rules

Current rules include:

- `TLS_JA3_PRESENT`
  - Detects when JA3 material and MD5 are available.

- `HTTP_500`
  - Detects HTTP 5xx responses.

- `H2_GOAWAY`
  - Detects HTTP/2 GOAWAY frames.

### Future Direction

The detection engine is intended to evolve toward support for:

- Stream-content matching.
- Packet-field matching.
- TLS-handshake matching.
- HTTP transaction matching.
- HTTP/2 frame correlation.
- Sigma-like field correlation.
- SNORT-like content rules.
- Evidence object generation.
- Rule import/export.

---

# 4. Protocol and Analysis Features

## 4.1 Capture Format Support

### Implemented in v3.0

- Classic PCAP parsing.
- Little/big endian PCAP handling.
- Ethernet link type support in the v3.0 worker path.

### Not Fully Implemented in v3.0

- PCAPNG parsing.
- Multiple interface metadata.
- Interface names.
- Packet comments.
- Name resolution blocks.
- Per-interface timestamp resolution.

> Note: Earlier prototypes had broader PCAPNG handling. v3.0 prioritizes the new architecture and should reintroduce hardened PCAPNG support in a later release.

---

## 4.2 Packet Summary Support

The worker generates packet summaries including:

- Packet number
- Timestamp
- Source
- Destination
- Protocol
- Length
- Info
- Ports
- Stream key
- Common field values

Supported summary-level protocol identification includes:

- Ethernet
- IPv4
- TCP
- UDP
- TLS
- HTTP
- HTTP/2 cleartext preface
- QUIC / HTTP3 candidate labeling for UDP/443

---

## 4.3 TLS Analysis

v3.0 keeps and restructures TLS analysis from v2.9.

### Implemented

- TLS ClientHello metadata extraction.
- SNI extraction.
- Cipher suite IDs.
- Cipher suite names for common suites.
- Extension IDs.
- Extension names for common TLS extensions.
- Supported groups where visible.
- EC point formats where visible.
- JA3-style string generation.
- Final JA3 MD5 hash generation.
- TLS certificate handshake detection.
- Lightweight certificate metadata extraction.

### JA3 Output

The tool generates JA3-style material in the form:

```text
TLSVersion,CipherSuites,Extensions,SupportedGroups,ECPointFormats
```

It also calculates the MD5 hash of that string.

Example conceptual output:

```text
JA3 string: 771,4865-49199-47,0-10-11-16,29-23,0
JA3 MD5:   <32-character-md5>
```

### TLS Decryption Status

v3.0 includes:

- SSLKEYLOGFILE upload UI.
- Worker plumbing for keylog text ingestion.
- Capability state reporting.

v3.0 does **not** include:

- TLS record decryption.
- Session lookup by client random.
- AEAD decryption.
- Reconstructed plaintext application streams.
- Encrypted HTTP/2 inspection.

The UI explicitly reports TLS decryption as:

```text
foundation-keylog-import-present-record-decryption-not-implemented
```

---

## 4.4 X.509 Certificate Metadata

v3.0 includes a lightweight X.509 metadata extractor.

### Implemented

- Certificate handshake detection.
- Certificate count.
- Certificate offset.
- Certificate length.
- Best-effort common name / CN extraction.
- Best-effort organization / O extraction.
- Certificate byte preview.

### Limitation

This is **not** a complete ASN.1 DER parser.

The capability state is reported as:

```text
best-effort-asn1-metadata-parser
```

### Future Work

A future complete implementation should include:

- ASN.1 TLV parsing.
- Subject parsing.
- Issuer parsing.
- Validity period.
- Subject Alternative Names.
- Public key algorithm.
- Signature algorithm.
- Serial number.
- Certificate chain ordering.
- Fingerprints such as SHA-1 and SHA-256.

---

## 4.5 HTTP Transaction Extraction

v3.0 extracts visible HTTP/1.x transactions from reassembled TCP payload bytes.

### Implemented Fields

- Stream key
- Transaction index
- Request line
- Method
- URI
- Host
- Response line
- Status code
- Content-Type
- Headers object

### Pairing Model

Requests and responses are paired by order within a TCP stream.

This is suitable for quick triage, but not yet a full HTTP state machine.

### Limitations

Not yet implemented:

- Chunked transfer decoding.
- Content-Encoding decompression.
- Multi-part body parsing.
- File/object extraction.
- HTTP authentication analysis.
- Full request/response timing analysis.

---

## 4.6 HTTP/2 Analysis

v3.0 retains HTTP/2 control-frame parsing and places capability information directly in the HTTP/H2/H3 view.

### Implemented for Visible HTTP/2

- Cleartext HTTP/2 preface detection.
- Frame parsing.
- SETTINGS decoding.
- PING opaque bytes.
- RST_STREAM error code and name.
- GOAWAY last stream ID and error code/name.

### HPACK Status

HPACK is represented as a capability scaffold:

```text
foundation-static-huffman-not-implemented
```

Not yet implemented:

- HPACK static table decoding.
- HPACK dynamic table handling.
- Huffman decoding.
- HEADERS block reconstruction.
- CONTINUATION association.

### Encrypted HTTP/2 Inspection Status

Encrypted HTTP/2 inspection depends on TLS decryption. Since TLS decryption is not implemented, encrypted HTTP/2 inspection is also not implemented.

The capability state is:

```text
requires-tls-decryption-not-implemented
```

---

## 4.7 QPACK / HTTP/3 Analysis

v3.0 includes only QPACK architectural scaffolding.

### Current Status

QPACK capability state:

```text
foundation-not-implemented
```

### Not Implemented

- QUIC stream reassembly.
- HTTP/3 frame decoding.
- QPACK encoder stream handling.
- QPACK decoder stream handling.
- Dynamic table tracking.
- Header block decoding.

---

# 5. User Interface Guide

## 5.1 Loading a Capture

1. Open `index.html` in a browser.
2. Click **Capture**.
3. Select a classic `.pcap` file.
4. The file is sent to the Web Worker for parsing.
5. Packet summaries appear in the virtualized packet table.

### Notes

- v3.0 is optimized around classic PCAP in the worker path.
- If a file is large, a warning may appear, but parsing can continue.
- Parsing happens locally in the browser. No capture is uploaded to a server.

---

## 5.2 Loading an SSLKEYLOGFILE

1. Click **SSLKEYLOGFILE**.
2. Select a key log text file.
3. The worker records the key log entry count.
4. The UI displays the current TLS decryption capability state.

### Important

SSLKEYLOGFILE import exists as plumbing only. v3.0 does not decrypt TLS records yet.

---

## 5.3 Using the Virtualized Packet Table

The **Packets** tab displays packet summaries.

Only visible rows are rendered. The table header shows the currently visible row range.

Example:

```text
rows 1-40 / 250000
```

### Selecting a Packet

Click any packet row. The UI will:

1. Switch to **Lazy Details**.
2. Ask the worker for detailed dissection.
3. Display packet layers and hex output.

---

## 5.4 Lazy Details Tab

The **Lazy Details** tab displays on-demand dissection.

Current content includes:

- Frame layer.
- Ethernet layer when available.
- Plugin list applied to the packet.
- Hex / ASCII output.

Later releases should expand lazy details with deeper protocol-specific fields.

---

## 5.5 Plugins Tab

The **Plugins** tab displays:

- Registered dissector plugins.
- Plugin order.
- Capability states.

Use this tab to confirm which dissector modules and architecture hooks are currently available.

---

## 5.6 Detection Rules Tab

The **Detection Rules** tab shows results from the starter detection-rule engine.

Current built-in detections include:

- TLS JA3 material present.
- HTTP 5xx response observed.
- HTTP/2 GOAWAY observed.

The rule engine is intentionally simple in v3.0 and should be expanded in future releases.

---

## 5.7 TLS / JA3 / Certs Tab

This tab displays TLS-related analysis.

You may see:

- TLS decryption capability state.
- JA3 string.
- JA3 MD5 hash.
- Cipher names.
- Extension names.
- Certificate metadata.

If no TLS ClientHello or certificate handshake data is visible, this tab may be empty.

---

## 5.8 HTTP / H2 / H3 Tab

This tab displays:

- HTTP/1.x transactions.
- HTTP/2 details.
- HPACK capability state.
- QPACK capability state.
- Encrypted HTTP/2 inspection capability state.

### HTTP/1.x

For visible HTTP streams, the tool extracts:

- Method
- URI
- Host
- Status
- Content-Type
- Request line
- Response line

### HTTP/2

For visible HTTP/2 streams, the tool extracts:

- SETTINGS
- PING
- RST_STREAM
- GOAWAY

---

## 5.9 Validation Tab

Click **Run Validation** to run worker-side validation tests.

The validation harness checks:

- Worker parser summaries.
- Lazy dissection.
- Plugin registry.
- JA3 MD5 generation.
- X.509 metadata extraction.
- HTTP transaction extraction.
- HTTP/2 control-frame parsing.
- Detection foundation.

---

# 6. Exporting Data

Click **Export JSON** to export the current summary and analysis model.

The export includes:

- Schema identifier.
- Packet summaries.
- Analysis output.
- TLS metadata.
- JA3 MD5 data.
- HTTP transactions.
- HTTP/2 frame summaries.
- Detection results.

Export filename:

```text
packet-viewer-v3.0-analysis.json
```

---

# 7. Known Limitations

## 7.1 Protocol Coverage

v3.0 narrows the active worker path to the architectural foundation. Some protocol depth from v2.8/v2.9 should be reintroduced into the plugin registry in future releases.

Known limitations:

- PCAPNG support is not fully active in the v3.0 worker.
- IPv6 depth is not fully active in the compact v3.0 worker.
- DNS and DHCP deep parsing from v2.8 are not the focus of this architecture build.
- TCP expert analysis from v2.8 is not fully carried into the compact worker path.

## 7.2 TLS Decryption

Not implemented beyond keylog import plumbing.

Missing:

- Client random/session key mapping.
- TLS 1.2 record decryption.
- TLS 1.3 record decryption.
- AEAD nonce construction.
- Decrypted application data stream reconstruction.

## 7.3 Full X.509 ASN.1 Parsing

Not implemented.

Current support is best-effort text/metadata extraction from certificate bytes.

## 7.4 HPACK / QPACK

Not implemented.

Current support is capability scaffolding only.

## 7.5 Encrypted HTTP/2 Inspection

Not implemented.

Requires TLS decryption first.

## 7.6 Detection Engine

The detection engine is a foundation only.

Missing:

- Rule import.
- Rule editor.
- Field typing.
- Regex matching.
- Stream content matching.
- MITRE / D3FEND tagging.
- Rule severity configuration.
- Evidence object export.

---

# 8. Recommended Next Steps

## v3.1 — Worker Protocol Restoration

Recommended next work:

- Restore v2.8 protocol depth inside the worker/plugin architecture.
- Add PCAPNG support back into the worker.
- Implement IPv6 and UDP conversation depth in the worker model.
- Move hardcoded dissectors into actual plugin dispatch functions.

## v3.2 — TLS Decryption Foundation

Recommended next work:

- Parse SSLKEYLOGFILE entries into structured key material.
- Add TLS session indexing by client random.
- Implement TLS 1.2 AES-GCM decryption.
- Implement TLS 1.3 record traffic secret handling.
- Emit decrypted application-data streams.

## v3.3 — HTTP/2 Header Decoding

Recommended next work:

- Implement HPACK static table decoding.
- Add HPACK integer/string decoding.
- Add Huffman decoding.
- Add dynamic table handling.
- Reconstruct HTTP/2 request/response headers.

## v3.4 — Detection Rules

Recommended next work:

- Add JSON rule import/export.
- Add field matching.
- Add stream content matching.
- Add evidence output.
- Add ATT&CK / D3FEND tag support.
- Add rule testing against sample captures.

---

# 9. Troubleshooting

## The capture does not load

Check:

- Is it classic PCAP rather than PCAPNG?
- Is it Ethernet link type?
- Is the file very large?
- Does the warning panel show a parser error?

## The table is empty

Try:

- Clearing the filter.
- Loading the built-in sample through validation.
- Checking the warning panel.

## TLS data is missing

Possible reasons:

- No TLS ClientHello is present.
- The capture starts mid-session.
- TLS handshake packets are missing.
- The relevant traffic is encrypted and not yet decrypted.

## HTTP/2 details are missing

Possible reasons:

- HTTP/2 is encrypted inside TLS.
- The capture contains HTTP/2 headers but HPACK decoding is not implemented.
- The capture does not include visible h2c traffic.

## SSLKEYLOGFILE does not decrypt traffic

Expected behavior in v3.0. Keylog import is present, but record decryption is not implemented yet.

---

# 10. Development Notes

v3.0 intentionally separates concerns:

- `index.html` — UI structure.
- `styles.css` — UI styling and table virtualization presentation.
- `app.js` — main-thread UI controller.
- `worker.js` — parsing, summary generation, lazy dissection, analysis, validation.

The worker boundary is the key architectural change. Future dissector work should happen primarily in the worker and expose compact, typed result objects to the UI.

---

# 11. Summary

Packet Viewer v3.0 is the architecture milestone for the project.

It introduces:

- Worker-based parsing.
- Virtualized packet rendering.
- Lazy dissection.
- Large-file handling foundations.
- Plugin registry foundations.
- Detection-rule foundations.
- JA3 MD5 generation.
- Best-effort X.509 metadata.
- HTTP transaction extraction.
- HTTP/2 control-frame parsing.
- Explicit capability states for unfinished advanced features.

The main value of v3.0 is not that every protocol is deeper than v2.8 or v2.9; it is that the project now has a better architecture for becoming deeper, faster, and more maintainable in future releases.
