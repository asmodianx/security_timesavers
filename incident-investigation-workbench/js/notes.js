'use strict';
/* Markdown notes: a safe Markdown renderer (DOM-built, never innerHTML), per-phase notes on every tab,
   and Markdown notes registered as evidence (task 2.3). */
(function () {
  const { $, el, button } = U;
  const MAX_NOTE = 1024 * 1024;
  const TABS = [['p1', 'Prepare', 'Preparation', '1.7'], ['p2', 'Detect', 'Detection & Analysis', '2.10'], ['p3', 'Scope & Timeline', 'Detection & Analysis', '3.7'], ['p4', 'Assess', 'Detection & Analysis', '4.6'], ['p5', 'Contain', 'Containment, Eradication & Recovery', '5.5'], ['p6', 'Eradicate & Recover', 'Containment, Eradication & Recovery', '6.4'], ['p7', 'Communicate', 'Throughout', '7.3'], ['p8', 'Close & Improve', 'Post-Incident Activity', '8.8']];

  /* ---------------- Markdown (CommonMark subset) ----------------
     Headings, paragraphs (line breaks kept), **bold**, *italic*, ~~strike~~, `code`, fenced code,
     > quotes, - / 1. lists, - [ ] / - [x] task items, pipe tables, --- rules, [text](url) links.
     Output is built with createElement/text nodes only, so HTML in a note is shown as text.
     Links are shown as text with the URL beside them; they are not clickable (offline tool). */
  const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*|(?<!\w)__[^_\n]+__(?!\w))|(~~[^~\n]+~~)|(\*[^*\s][^*\n]*\*|(?<!\w)_[^_\s][^_\n]*_(?!\w))|(\[[^\]\n]+\]\([^)\s]+\))/;
  function inline(text, parent) {
    let s = String(text);
    while (s) {
      const m = INLINE.exec(s);
      if (!m) { parent.append(document.createTextNode(s)); break; }
      if (m.index) parent.append(document.createTextNode(s.slice(0, m.index)));
      const t = m[0];
      if (m[1]) parent.append(el('code', t.slice(1, -1)));
      else if (m[2]) { const b = el('strong'); inline(t.slice(2, -2), b); parent.append(b); }
      else if (m[3]) { const d = el('del'); inline(t.slice(2, -2), d); parent.append(d); }
      else if (m[4]) { const i = el('em'); inline(t.slice(1, -1), i); parent.append(i); }
      else { const l = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t), sp = el('span', null, 'md-link'); inline(l[1], sp); parent.append(sp, el('span', ` (${l[2]})`, 'muted')); }
      s = s.slice(m.index + t.length);
    }
  }
  const SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
  const LIST = /^\s*([-*+]|\d+[.)])\s+/;
  const HR = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;
  function render(md, depth) {
    depth = depth || 0;
    const root = el('div', null, 'md'), lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    const blank = (l) => !l.trim();
    const isTable = (k) => lines[k].includes('|') && k + 1 < lines.length && SEP.test(lines[k + 1]);
    const startsBlock = (k) => /^(```|#{1,6}\s|>)/.test(lines[k]) || LIST.test(lines[k]) || HR.test(lines[k]) || isTable(k);
    let i = 0;
    while (i < lines.length) {
      const l = lines[i]; let m;
      if (blank(l)) { i++; continue; }
      if (/^```/.test(l)) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; const pre = el('pre'); pre.append(el('code', buf.join('\n'))); root.append(pre); continue; }
      if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) { const h = el('h' + Math.min(6, m[1].length + 3)); inline(m[2].replace(/\s+#+\s*$/, ''), h); root.append(h); i++; continue; }
      if (HR.test(l)) { root.append(el('hr')); i++; continue; }
      if (/^>/.test(l)) { const buf = []; while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, '')); const q = el('blockquote'); q.append(depth < 8 ? render(buf.join('\n'), depth + 1) : el('p', buf.join(' '))); root.append(q); continue; }
      if (LIST.test(l)) {
        const ordered = /^\s*\d/.test(l), re = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/, list = el(ordered ? 'ol' : 'ul');
        while (i < lines.length && re.test(lines[i])) {
          let t = lines[i++].replace(re, ''); const li = el('li'), tm = /^\[([ xX])\]\s+/.exec(t);
          if (tm) { li.append(document.createTextNode(tm[1] === ' ' ? '☐ ' : '☑ ')); t = t.slice(tm[0].length); }
          inline(t, li); list.append(li);
        }
        root.append(list); continue;
      }
      if (isTable(i)) {
        const cells = (r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
        const head = cells(l); i += 2; const rows = [];
        while (i < lines.length && lines[i].includes('|') && !blank(lines[i])) rows.push(cells(lines[i++]));
        const t = el('table'), th = el('thead'), hr = el('tr'), tb = el('tbody');
        head.forEach((h) => { const c = el('th'); inline(h, c); hr.append(c); }); th.append(hr);
        rows.forEach((r) => { const tr = el('tr'); head.forEach((_, k) => { const c = el('td'); inline(r[k] || '', c); tr.append(c); }); tb.append(tr); });
        t.append(th, tb); root.append(t); continue;
      }
      const p = el('p'); let first = true;
      while (i < lines.length && !blank(lines[i]) && (first || !startsBlock(i))) { if (!first) p.append(el('br')); inline(lines[i].trim(), p); first = false; i++; }
      root.append(p);
    }
    return root;
  }

  /* ---------------- Phase notes ---------------- */
  let ctx, lastAuthor = '';
  const editing = {};
  const when = (v) => (v ? new Date(v).toLocaleString() : '');
  const mdFile = (n) => `# ${n.title || 'Note'}\n\n_${[n.author, when(n.created), n.phase_label].filter(Boolean).join(' · ')}_\n\n${n.body}\n`;

  function noteView(n, actions) {
    const d = el('div', null, 'note'), h = el('div', null, 'note-head');
    const meta = [n.author, when(n.created), n.modified && n.modified !== n.created ? 'edited ' + when(n.modified) : ''].filter(Boolean).join(' · ');
    h.append(el('b', n.title || '(untitled)'), el('span', ' ' + meta, 'muted'));
    d.append(h, render(n.body));
    if (actions) { const row = el('div', null, 'row'); row.append(...actions); d.append(row); }
    return d;
  }
  function resetForm(tab) {
    delete editing[tab]; U.clear(`n_${tab}_title`, `n_${tab}_body`); $(`n_${tab}_out`).replaceChildren();
    $(`n_${tab}_add`).textContent = 'Add note'; $(`n_${tab}_cancel`).hidden = true;
  }
  function saveNote(tab, label, phase) {
    const body = $(`n_${tab}_body`).value, title = U.txt($(`n_${tab}_title`).value), author = U.txt($(`n_${tab}_author`).value);
    if (!body.trim()) { ctx.status('Write the note first.', 'bad'); return; }
    if (new Blob([body]).size > MAX_NOTE) { ctx.status('Notes are limited to 1 MiB.', 'bad'); return; }
    lastAuthor = author;
    const S = ctx.S, id = editing[tab];
    if (id) {
      const n = S.notes.find((x) => x.id === id);
      if (n) { Object.assign(n, { title, body, author, modified: U.now() }); S.history.push({ id: U.uid(), timestamp: U.now(), action: 'note-edited', description: `${label} note "${title || id}" edited.` }); }
      resetForm(tab); ctx.changed('Note updated.'); return;
    }
    const t = U.now();
    S.notes.push({ id: U.uid(), tab, phase_label: `${tab.slice(1)} ${label}`, nist_phase: phase, title, body, author, created: t, modified: t });
    resetForm(tab); ctx.changed(`Note added to ${label}.`);
  }
  function renderTab(tab, label) {
    const S = ctx.S, list = S.notes.filter((n) => n.tab === tab).sort((a, b) => String(a.created).localeCompare(String(b.created)));
    if (document.activeElement !== $(`n_${tab}_author`) && !$(`n_${tab}_author`).value) $(`n_${tab}_author`).value = lastAuthor || S.case.owner || '';
    $(`n_${tab}_count`).textContent = list.length ? ` (${list.length})` : '';
    $(`n_${tab}_list`).replaceChildren(...(list.length ? list.map((n) => noteView(n, [
      button('Edit', 'small', () => { editing[tab] = n.id; $(`n_${tab}_title`).value = n.title; $(`n_${tab}_body`).value = n.body; $(`n_${tab}_author`).value = n.author; $(`n_${tab}_add`).textContent = 'Save changes'; $(`n_${tab}_cancel`).hidden = false; ctx.status('Editing note: change it above, then Save changes.', 'good'); }),
      button('Download .md', 'small', () => U.download(U.safeName(n.title || 'note') + '.md', mdFile(n), 'text/markdown')),
      button('Delete', 'danger small', () => { if (!confirm('Delete this note?')) return; S.notes.splice(S.notes.indexOf(n), 1); if (editing[tab] === n.id) resetForm(tab); ctx.changed('Note deleted.'); })
    ])) : [el('p', 'No notes for this phase yet.', 'muted')]));
  }

  /* ---------------- Markdown note as evidence (2.3) ---------------- */
  async function registerEvidenceNote() {
    const body = $('enBody').value, title = U.txt($('enTitle').value) || 'Analyst note', author = U.txt($('enAuthor').value);
    if (!body.trim()) { ctx.status('Write the note first.', 'bad'); return; }
    const bytes = new TextEncoder().encode(body);
    if (bytes.length > MAX_NOTE) { ctx.status('Evidence notes are limited to 1 MiB.', 'bad'); return; }
    const S = ctx.S, id = U.uid(), sha256 = await U.sha256(bytes), at = U.now();
    const filename = `${U.safeName(title)}-${at.slice(0, 19).replace(/[-:T]/g, '')}Z.md`;
    S.evidence.push({ id, kind: 'markdown-note', filename, title, content: body, size: bytes.length, mime_type: 'text/markdown', sha256, description: title, source: 'Analyst note', acquisition_method: 'Authored in Incident Investigation Workbench', acquired_by: author, acquired_at: at, registered: at, related_entities: $('enEntity').value ? [$('enEntity').value] : [], tags: [], notes: '' });
    S.custody.push({ id: U.uid(), evidence_id: id, timestamp: at, action: 'created', person: author, from: '', to: 'case', purpose: 'Analyst note recorded as evidence', notes: `SHA-256 ${sha256}` });
    lastAuthor = author; U.clear('enTitle', 'enBody'); $('enOut').replaceChildren();
    ctx.changed(`Note registered as evidence ${filename}. Its content is now fixed; record corrections as a new note.`);
  }

  IW.modules.push({
    name: 'Notes',
    init(c) {
      ctx = c;
      for (const [tab, label, phase] of TABS) {
        $(`n_${tab}_preview`).addEventListener('click', () => $(`n_${tab}_out`).replaceChildren(el('h4', 'Preview'), render($(`n_${tab}_body`).value)));
        $(`n_${tab}_add`).addEventListener('click', () => saveNote(tab, label, phase));
        $(`n_${tab}_cancel`).addEventListener('click', () => { resetForm(tab); ctx.status('Edit cancelled.', 'good'); });
      }
      $('enPreview').addEventListener('click', () => $('enOut').replaceChildren(el('h4', 'Preview'), render($('enBody').value)));
      $('enRegister').addEventListener('click', () => registerEvidenceNote().catch((e) => ctx.status('Could not register note: ' + e.message, 'bad')));
    },
    render() {
      for (const [tab, label] of TABS) renderTab(tab, label);
      U.options($('enEntity'), ctx.entityOptions());
      if (document.activeElement !== $('enAuthor') && !$('enAuthor').value) $('enAuthor').value = lastAuthor || ctx.S.case.owner || '';
    }
  });
  window.MD = { render, noteView, TABS };
})();
