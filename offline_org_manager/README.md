# Offline Volunteer Trust Ecosystem

A completely standalone, browser-based proof of concept for administering pseudonymous community volunteers without requiring a cloud service, centralized identity provider, CDN, package manager, or external JavaScript library.

The ecosystem uses leader-issued cryptographic identities and file-based package exchange. Leaders enroll applications, define application roles, provision protected volunteer activation bundles, issue encrypted work, and verify returned results. Volunteers use the standalone app to activate their identity, open authorized work packages, run the permitted application capability, and return signed, encrypted results.

The current proof of concept includes a bundled application named **PING** for exchanging encrypted Markdown messages and file attachments.

## Project status

**Proof of concept only.**

This project demonstrates the package formats, trust relationships, role filtering, identity lifecycle, and offline user experience. It has not received an independent cryptographic or application-security review and should not be used for production, regulated, safety-critical, or high-risk operations without further engineering and assessment.

## Design goals

- Operate entirely within a modern web browser.
- Require no server, cloud service, CDN, npm package, external font, or remote content.
- Exchange identities, work, results, and configurations as files.
- Support pseudonymous volunteers without requiring legal names or email addresses.
- Allow the leader to define arbitrary applications and application-scoped roles.
- Send only the application capability authorized for the selected volunteer role.
- Protect message content, attachments, private keys, and organization backups with native Web Crypto APIs.
- Allow leaders to enable, disable, or permanently revoke volunteer identities.
- Preserve enough organization state to move or recover the leader workspace through a protected configuration file.

## Current prototype file

The parser-validated application is distributed as:

```text
ovte_ping_identity_lifecycle_validated.html
```

The file contains its HTML, CSS, and JavaScript. It does not load any external resource.

## Primary components

### Leader App

The Leader App provides controls to:

1. Create an organization identity.
2. Install and manage applications.
3. Discover roles declared by installed applications.
4. Generate volunteer identities and protected activation bundles.
5. Enable, disable, or revoke generated identities.
6. Issue role-filtered, encrypted work packages.
7. Attach files to PING messages.
8. Import and verify encrypted volunteer replies.
9. Export or import a password-protected organization configuration.

### Volunteer App

The Volunteer App provides controls to:

1. Import a leader-issued activation bundle.
2. Unlock the bundle with the activation password.
3. Verify the leader's signature on the volunteer credential.
4. Open work addressed to the activated identity.
5. Verify the leader's work-package signature.
6. evaluate the signed identity-status snapshot included with the work.
7. Confirm that the activated identity has the required role.
8. Access only the application section authorized by that role.
9. Read encrypted Markdown instructions and download verified attachments.
10. Create a Markdown response with optional attachments.
11. Sign the reply with the volunteer identity and encrypt it to the organization.

## Bundled PING application

PING is installed by default and declares these roles:

- `ping.receive`
- `ping.reply`

PING supports:

- Leader-to-volunteer Markdown messages
- Volunteer-to-leader Markdown replies
- Encrypted attachments in both directions
- SHA-256 digest validation after decryption
- Safe local attachment downloads through Blob object URLs

### Attachment limits

The proof of concept enforces:

- Maximum 5 attachments per package
- Maximum 2 MB per attachment
- Maximum 6 MB combined attachment size

Base64 encoding increases the resulting JSON package size. These limits are intentionally conservative for an in-browser proof of concept.

## Cryptographic model

The prototype uses the browser's native Web Crypto API.

### Organization keys

The leader creates:

- ECDSA P-256 signing key pair
- RSA-OAEP 3072-bit encryption key pair using SHA-256

The organization signing key signs volunteer credentials, work packages, and identity-status snapshots. The organization encryption key receives encrypted volunteer results.

### Volunteer identity keys

For each volunteer identity, the leader creates:

- ECDSA P-256 signing key pair
- RSA-OAEP 3072-bit encryption key pair using SHA-256

The public keys remain in the leader's identity registry. The private keys are placed in the volunteer activation bundle and protected with a password-derived encryption key.

### Activation and configuration protection

Password-protected files use:

- PBKDF2
- HMAC-SHA-256
- 310,000 derivation iterations
- Random 16-byte salt
- AES-256-GCM
- Random 12-byte initialization vector

### Work and result encryption

Work and reply payloads use hybrid encryption:

1. Generate a random AES-256-GCM content key.
2. Encrypt the JSON payload with AES-GCM.
3. Wrap the content key with the recipient's RSA-OAEP public key.
4. Sign the outer envelope with the sender's ECDSA private key.

### Canonicalization

Signed objects are serialized with recursively sorted object keys before signing and verification. Package producers and consumers must use the same canonicalization rules.

## Identity lifecycle

Each leader-generated volunteer identity has one of three states.

### Enabled

- Can be selected as a work recipient.
- Can receive new work packages.
- Can return results that the leader accepts, subject to signature, expiration, and package validation.

### Disabled

- Represents a reversible administrative hold.
- Is excluded from the leader's work-recipient selector.
- Cannot receive newly issued work.
- Returned results are rejected while the identity remains disabled.
- Can be enabled again by the leader.

### Revoked

- Represents permanent invalidation.
- Is excluded from work issuance.
- Returned results are rejected.
- Cannot be enabled again through the interface.
- Records a revocation timestamp.

Revocation does not erase the identity record. Preserving the record allows the organization to recognize and reject later packages signed by the revoked identity.

## Offline status limitation

The ecosystem has no central status service. A volunteer device cannot independently discover that its identity was disabled or revoked.

Each newly issued work package therefore includes a leader-signed identity-status snapshot. The Volunteer App verifies that snapshot and refuses to open work unless its identity is shown as enabled.

This does not recall previously delivered packages. An offline volunteer may still possess an older package containing an older enabled snapshot. The leader remains the final enforcement point and rejects replies from identities that are currently disabled, revoked, or expired.

## Application and role model

An application contains an ID, name, version, and one or more role sections.

Example application definition:

```json
{
  "survey.submit": {
    "title": "Submit survey",
    "description": "Complete and return the assigned survey."
  },
  "survey.review": {
    "title": "Review survey",
    "description": "Review a submitted survey and return comments."
  }
}
```

### Role requirements

Role names must:

- Begin with a lowercase letter
- Contain only lowercase letters, numbers, periods, and hyphens
- Be between 3 and 64 characters under the current validation expression
- Be unique across the installed application set

### Role filtering

When the leader issues work:

1. The selected identity must be enabled and unexpired.
2. The identity must contain the selected role.
3. An installed application must declare that role.
4. The package includes only the section associated with that role.
5. The Volunteer App rejects a package containing zero sections, multiple sections, or a section that does not match the required role.

This is capability minimization at the package level. It prevents unrelated application sections from being sent merely because they belong to the same application.

## Organization configuration export and import

The leader can export a password-protected organization configuration.

### Included

- Organization ID and name
- Organization signing public and private keys
- Organization encryption public and private keys
- All installed applications
- Bundled PING configuration
- All generated volunteer identity records
- Identity labels, roles, expiration dates, and lifecycle states
- Status-change timestamps and reasons
- Revocation timestamps
- Leader-signed volunteer credentials
- Volunteer public keys
- Recovery copies of leader-generated volunteer private keys

### Excluded

- Activation passwords
- Configuration passwords
- Decrypted work messages
- Work-package files
- Reply-package files
- Decrypted attachments
- Local browser history

### Import validation

Before replacing the active leader state, the importer validates:

- Package type and format version
- Configuration password and AES-GCM integrity
- Organization ID and name
- Importability of organization key material
- Application structure
- Unique application IDs
- Unique roles across applications
- Presence of required PING roles
- Unique volunteer identity IDs
- Valid identity statuses
- Consistency of revocation timestamps
- Organization binding of each credential
- Leader signature on each volunteer credential
- Importability of each volunteer public key

The state is replaced only after validation completes.

## Package types

The current proof of concept uses JSON files for transport.

### Volunteer activation

```text
activate-<identity-id>.json
```

Contains the leader-signed volunteer credential and volunteer private keys inside a password-encrypted AES-GCM payload.

### Work package

```text
work-<work-id>.json
```

Contains an encrypted work payload, the selected role section, attachments, a signed identity-status snapshot, and the leader signature.

### Reply package

```text
reply-<work-id>.json
```

Contains the encrypted volunteer response and attachments, the volunteer signature, and the identity credential.

### Organization configuration

```text
organization-<organization-id>.json
```

Contains the organization keys, applications, identity registry, identity lifecycle records, and recovery key material inside a password-encrypted payload.

## Typical workflow

### Initial organization setup

1. Open the HTML file in a modern browser.
2. Select **Leader App**.
3. Enter an organization name.
4. Create the organization keys.
5. Confirm that PING is listed as a bundled application.
6. Enroll any additional applications.
7. Export a protected organization configuration and store it securely.

### Issue a volunteer identity

1. Enter a pseudonymous volunteer label.
2. Select one or more roles declared by installed applications.
3. Select a future expiration date.
4. enter an activation password of at least 12 characters.
5. Export the activation file.
6. Give the volunteer the standalone HTML and activation file.
7. Send the activation password through a separate channel.

### Send work

1. Select an enabled identity.
2. Select one of that identity's roles.
3. Enter Markdown instructions.
4. Add optional attachments within the configured limits.
5. Export the encrypted work package.
6. Transfer the file using a method agreed upon by the leader and volunteer.

### Complete work

1. Open the standalone HTML on the volunteer device.
2. Activate the identity using the activation file and password.
3. Import the work package.
4. Verify and open the work.
5. Read the Markdown instructions and download verified attachments.
6. Enter a Markdown response and add optional attachments.
7. Export the signed, encrypted reply.
8. Return the reply file to the leader.

### Receive a result

1. Import the reply in the Leader App.
2. The app checks the current identity state and expiration.
3. The app verifies the credential and volunteer signature.
4. The app decrypts the response.
5. The app validates attachment sizes and SHA-256 digests.
6. The leader can read the Markdown response and download attachments.

## Visible validation

The interface displays visible notices when, for example:

- The organization has not been created or imported
- A required field is empty
- A password is shorter than 12 characters
- An expiration date is missing or not in the future
- No role is selected
- Role JSON is malformed
- An application or role is duplicated
- An identity is disabled, revoked, or expired
- A package is addressed to another identity
- A cryptographic signature is invalid
- A configuration or activation password is incorrect
- A package contains unauthorized application sections
- An attachment exceeds the size or count limits
- An attachment's size or digest does not match

## Browser requirements

The browser must support:

- Web Crypto API through `window.crypto.subtle`
- ECDSA P-256
- RSA-OAEP with SHA-256
- AES-GCM
- PBKDF2
- `crypto.randomUUID()`
- File and Blob APIs
- Object URLs
- Modern JavaScript syntax, including async functions, object spread, computed properties, and optional chaining where used

Browser behavior for Web Crypto in a `file://` context can vary. If the browser does not expose Web Crypto to local files, serve the file from a trusted local HTTP origin without adding external dependencies.

## Parser validation

The release HTML was validated by extracting the embedded JavaScript and running:

```bash
node --check extracted-script.js
```

The validation checks JavaScript syntax only. It does not prove that every browser workflow, security control, or cryptographic decision is correct.

## Security considerations

### Protect configuration backups

An organization export contains highly sensitive key material, including the organization private keys and recovery copies of volunteer private keys. Anyone with both the file and its password may be able to impersonate the organization or a volunteer identity.

Store configuration backups as securely as root credentials. Use a strong, unique password and keep the password separate from the backup file.

### Protect activation bundles

The activation bundle contains the volunteer private keys under password-based encryption. Deliver its password separately from the file. Do not reuse organization, administrator, or personal passwords.

### Leader-generated volunteer keys

The leader generates and retains recoverable copies of volunteer keys. This supports leader provisioning and configuration recovery, but it also means the organization can technically reproduce a volunteer signature. Therefore, signatures demonstrate use of the issued key, not exclusive personal control by the volunteer.

If non-repudiation or exclusive volunteer key control becomes a requirement, redesign enrollment so the volunteer generates the private keys and provides only public keys to the leader.

### Pseudonymity is not anonymity

Pseudonymous labels do not guarantee anonymity. File transport, timestamps, filenames, attachment metadata, writing style, device behavior, and repeated keys may allow correlation or identification.

### Embedded applications

The current POC treats application role sections as structured metadata and descriptions. If future revisions execute application-provided HTML or JavaScript, they must use a constrained sandbox and a narrowly defined message interface. Do not inject enrolled application HTML directly into the leader or volunteer document.

### Revocation limitations

There is no online revocation service. Status is enforced by the leader at reply intake and by signed snapshots in newly issued work. Already distributed packages cannot be recalled.

### Metadata

Encrypted payloads still expose some outer-envelope metadata needed for routing, such as package type, recipient identity ID, sender identity ID, and work ID. A future threat model should explicitly identify which metadata must remain visible.

## Known limitations

- State exists in memory unless explicitly exported in an organization configuration.
- Closing or refreshing the page discards unexported state.
- There is no automatic synchronization or transport.
- There is no server-side audit log.
- There is no centralized revocation lookup.
- There is no multi-leader quorum or approval workflow.
- There is no delegated leader implementation in the current POC.
- Role updates require issuing updated identity credentials or a future signed grant mechanism.
- Application version upgrade and migration rules are not yet defined.
- Markdown support is intentionally limited and rendered through safe DOM text nodes.
- JSON and Base64 are inefficient for large attachments.
- Password strength is currently enforced primarily through minimum length.
- The code has been parser checked, not independently penetration tested or cryptographically audited.

## Recommended next steps

1. Split the combined POC into separate leader and volunteer HTML distributions.
2. Add formal JSON Schemas for every package type.
3. Add monotonic status-snapshot sequence numbers to prevent rollback to older snapshots.
4. Add work expiration, cancellation, and replay tracking.
5. Add signed role-grant updates and identity-renewal packages.
6. Add an append-only leader audit log to the protected configuration.
7. Add application signing and version-upgrade controls.
8. Replace recovery copies of volunteer keys with a documented escrow policy or volunteer-generated keys, depending on trust requirements.
9. Add automated unit, negative, tamper, and cross-browser tests.
10. Obtain independent security and cryptographic review before production use.

## Suggested test checklist

### Startup

- PING is installed.
- `ping.receive` and `ping.reply` are visible.
- Missing required fields produce visible alerts.

### Identity lifecycle

- Enabled identities appear in the recipient list.
- Disabled identities disappear from the recipient list.
- Disabled identities can be enabled.
- Revoked identities cannot be enabled.
- Replies from disabled identities are rejected.
- Replies from revoked identities are rejected.
- Replies from expired identities are rejected.

### Configuration

- Export fails without a sufficiently long password.
- Import fails with an incorrect password.
- Export and import preserve applications.
- Export and import preserve all identity states.
- Export and import preserve revocation timestamps.
- Import rejects duplicate application roles.
- Import rejects invalid credential signatures.

### Role filtering

- Work can only be issued using a role assigned to the selected identity.
- Work contains exactly one application section.
- Volunteer opening rejects extra or mismatched sections.

### Attachments

- Leader and volunteer can attach files in both directions.
- More than five files are rejected.
- A file over 2 MB is rejected.
- A combined payload over 6 MB is rejected.
- Modified attachment data fails digest verification.
- Valid attachments download with the expected filename and MIME type.

### Cryptographic tampering

- Modified activation ciphertext is rejected.
- Modified organization configuration ciphertext is rejected.
- Modified work envelope is rejected.
- Modified status snapshot is rejected.
- Modified volunteer reply envelope is rejected.

## License

No license has been selected for this proof of concept. Add an explicit license file before redistributing or accepting external contributions.

## Disclaimer

This software is provided as an experimental proof of concept. It is not a substitute for a reviewed identity-management platform, secure messaging platform, records-management system, or regulated workflow. Organizations adopting this design are responsible for threat modeling, legal review, privacy review, records requirements, accessibility, browser support, key-management procedures, incident response, and independent security testing.
