# FrameScope Standalone Iframe Sandbox Viewer

FrameScope is a standalone, no-CDN HTML/JavaScript utility for safely viewing a target website inside a controlled `<iframe>` and experimenting with iframe boundary protections. It is intended for security analysts, SOC staff, web application reviewers, and developers who need to understand how iframe sandboxing, feature permissions, credentialless loading, referrer policy, and iframe CSP settings affect embedded web content.

> **Important scope note:** FrameScope configures and displays browser-enforced iframe boundary controls. It does **not** put the iframe into true browser Incognito/Private Browsing mode, and it does **not** reveal what an arbitrary remote cross-origin website internally attempts to access, such as camera, geolocation, clipboard, Bluetooth, USB, or other browser APIs.

---

## What FrameScope Does

FrameScope lets you load a target HTTP/HTTPS URL into an iframe while controlling:

- iframe `sandbox` tokens
- iframe `allow` / Permissions Policy directives
- `credentialless` iframe loading where supported
- `referrerpolicy`
- optional strict iframe CSP / no-script mode
- feature permission denial or limited target-source allowance
- suspicious-link and maximum-isolation presets
- generated iframe tag output for repeatability
- browser-observable load behavior and warnings

FrameScope is designed to be a local, inspectable, single-file HTML tool with no external libraries, no NPM dependencies, and no CDN requirements.

---

## What FrameScope Does Not Do

FrameScope is **not** a malware detonation sandbox, remote browser isolation platform, proxy, browser extension, or full phishing analysis environment.

It cannot:

- force a target website to render if the site blocks framing with `X-Frame-Options` or CSP `frame-ancestors`
- inspect the DOM, JavaScript execution, cookies, storage, or network activity of arbitrary cross-origin iframe content
- detect internal API attempts made by an arbitrary remote page
- put an individual iframe into true Incognito/Private Browsing mode
- bypass same-origin policy, browser security controls, or target-site headers
- guarantee `credentialless` behavior across every browser

For full behavioral analysis, use a dedicated browser sandbox, separate browser profile, VM, remote browser isolation environment, browser extension, CDP automation, HAR capture, or proxy-based workflow.

---

## Security Model

FrameScope focuses on **iframe boundary control**. The parent page configures restrictions and the browser enforces them.

The tool intentionally separates two concepts:

### 1. Sandbox Controls

These generate the iframe `sandbox` attribute. Examples include:

- `allow-scripts`
- `allow-forms`
- `allow-popups`
- `allow-downloads`
- `allow-modals`
- `allow-pointer-lock`
- `allow-presentation`
- `allow-same-origin`
- `allow-top-navigation-by-user-activation`
- `allow-popups-to-escape-sandbox`

The suspicious-link preset intentionally does **not** include `allow-same-origin`.

### 2. Feature Permissions / iframe Allow Policy

These generate the iframe `allow` attribute. Examples include:

- `camera`
- `microphone`
- `geolocation`
- `clipboard-read`
- `clipboard-write`
- `fullscreen`
- `payment`
- `usb`
- `bluetooth`
- `midi`
- `display-capture`
- `accelerometer`
- `gyroscope`
- `magnetometer`
- `autoplay`

Unchecked features are generated as:

```html
feature 'none'
```

Checked features are generated as:

```html
feature 'src'
```

This means enabled features are allowed only for the iframe target source at the iframe boundary. Target-site headers, browser prompts, browser support, and user decisions may still block them.

---

## Presets

### Suspicious-Link Preset

The **Suspicious-link preset** is the default startup posture. It applies a practical balance between isolation and site compatibility.

It sets:

- sandbox: `allow-scripts allow-forms`
- credentialless: enabled
- referrer policy: `no-referrer`
- feature permissions: deny all
- `allow-same-origin`: disabled
- strict iframe CSP: disabled by default

Use this preset when you want the site to have a reasonable chance of rendering while still denying sensitive features and reducing cookie/storage/referrer exposure where supported.

### Maximum Isolation Preset

The **Maximum isolation** preset applies the strictest browser-only posture available in the tool.

It sets:

- sandbox: empty sandbox attribute
- credentialless: enabled
- strict iframe CSP / no-script mode: enabled
- referrer policy: `no-referrer`
- feature permissions: deny all
- `allow-same-origin`: disabled

Use this preset when you want to test whether a page can render under maximum iframe restrictions. Many modern websites will break under this preset.

### Interactive Preset

The **Interactive preset** enables:

- `allow-scripts`
- `allow-forms`
- `allow-popups`

Use this for sites that need basic JavaScript, form behavior, or popup behavior. This is less restrictive than the suspicious-link preset.

### Strict Preset

The **Strict preset** clears all sandbox tokens, applying maximum default sandbox restrictions.

---

## How to Use

1. Open the HTML file in a browser.
2. Enter a target URL in the **Target URL** field.
   - You may enter `example.com`; FrameScope will normalize it to `https://example.com`.
   - Only `http:` and `https:` targets are allowed.
3. Choose a preset:
   - **Suspicious-link preset** for general suspicious URL review.
   - **Maximum isolation** for the strictest browser-only posture.
   - **Interactive preset** for sites that need scripts/forms/popups.
   - **Strict preset** for maximum sandbox restriction.
4. Adjust sandbox controls if needed.
5. Adjust feature permissions if needed.
6. Review the **Generated iframe** output if you want to copy the exact iframe configuration.
7. Click **Load iframe**.
8. Review the **Log**, **Overview**, and **Boundary** tabs.

---

## URL Handling and Safety Warnings

FrameScope only allows `http:` and `https:` URLs. Other schemes are rejected.

The tool warns when a target appears to be local, private, loopback, link-local, or internal-looking, including examples such as:

- `localhost`
- `127.0.0.1`
- `10.x.x.x`
- `172.16.x.x` through `172.31.x.x`
- `192.168.x.x`
- `169.254.x.x`
- `.local` hostnames
- single-label hostnames

This warning exists because loading those URLs may cause the analyst browser to make requests from the local workstation or internal network context.

---

## Credentialless / Incognito-Like Behavior

FrameScope includes a **Credentialless / ephemeral iframe context** option.

When supported by the browser, `credentialless` can load iframe content in an ephemeral context without the target origin's usual cookies and storage. This is **incognito-like**, but it is **not** true Incognito or Private Browsing mode.

Use a real private browser window, separate browser profile, VM, remote browser sandbox, or managed browser automation environment when true profile-level isolation is required.

---

## Strict Iframe CSP / No-Script Mode

The **Strict iframe CSP / no-script mode** option applies the configured iframe `csp` attribute to the embedded target.

Default value:

```text
default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https:; script-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'
```

This mode can break modern websites. It is useful when testing whether a page can render without scripts and network connections from inside the frame.

---

## Generated Iframe Output

The **Generated iframe** section shows the current iframe tag that FrameScope would create based on your selected controls.

Use **Copy iframe tag** to copy the current iframe configuration for documentation, testing, or reproduction.

Example:

```html
<iframe src="https://example.com" title="Sandboxed analysis target" sandbox="allow-scripts allow-forms" referrerpolicy="no-referrer" allow="camera 'none'; microphone 'none'; geolocation 'none'" credentialless></iframe>
```

---

## Hosted Deployment Notes

FrameScope is designed to be usable as a local file, but it may also be hosted internally.

Because this tool is intentionally designed to be displayed inside an iframe, do **not** deploy it with either of the following if iframe hosting is required:

```http
Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY
```

Instead, use a specific allowed parent origin:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-REPLACE_ME'; style-src 'self' 'nonce-REPLACE_ME'; img-src 'self' data:; frame-src http: https:; object-src 'none'; base-uri 'none'; form-action 'none'; connect-src 'none'; frame-ancestors https://YOUR-APP.example.edu
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=(), bluetooth=(), payment=(), clipboard-read=(), clipboard-write=()
```

For a single-file local version, inline CSS and JavaScript are retained for portability. For a hosted hardened version, consider externalizing CSS/JS or applying CSP nonces.

---

## OWASP-Oriented Hardening Included

The current hardened build includes the following security improvements:

- avoids broad dynamic `innerHTML` UI construction in favor of DOM APIs
- uses `textContent` for generated UI text
- restricts target URLs to `http:` and `https:`
- uses `noopener,noreferrer` for new-window opening
- includes warnings for internal/private-looking targets
- denies feature permissions by default
- uses `feature 'src'` instead of broad `feature *` when enabling feature permissions
- avoids `allow-same-origin` in suspicious and maximum-isolation presets
- includes a maximum-isolation preset
- includes generated iframe output for reproducibility
- documents hosted deployment headers while preserving iframe-hosting compatibility

---

## Recommended Analyst Workflow

For suspicious URLs:

1. Start with **Suspicious-link preset**.
2. Load the URL.
3. If the page does not render, try **Interactive preset** only if the use case requires it.
4. If you need stricter analysis, use **Maximum isolation**.
5. If the target is local/private/internal-looking, confirm that loading it from your workstation/network context is expected.
6. Use **Open no-opener** only when you intentionally want to open the target outside the iframe.
7. Copy the generated iframe tag if you need to document the exact configuration used.

---

## Known Limitations

- Browser support for `credentialless` varies.
- Many websites block iframe rendering with their own headers.
- Parent JavaScript cannot inspect arbitrary cross-origin iframe internals.
- Load failures may be indistinguishable from timeout, network delay, target-side frame blocking, or application incompatibility.
- Strict CSP/no-script mode may break most modern sites.
- This tool does not replace a VM, browser sandbox, proxy, or full phishing detonation environment.

---

## Version

Current described build:

```text
FrameScope v7 OWASP Hardened
```

---

## License / Use

No license is embedded in the script. Add an appropriate project license before publishing or redistributing.
