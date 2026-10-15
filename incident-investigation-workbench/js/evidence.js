'use strict';
/* Tab 3: evidence registration, screenshot capture, artifact extraction, local utilities, custody. */
(function () {
  const { $, el, button } = U;
  let ctx, stream = null, queue = [], utilResult = '';

  async function register(files, meta) {
    const S = ctx.S, added = [];
    for (const f of files) {
      const sha256 = await U.sha256(await f.arrayBuffer()), id = U.uid();
      S.evidence.push({ id, filename: f.name, size: f.size, mime_type: f.type || 'application/octet-stream', sha256, description: meta.description, source: meta.source, acquisition_method: meta.method, acquired_by: meta.by, acquired_at: meta.at || U.now(), registered: U.now(), related_entities: meta.entity ? [meta.entity] : [], tags: [], notes: '' });
      S.custody.push({ id: U.uid(), evidence_id: id, timestamp: U.now(), action: 'acquired', person: meta.by, from: meta.source, to: 'case', purpose: 'Evidence registration', notes: `SHA-256 ${sha256}` });
      added.push(f.name);
    }
    return added;
  }

  function parseEml(t) {
    const head = t.split(/\r?\n\r?\n/)[0].replace(/\r\n/g, '\n').split('\n'), h = [];
    for (const l of head) { if (/^\s/.test(l) && h.length) h[h.length - 1].value += ' ' + l.trim(); else { const i = l.indexOf(':'); if (i > 0) h.push({ name: l.slice(0, i), value: l.slice(i + 1).trim() }); } }
    const map = { from: 'email-src', to: 'email-dst', cc: 'email-dst', 'reply-to': 'email-reply-to', subject: 'email-subject', 'message-id': 'email-message-id', 'x-mailer': 'email-x-mailer', 'dkim-signature': 'dkim-signature' };
    return h.flatMap((x) => {
      const type = map[x.name.toLowerCase()]; if (!type) return [];
      if (['email-src', 'email-dst', 'email-reply-to'].includes(type)) return (x.value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}/gi) || []).map((value) => ({ include: true, type, value, source: 'EML ' + x.name }));
      return [{ include: true, type, value: x.value, source: 'EML ' + x.name }];
    });
  }

  function renderQueue() {
    if (!queue.length) { $('xQueue').replaceChildren(el('p', 'No candidates. Choose an artifact and run step 1.', 'muted')); return; }
    $('xQueue').replaceChildren(U.table(['Add', 'Type', 'Value', 'Source'], queue.map((q) => {
      const c = el('input'); c.type = 'checkbox'; c.checked = q.include; c.addEventListener('change', () => { q.include = c.checked; });
      return [c, q.type, q.value, q.source];
    })));
  }

  const UTIL = {
    defang: (v) => v.replace(/^http/i, 'hxxp').replace(/\./g, '[.]').replace(/@/g, '[@]'),
    refang: (v) => v.replace(/^hxxp/i, 'http').replace(/\[\.\]/g, '.').replace(/\[@\]/g, '@'),
    urlencode: encodeURIComponent, urldecode: decodeURIComponent,
    b64e: (v) => { let s = ''; for (const b of new TextEncoder().encode(v)) s += String.fromCharCode(b); return btoa(s); },
    b64d: (v) => new TextDecoder().decode(Uint8Array.from(atob(v.trim()), (c) => c.charCodeAt(0)))
  };

  function render() {
    const S = ctx.S;
    U.options($('vEntity'), ctx.entityOptions()); U.options($('kEvidence'), ctx.evidenceOptions());
    U.options($('xTarget'), ctx.targetOptions()); U.options($('uTarget'), ctx.targetOptions());
    U.options($('uSource'), [['', '— none —'], ...ctx.allAttributes().map((a) => [a.id, `${a.type}: ${a.value.slice(0, 50)}`])]);
    $('vList').replaceChildren(U.table(['File', 'Type', 'Size', 'SHA-256', 'Source', 'Acquired', 'By', 'Entity', 'Custody', ''], S.evidence.map((v) => {
      let act = '';
      if (v.kind === 'markdown-note') {
        act = el('div', null, 'row');
        act.append(button('View', 'small', () => { $('vNoteView').replaceChildren(MD.noteView({ title: v.title || v.filename, author: v.acquired_by, created: v.acquired_at, body: v.content }, [button('Close', 'small', () => $('vNoteView').replaceChildren())])); }),
          button('Download .md', 'small', () => U.download(v.filename, v.content, 'text/markdown')));
      }
      return [v.filename, v.kind === 'markdown-note' ? 'Markdown note' : 'File', v.size ?? '', v.sha256, v.source || '', v.acquired_at || '', v.acquired_by || '', (v.related_entities || []).map(ctx.entityName).join(', '), S.custody.filter((k) => k.evidence_id === v.id).length, act];
    })));
    $('kList').replaceChildren(U.table(['Evidence', 'Date/time', 'Action', 'Person', 'From', 'To', 'Purpose', 'Notes'], S.custody.map((k) => [ctx.evidenceName(k.evidence_id), k.timestamp, k.action, k.person, k.from, k.to, k.purpose, k.notes])));
    renderQueue();
  }

  IW.modules.push({
    name: 'Evidence',
    init(c) {
      ctx = c;
      $('vAdd').addEventListener('click', async () => {
        const files = [...$('vFiles').files]; if (!files.length) { ctx.status('Choose one or more evidence files first.', 'bad'); return; }
        try {
          const added = await register(files, { description: U.txt($('vDesc').value), source: U.txt($('vSource').value), method: U.txt($('vMethod').value), by: U.txt($('vBy').value), at: $('vAt').value, entity: $('vEntity').value });
          U.clear('vFiles', 'vDesc'); ctx.changed(`Registered ${added.length} evidence item(s). File contents were hashed, not stored.`);
        } catch (e) { ctx.status('Evidence registration failed: ' + e.message, 'bad'); }
      });
      $('vScreen').addEventListener('click', async () => {
        try { if (!navigator.mediaDevices?.getDisplayMedia) throw Error('Screen capture is not available in this browser context.'); stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }); $('vVideo').srcObject = stream; ctx.status('Screen selected. Use step 2 to capture.', 'good'); }
        catch (e) { ctx.status(e.message, 'bad'); }
      });
      $('vSnap').addEventListener('click', () => {
        if (!stream) { ctx.status('Choose a screen or window first (step 1).', 'bad'); return; }
        const v = $('vVideo'), cv = $('vCanvas'); cv.width = v.videoWidth; cv.height = v.videoHeight; cv.getContext('2d').drawImage(v, 0, 0);
        cv.toBlob(async (b) => {
          const name = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
          await register([new File([b], name, { type: 'image/png' })], { description: U.txt($('vDesc').value) || 'Screen capture', source: 'Screen capture', method: 'Browser screen capture', by: U.txt($('vBy').value), at: U.now(), entity: $('vEntity').value });
          U.download(name, b, 'image/png'); stream.getTracks().forEach((t) => t.stop()); stream = null; $('vVideo').srcObject = null;
          ctx.changed('Screenshot hashed, registered and downloaded. Keep the PNG with your evidence.');
        }, 'image/png');
      });
      $('xRun').addEventListener('click', async () => {
        const f = $('xFile').files[0]; if (!f) { ctx.status('Choose an artifact file first.', 'bad'); return; }
        try {
          queue = /\.eml$/i.test(f.name) ? parseEml(await f.text()) : [];
          queue.push({ include: true, type: 'filename', value: f.name, source: 'File intake' }, { include: true, type: 'size-in-bytes', value: String(f.size), source: 'File intake' }, { include: true, type: 'sha256', value: await U.sha256(await f.arrayBuffer()), source: 'File hash' });
          renderQueue(); ctx.status(`${queue.length} candidate(s) extracted. Review, then use step 2.`, 'good');
        } catch (e) { ctx.status('Extraction failed: ' + e.message, 'bad'); }
      });
      $('xApply').addEventListener('click', () => {
        const pick = queue.filter((q) => q.include); if (!pick.length) { ctx.status('No candidates selected.', 'bad'); return; }
        const list = ctx.targetList($('xTarget').value);
        for (const q of pick) list.push(STSModel.normalizeAttr({ type: q.type, value: q.value, relation: q.type, category: q.type.startsWith('email') ? 'Payload delivery' : 'External analysis', provenance: { method: 'artifact-extraction', source: q.source, at: U.now() } }));
        queue = []; U.clear('xFile'); ctx.changed(`${pick.length} attribute(s) added to ${$('xTarget').selectedOptions[0].textContent}.`);
      });
      $('uSource').addEventListener('change', () => { const a = ctx.allAttributes().find((x) => x.id === $('uSource').value); if (a) $('uInput').value = a.value; });
      document.querySelectorAll('[data-util]').forEach((b) => b.addEventListener('click', () => {
        try { utilResult = UTIL[b.dataset.util]($('uInput').value); $('uOut').textContent = utilResult; }
        catch (e) { utilResult = ''; $('uOut').textContent = ''; ctx.status('Utility failed: input is not valid for this conversion.', 'bad'); }
      }));
      $('uAdd').addEventListener('click', () => {
        if (!utilResult) { ctx.status('Run a utility first.', 'bad'); return; }
        const type = /^h(tt|xx)ps?:\/\//i.test(utilResult) ? 'url' : 'text';
        ctx.targetList($('uTarget').value).push(STSModel.normalizeAttr({ type, value: utilResult, relation: 'utility-result', category: 'External analysis', provenance: { method: 'local-utility', at: U.now() } }));
        ctx.changed('Utility result added as an attribute.');
      });
      $('kAdd').addEventListener('click', () => {
        const id = $('kEvidence').value; if (!id) { ctx.status('Choose the evidence item this custody event applies to.', 'bad'); return; }
        ctx.S.custody.push({ id: U.uid(), evidence_id: id, timestamp: $('kAt').value || U.now(), action: $('kAction').value, person: U.txt($('kPerson').value), from: U.txt($('kFrom').value), to: U.txt($('kTo').value), purpose: U.txt($('kPurpose').value), notes: U.txt($('kNotes').value) });
        U.clear('kPurpose', 'kNotes'); ctx.changed('Custody event recorded.');
      });
    },
    render
  });
})();
