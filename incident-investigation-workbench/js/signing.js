'use strict';
/* Tab 9: OpenPGP detached signing of an exact case snapshot, and verification.
   The bytes that are signed are captured once and are the same bytes offered for download. */
(function () {
  const { $ } = U;
  let ctx, key = null, keyFileName = '', signed = null;

  const available = () => !!(window.openpgp && window.crypto && crypto.subtle);
  const isArmored = (bytes) => new TextDecoder().decode(bytes.slice(0, 200)).includes('-----BEGIN PGP');
  async function fileBytes(input) { const f = $(input).files[0]; if (!f) return null; Hardening.checkSize(f, 8 * 1024 * 1024); return { name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) }; }
  const asText = (b) => new TextDecoder().decode(b);

  function describe(k) {
    const uids = k.getUserIDs().join('\n             ') || '(no user ID)';
    return `Fingerprint: ${k.getFingerprint().toUpperCase().replace(/(.{4})/g, '$1 ').trim()}\nUser ID(s):  ${uids}\nAlgorithm:   ${k.getAlgorithmInfo().algorithm}`;
  }
  function forget(msg) {
    key = null; keyFileName = ''; U.clear('sgKeyFile', 'sgPass');
    $('sgKeyInfo').textContent = 'No key loaded.'; if (msg) ctx.status(msg, 'good');
  }

  async function loadKey() {
    const f = await fileBytes('sgKeyFile'); if (!f) throw Error('Choose your exported secret key file.');
    let k = isArmored(f.bytes) ? await openpgp.readPrivateKey({ armoredKey: asText(f.bytes) }) : await openpgp.readPrivateKey({ binaryKey: f.bytes });
    if (!k.isPrivate()) throw Error('That file contains a public key. A secret (private) key is required to sign.');
    if (!k.isDecrypted()) {
      const pass = $('sgPass').value; if (!pass) throw Error('This key is passphrase-protected. Enter the passphrase.');
      k = await openpgp.decryptKey({ privateKey: k, passphrase: pass });
    }
    $('sgPass').value = ''; $('sgKeyFile').value = '';
    key = k; keyFileName = f.name;
    $('sgKeyInfo').textContent = `Loaded from ${f.name}\n${describe(k)}\nStatus:      unlocked, held in memory until signing completes`;
  }

  async function sign() {
    if (!key) await loadKey();
    const bytes = ctx.caseBytes();                       // single capture of the exact bytes
    const message = await openpgp.createMessage({ binary: bytes });
    const sig = await openpgp.sign({ message, signingKeys: key, detached: true, format: 'armored' });
    /* Self-check before offering downloads. */
    const check = await openpgp.verify({ message: await openpgp.createMessage({ binary: bytes }), signature: await openpgp.readSignature({ armoredSignature: sig }), verificationKeys: key.toPublic() });
    await check.signatures[0].verified;
    const base = `${ctx.fileBase()}-signed-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}Z`;
    signed = { bytes, sig, json: base + '.json', asc: base + '.json.asc' };
    const sha = await U.sha256(bytes), info = describe(key);
    forget();
    $('sgResult').textContent = `Signed and self-verified.\n${info}\nCase SHA-256: ${sha}\nFiles:        ${signed.json}\n              ${signed.asc}\n\nThe secret key has been cleared from the workbench.`;
    $('sgDlJson').disabled = false; $('sgDlSig').disabled = false;
    ctx.S.history.push({ id: U.uid(), timestamp: U.now(), action: 'signed', description: `Snapshot signed; SHA-256 ${sha}` });
    ctx.touch();
    ctx.status('Signature created. Download both files.', 'good');
  }

  async function verify() {
    const j = await fileBytes('vfJson'), s = await fileBytes('vfSig'), k = await fileBytes('vfKey');
    if (!j || !s || !k) throw Error('Choose the case file, its signature and the signer\'s public key.');
    const keys = isArmored(k.bytes) ? await openpgp.readKeys({ armoredKeys: asText(k.bytes) }) : await openpgp.readKeys({ binaryKeys: k.bytes });
    const signature = isArmored(s.bytes) ? await openpgp.readSignature({ armoredSignature: asText(s.bytes) }) : await openpgp.readSignature({ binarySignature: s.bytes });
    const result = await openpgp.verify({ message: await openpgp.createMessage({ binary: j.bytes }), signature, verificationKeys: keys });
    const sha = await U.sha256(j.bytes), r = result.signatures[0], keyId = r.keyID.toHex().toUpperCase();
    const signer = keys.find((x) => x.getKeys(r.keyID).length);
    try { await r.verified; } catch (e) {
      const why = signer ? 'The file does not match the signature (it has been changed, or this is not the file that was signed).' : `The signature was made by key ${keyId}, which is not in the supplied public key file.`;
      $('vfResult').textContent = `BAD / UNVERIFIED SIGNATURE\n${why}\nDetail: ${e.message}\nCase SHA-256: ${sha}`; $('vfResult').className = 'bad'; ctx.status('Verification failed.', 'bad'); return;
    }
    const created = (await r.signature).packets[0].created;
    $('vfResult').textContent = `GOOD SIGNATURE\nSigned:       ${created ? created.toISOString() : 'unknown'}\nSigning key:  ${keyId}\n${describe(signer)}\nCase SHA-256: ${sha}\n\nConfirm the fingerprint belongs to the expected person through a trusted channel.`;
    $('vfResult').className = 'good'; ctx.status('Good signature.', 'good');
  }

  const guard = (fn) => async () => { if (!available()) { ctx.status('OpenPGP is unavailable in this browser context.', 'bad'); return; } try { await fn(); } catch (e) { $('sgPass').value = ''; ctx.status(e.message, 'bad'); if (fn === verify) { $('vfResult').textContent = 'ERROR: ' + e.message; $('vfResult').className = 'bad'; } } };

  IW.modules.push({
    name: 'Sign & Verify',
    init(c) {
      ctx = c;
      $('sgLoad').addEventListener('click', guard(loadKey));
      $('sgForget').addEventListener('click', () => forget('Signing key cleared.'));
      $('sgSign').addEventListener('click', guard(sign));
      $('sgDlJson').addEventListener('click', () => signed && U.download(signed.json, signed.bytes, 'application/json'));
      $('sgDlSig').addEventListener('click', () => signed && U.download(signed.asc, signed.sig, 'application/pgp-signature'));
      $('vfRun').addEventListener('click', guard(verify));
    },
    render() {
      $('sgCapability').textContent = available() ? 'OpenPGP signing and verification are available.' : 'OpenPGP is unavailable (vendor/openpgp/openpgp.min.js missing or WebCrypto blocked). Case files can still be saved unsigned.';
    }
  });
})();
