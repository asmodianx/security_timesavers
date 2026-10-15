# Cryptography

## What is signed
Task 8.6 signs a **snapshot**: the case is serialized once (`STSModel.serialize`), those bytes are signed with an
OpenPGP detached signature, the signature is verified against the same key, and exactly those bytes and the
signature are offered for download as a matched pair. The snapshot includes phase notes and evidence notes.

### Why earlier builds produced non-matching files
Earlier builds serialized the case twice, once to sign and once to download, with asynchronous steps between.
Autosave updated the case's `modified` time in that gap, so the downloaded JSON differed from the signed JSON. Two
simultaneous downloads were also triggered, which some browsers suppress. Both causes are removed.

## Evidence-note hashes
A Markdown note registered as evidence (2.3) is hashed with SHA-256 over its UTF-8 text. The note cannot be edited
afterwards. **Download .md** in 2.9 writes exactly those bytes, so `shasum -a 256` on the download matches the register.

## Keys
- Supply the secret key as a **file** (armored `.asc` or binary `.gpg`), not pasted text.
- Passphrase-protected keys are decrypted in memory for the signing operation only.
- After signing, on **Forget key**, or on error, the key reference, file selection and passphrase are cleared.
  Nothing key-related is written to the case or to browser storage.
- JavaScript cannot guarantee memory is wiped. On shared machines consider a dedicated signing subkey.

    gpg --export-secret-keys --armor KEYID > signing-key.asc     # secret key for 8.6
    gpg --export --armor KEYID > public-key.asc                  # public key for verifiers

## Verification
Inputs: case file, signature (armored or binary), signer's public key (armored or binary). Output: GOOD or BAD,
signature time, key ID, fingerprint, user IDs and the case file's SHA-256. BAD distinguishes "file changed / wrong
file" from "signed by a key not in the supplied file". Interoperable with `gpg --verify case.json.asc case.json`.

## Dependency
OpenPGP.js 6.3.2 in `vendor/openpgp/`. No runtime download. Upstream SHA-256 of `openpgp.min.js`:
`e19bf4f04f34f24caded3ff3f3643099538b2674a0a94221e2faca75ac3e4aa1`.
