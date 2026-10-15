'use strict';
/* Application shell: state, tabbed wizard, header actions, autosave, Case tab, module start-up. */
(function () {
  const { $ } = U;
  let S = null, saveTimer = null;

  function status(msg, kind) { const e = $('status'); e.textContent = msg; e.className = 'status no-print ' + (kind || ''); }

  const ctx = {
    get S() { return S; },
    status,
    /* Structural change: re-render everything. */
    changed(msg, kind) { S.case.modified = U.now(); scheduleSave(); renderAll(); if (msg) status(msg, kind || 'good'); },
    /* Inline field edit: persist without re-rendering (keeps focus and expanded panels). */
    touch() { S.case.modified = U.now(); scheduleSave(); renderHeader(); },
    replace(n, msg) { S = n; renderAll(); scheduleSave(); if (msg) status(msg, 'good'); },
    caseBytes() { return STSModel.serialize(S); },
    fileBase() { return U.safeName(S.case.case_number || S.case.title || 'case'); },
    entityName(id) { const e = S.entities.find((x) => x.id === id); return e ? e.name : (id ? '(removed)' : ''); },
    evidenceName(id) { const e = S.evidence.find((x) => x.id === id); return e ? (e.filename || e.description || e.id) : (id ? '(removed)' : ''); },
    entityOptions() { return [['', '— none —'], ...S.entities.map((e) => [e.id, `${e.name} [${e.type}]`])]; },
    evidenceOptions() { return [['', '— none —'], ...S.evidence.map((e) => [e.id, e.filename || e.description || e.id])]; },
    hypothesisOptions() { return [['', '— none —'], ...S.hypotheses.map((h) => [h.id, h.title])]; },
    findingOptions() { return [['', '— none —'], ...S.findings.map((f) => [f.id, f.title])]; },
    targetOptions() { return [['root', 'Case-level attributes'], ...S.entities.map((e) => [e.id, `${e.name} [${e.type}]`])]; },
    targetList(id) { if (!id || id === 'root') return S.rootAttributes; return (S.entities.find((e) => e.id === id) || {}).attributes || S.rootAttributes; },
    allAttributes() { return [...S.rootAttributes, ...S.entities.flatMap((e) => e.attributes)]; }
  };

  /* ---------- persistence ---------- */
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveLocal, 600); }
  function saveLocal() {
    try { const n = STSStorage.save(S); $('saveState').textContent = `Autosaved ${new Date().toLocaleTimeString()} (${n.toLocaleString()} bytes)`; renderLocalList(); }
    catch (e) { $('saveState').textContent = 'Autosave unavailable: ' + e.message; }
  }
  function hasContent() { return S.case.title || S.entities.length || S.evidence.length || S.events.length || S.findings.length; }

  /* ---------- tabs ---------- */
  function show(tab) {
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === tab));
    document.querySelectorAll('.tab').forEach((b) => { const on = b.dataset.tab === tab; b.classList.toggle('active', on); b.setAttribute('aria-current', on ? 'step' : 'false'); });
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => show(b.dataset.go)));

  /* ---------- header ---------- */
  const PHASE_OF = { Reported: 'Detection & Analysis', Triage: 'Detection & Analysis', Analysis: 'Detection & Analysis', Containment: 'Containment, Eradication & Recovery', Eradication: 'Containment, Eradication & Recovery', Recovery: 'Containment, Eradication & Recovery', 'Post-incident review': 'Post-Incident Activity', Closed: 'Closed', Reopened: 'Detection & Analysis' };
  ctx.phaseOf = (st) => PHASE_OF[st] || 'Detection & Analysis';
  function renderHeader() {
    $('hdrCase').textContent = [S.case.case_number, S.case.title || 'Untitled case'].filter(Boolean).join(' — ');
    $('hdrPhase').textContent = `${S.case.status} · ${ctx.phaseOf(S.case.status)} · ${S.case.severity}`;
  }
  $('btnNew').addEventListener('click', () => {
    if (hasContent() && !confirm('Start a new case? The current case remains in browser storage (1.5) but save a case file first if you need a durable copy.')) return;
    ctx.replace(STSModel.create(), 'New case started.'); show('p1');
  });
  $('btnOpen').addEventListener('click', () => $('openFile').click());
  $('openFile').addEventListener('change', async () => {
    const f = $('openFile').files[0]; if (!f) return;
    try {
      Hardening.checkSize(f, Hardening.limits.MAX_JSON);
      const raw = Hardening.parseJSON(await f.text()), n = STSModel.normalize(raw);
      if (hasContent() && !confirm(`Replace the current case with "${n.case.title || f.name}"?`)) return;
      ctx.replace(n, raw.event ? 'Legacy CTI Workbench v2.2.1 project converted and opened.' : `Opened ${f.name}.`); show('p1');
    } catch (e) { status('Could not open case file: ' + e.message, 'bad'); }
    finally { $('openFile').value = ''; }
  });
  $('btnSaveFile').addEventListener('click', () => { U.download(ctx.fileBase() + '.json', ctx.caseBytes(), 'application/json'); status('Case file saved. To sign it, use task 8.6 so the signature matches the exact bytes.', 'good'); });

  /* ---------- 1 Case tab ---------- */
  const CASE_FIELDS = { cTitle: 'title', cNumber: 'case_number', cClass: 'classification', cStatus: 'status', cOwner: 'owner', cStart: 'incident_start', cDiscovered: 'discovered', cContained: 'contained', cClosed: 'closed', cDesc: 'description' };
  for (const [id, key] of Object.entries(CASE_FIELDS)) $(id).addEventListener('input', () => { S.case[key] = $(id).value; ctx.touch(); });
  $('cTags').addEventListener('input', () => { S.case.tags = U.tags($('cTags').value); ctx.touch(); });
  $('cResponders').addEventListener('input', () => { S.case.responders = U.tags($('cResponders').value); ctx.touch(); });
  U.options($('cStatus'), STSModel.STATUSES.map((x) => [x, x]));
  function renderCase() {
    for (const [id, key] of Object.entries(CASE_FIELDS)) if (document.activeElement !== $(id)) $(id).value = S.case[key] || '';
    if (document.activeElement !== $('cTags')) $('cTags').value = S.case.tags.join(', ');
    if (document.activeElement !== $('cResponders')) $('cResponders').value = S.case.responders.join(', ');
    const openF = S.findings.filter((f) => !['Closed', 'Accepted'].includes(f.status)).length;
    const done = (a) => ['Completed', 'Cancelled'].includes(a.status), ph = (p) => S.actions.filter((a) => a.phase === p);
    const fmt = (list) => `${list.filter(done).length}/${list.length} done`;
    const phases = [
      ['Preparation', `${S.contacts.length} contact(s), ${S.obligations.length} obligation(s)`, S.contacts.length > 0],
      ['Detection & Analysis', `${S.evidence.length} evidence, ${S.entities.length} entities, ${S.events.length} events, ${S.hypotheses.length} hypotheses — ${S.categorization.determination}`, S.categorization.determination !== 'Under assessment'],
      ['Containment', `${fmt(ph('Containment'))}${S.case.contained ? ' · contained ' + new Date(S.case.contained).toLocaleString() : ''}`, !!S.case.contained],
      ['Eradication & Recovery', `eradication ${fmt(ph('Eradication'))}, recovery ${fmt(ph('Recovery'))}`, ph('Recovery').length > 0 && ph('Recovery').every(done)],
      ['Communication', `${S.notifications.length} notification(s), ${S.sitreps.length} SITREP(s)`, S.notifications.length > 0],
      ['Post-Incident Activity', `${S.conclusion.disposition ? 'conclusion recorded' : 'no conclusion'}, ${S.lessons.improvements.length} improvement(s)${S.case.closed ? ' · closed' : ''}`, !!S.case.closed]
    ];
    $('cStats').replaceChildren(U.table(['Phase', 'Progress', ''], phases.map(([p, d, ok]) => [p, d, ok ? '✓' : ''])),
      U.el('p', `${openF} open finding(s) · ${S.tasks.filter((t) => t.status !== 'Completed').length} open task(s) · ${S.actions.filter((a) => !done(a)).length} active action(s) · ${S.information_gaps.filter((g) => !['Answered', 'Unable to Answer'].includes(g.status)).length} open information gap(s)`, 'muted'));
  }
  function renderLocalList() {
    const items = STSStorage.list().map((x) => [x.id, `${x.case_number ? x.case_number + ' — ' : ''}${x.title} (saved ${new Date(x.modified).toLocaleString()})${S && x.id === S.case.id ? ' [open]' : ''}`]);
    U.options($('cLocalList'), items.length ? items : [['', 'No cases saved in this browser']]);
  }
  $('cLocalOpen').addEventListener('click', () => {
    const id = $('cLocalList').value; if (!id) return;
    try { ctx.replace(STSModel.normalize(STSStorage.load(id)), 'Case opened from browser storage.'); } catch (e) { status(e.message, 'bad'); }
  });
  $('cLocalDelete').addEventListener('click', () => {
    const id = $('cLocalList').value; if (!id) return;
    if (id === S.case.id) { status('That case is currently open. Start or open a different case first.', 'bad'); return; }
    if (confirm('Delete this case from browser storage? Saved case files are not affected.')) { STSStorage.remove(id); renderLocalList(); status('Local copy deleted.', 'good'); }
  });
  $('cLocalClear').addEventListener('click', () => {
    if (!confirm('Clear ALL cases from browser storage? The open case will be re-saved on the next edit.')) return;
    STSStorage.clear(); renderLocalList(); status('Browser storage cleared.', 'good');
  });
  $('cRunTests').addEventListener('click', () => {
    const results = Hardening.selfTest();
    const a = STSModel.create(); a.case.title = 'Round trip'; a.entities.push(STSModel.normalizeEntity({ name: 'host-1', type: 'host', attributes: [{ type: 'hostname', value: 'host-1' }] }));
    const bytes = STSModel.serialize(a), b = STSModel.normalize(Hardening.parseJSON(new TextDecoder().decode(bytes)));
    results.push({ name: 'Native JSON round trip', pass: JSON.stringify(a) === JSON.stringify(b) });
    results.push({ name: 'OpenPGP library loaded', pass: !!window.openpgp });
    $('cTestOut').textContent = results.map((r) => `${r.pass ? 'PASS' : 'FAIL'}  ${r.name}`).join('\n');
    status(results.every((r) => r.pass) ? 'All self-tests passed.' : 'One or more self-tests failed.', results.every((r) => r.pass) ? 'good' : 'bad');
  });

  /* ---------- render & start-up ---------- */
  function renderAll() {
    renderHeader(); renderCase(); renderLocalList();
    for (const m of IW.modules) { try { m.render(ctx); } catch (e) { console.error(m.name, e); status(`${m.name} failed to render: ${e.message}`, 'bad'); } }
  }

  S = STSModel.create();
  if (STSStorage.available()) {
    const last = STSStorage.latest();
    if (last) { try { S = STSModel.normalize(STSStorage.load(last.id)); status(`Recovered "${last.title}" from browser storage.`, 'good'); } catch (e) { status('Could not recover last case: ' + e.message, 'bad'); } }
    $('saveState').textContent = 'Autosave on';
  } else $('saveState').textContent = 'Browser storage unavailable — use Save case file';

  const failed = [];
  for (const m of IW.modules) { try { m.init(ctx); } catch (e) { failed.push(m.name); console.error(m.name, e); } }
  renderAll();
  if (failed.length) status('Some features failed to start: ' + failed.join(', '), 'bad');
  window.__IW = ctx; // test hook
})();
