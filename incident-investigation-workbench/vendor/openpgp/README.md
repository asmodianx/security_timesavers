# Vendored OpenPGP.js

Place **OpenPGP.js 6.3.2** `dist/openpgp.min.js` in this folder as `openpgp.min.js` (copy it from your previous
Workbench build, or `npm pack openpgp@6.3.2` and take `package/dist/openpgp.min.js` and `package/LICENSE`).
Upstream licence: LGPL-3.0.

Upstream SHA-256: `e19bf4f04f34f24caded3ff3f3643099538b2674a0a94221e2faca75ac3e4aa1`

    shasum -a 256 openpgp.min.js            # macOS
    sha256sum openpgp.min.js                # Linux
    Get-FileHash openpgp.min.js             # Windows PowerShell

## Firefox "Source map error"
The last line of the upstream file is `//# sourceMappingURL=openpgp.min.js.map`. Firefox developer tools log a
harmless error looking for it. Delete that line to silence it, and record the new hash in `CHECKSUMS.txt`.

If the library is missing, the Workbench still runs; only tasks 8.6 and 8.7 (Sign / Verify) are unavailable.
