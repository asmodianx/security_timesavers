'use strict';
/* Tab 7: SITREP snapshots, conclusion, report products, browser Print / Save as PDF. */
(function () {
  const { $, el } = U;
  const SIT = [['rpSituation', 'situation', 'Current situation'], ['rpWhat', 'what_happened', 'What happened'], ['rpConfirmed', 'confirmed', 'Confirmed facts'], ['rpUnconfirmed', 'unconfirmed', 'Unconfirmed / suspected'], ['rpAffected', 'affected', 'Affected assets / accounts'], ['rpImpact', 'impact', 'Business / operational impact'], ['rpDone', 'completed_actions', 'Completed actions'], ['rpActive', 'active_actions', 'Active actions'], ['rpBlockers', 'blockers', 'Blockers'], ['rpDecisions', 'decisions_required', 'Decisions required'], ['rpRisk', 'current_risk', 'Current risk'], ['rpNext', 'next_steps', 'Next steps'], ['rpNextUpdate', 'next_update', 'Next update']];
  let ctx, built = false;

  const section = (root, title) => { const s = el('section', null, 'report-section'); s.append(el('h2', title)); root.append(s); return s; };
  const para = (s, label, value) => { const p = el('p'); p.append(el('b', label + ': '), document.createTextNode(String(value ?? '').trim() || 'Not recorded')); s.append(p); };
  const tbl = (s, h, r) => s.append(U.table(h, r, 'None recorded.'));

  function header(root, title) {
    const S = ctx.S; root.replaceChildren(el('h1', title), el('p', `Case ${S.case.case_number || S.case.id} · ${S.case.classification} · Generated ${new Date().toLocaleString()}`, 'muted'));
    const s = section(root, 'Case summary');
    for (const [l, k] of [['Title', 'title'], ['Status', 'status'], ['Severity', 'severity'], ['Priority', 'priority'], ['Owner', 'owner'], ['Incident start', 'incident_start'], ['Discovered', 'discovered'], ['Contained', 'contained'], ['Closed', 'closed'], ['Description', 'description']]) para(s, l, S.case[k]);
  }
  const fmtT = (v) => { const d = new Date(v); return v && !Number.isNaN(d.getTime()) ? d.toLocaleString() : (v || ''); };
  function detection(root) {
    const d = ctx.S.detection, c = ctx.S.categorization, s = section(root, 'Detection and categorization');
    para(s, 'Detection source', [d.source, d.source_detail].filter(Boolean).join(' — ')); para(s, 'Reported by', d.reported_by); para(s, 'Reported at', fmtT(d.reported_at)); para(s, 'First detected', fmtT(d.detected_at)); para(s, 'Initial description', d.description);
    para(s, 'Determination', c.determination); para(s, 'Declared', fmtT(c.declared_at)); para(s, 'Attack vector', c.attack_vector); para(s, 'Functional impact', c.functional_impact); para(s, 'Information impact', c.information_impact); para(s, 'Recoverability', c.recoverability); para(s, 'Rationale', c.rationale);
  }
  const metrics = (root) => tbl(section(root, 'Response metrics'), ['Measure', 'Value'], STSModel.metrics(ctx.S));
  const notifications = (root) => tbl(section(root, 'Notifications'), ['Notified at', 'Recipient', 'Type', 'Method', 'By', 'Obligation', 'Summary'], ctx.S.notifications.map((n) => [fmtT(n.notified_at), n.recipient, n.recipient_type, n.method, n.notified_by, (ctx.S.obligations.find((o) => o.id === n.obligation_ref) || {}).name || '', n.summary]));
  function lessons(root) {
    const l = ctx.S.lessons, s = section(root, 'Lessons learned');
    para(s, 'Review meeting', fmtT(l.review_date)); para(s, 'Participants', l.participants); para(s, 'Root cause', l.root_cause); para(s, 'Contributing factors', l.contributing_factors); para(s, 'What went well', l.went_well); para(s, 'What should be improved', l.to_improve);
    tbl(section(root, 'Improvement actions'), ['Improvement', 'Area', 'Owner', 'Due', 'Status'], l.improvements.map((x) => [x.item, x.area, x.owner, x.due_date, x.status]));
  }
  function phaseNotes(root) {
    const notes = ctx.S.notes || []; if (!notes.length) return;
    const s = section(root, 'Phase notes');
    for (const [tab, label, phase] of MD.TABS) {
      const list = notes.filter((n) => n.tab === tab).sort((a, b) => String(a.created).localeCompare(String(b.created)));
      if (!list.length) continue;
      s.append(el('h3', `${tab.slice(1)} ${label} (${phase})`));
      for (const n of list) s.append(MD.noteView(n));
    }
  }
  function evidenceNotes(root) {
    const list = ctx.S.evidence.filter((v) => v.kind === 'markdown-note'); if (!list.length) return;
    const s = section(root, 'Evidence notes (content)');
    for (const v of list) { s.append(MD.noteView({ title: `${v.title || v.filename} — ${v.filename}`, author: v.acquired_by, created: v.acquired_at, body: v.content })); s.append(el('p', 'SHA-256 ' + v.sha256, 'muted')); }
  }
  function retention(root) { const r = ctx.S.retention, s = section(root, 'Evidence retention'); para(s, 'Location', r.location); para(s, 'Custodian', r.custodian); para(s, 'Retention period', r.period); para(s, 'Legal hold', r.legal_hold); para(s, 'Disposal / review date', r.disposal_date); para(s, 'Notes', r.notes); }
  const conclusion = (root) => { const s = section(root, 'Conclusion'), c = ctx.S.conclusion || {}; para(s, 'Disposition', c.disposition); para(s, 'Confidence', c.confidence); para(s, 'Justification', c.narrative); };
  const findings = (root) => tbl(section(root, 'Findings'), ['Finding', 'Severity', 'Confidence', 'Status', 'Risk', 'Recommendation', 'Validation'], ctx.S.findings.map((x) => [x.title, x.severity, x.confidence, x.status, x.risk, x.recommendation, x.validation]));
  const actions = (root) => { for (const ph of ['Containment', 'Eradication', 'Recovery']) tbl(section(root, ph + ' actions'), ['Action', 'Priority', 'Status', 'Owner', 'Requested', 'Completed', 'Verification'], ctx.S.actions.filter((x) => x.phase === ph).map((x) => [x.action, x.priority, x.status, x.owner, fmtT(x.requested), fmtT(x.completed), x.verification])); const other = ctx.S.actions.filter((x) => !['Containment', 'Eradication', 'Recovery'].includes(x.phase)); if (other.length) tbl(section(root, 'Other actions'), ['Action', 'Status', 'Owner'], other.map((x) => [x.action, x.status, x.owner])); };
  const evidence = (root) => { tbl(section(root, 'Evidence manifest'), ['File', 'SHA-256', 'Size', 'Source', 'Acquired', 'By'], ctx.S.evidence.map((x) => [x.filename, x.sha256, x.size, x.source, x.acquired_at, x.acquired_by])); tbl(section(root, 'Chain of custody'), ['Evidence', 'Date/time', 'Action', 'Person', 'From', 'To', 'Purpose'], ctx.S.custody.map((x) => [ctx.evidenceName(x.evidence_id), x.timestamp, x.action, x.person, x.from, x.to, x.purpose])); };
  function sitrep(root, withHeader) {
    const r = ctx.S.sitreps[ctx.S.sitreps.length - 1];
    if (withHeader) header(root, 'Security Incident Situation Report');
    const s = section(root, r ? `SITREP as of ${new Date(r.created).toLocaleString()}` : 'SITREP');
    if (!r) { s.append(el('p', 'No SITREP snapshot has been saved (task 7.2).', 'muted')); return; }
    for (const [, k, l] of SIT) para(s, l, r[k]);
  }
  function technical(root) {
    const S = ctx.S; header(root, 'Technical Investigation Report'); detection(root);
    tbl(section(root, 'Entities'), ['Entity', 'Type', 'Description', 'Attributes'], S.entities.map((x) => [x.name, x.type, x.description, x.attributes.map((a) => `${a.type}: ${a.value}`).join('; ')]));
    tbl(section(root, 'Relationships'), ['Source', 'Relationship', 'Target'], S.relationships.map((r) => [ctx.entityName(r.source_ref), r.relationship_type, ctx.entityName(r.target_ref)]));
    evidence(root);
    tbl(section(root, 'Timeline (UTC)'), ['Time', 'Type', 'Source', 'Description'], [...S.events].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp))).map((x) => [x.timestamp, x.event_type, x.source, x.description]));
    const a = section(root, 'Analysis'); para(a, 'Question', S.extensions.analysis?.question);
    tbl(a, ['Hypothesis', 'Status', 'Confidence', 'Rationale'], S.hypotheses.map((h) => [h.title, h.status, h.confidence, h.rationale]));
    tbl(section(root, 'Information gaps'), ['Question', 'Priority', 'Status', 'Answer'], S.information_gaps.map((g) => [g.question, g.priority, g.status, g.answer]));
    findings(root); actions(root); notifications(root); conclusion(root); metrics(root); phaseNotes(root);
  }
  function build() {
    const root = $('rpOutput'), t = $('rpType').value, S = ctx.S;
    if (t === 'executive') {
      header(root, 'Executive Incident Report');
      para(section(root, 'Executive summary'), 'Summary', $('rpExec').value);
      { const c = S.categorization, s = section(root, 'Categorization'); para(s, 'Determination', c.determination); para(s, 'Functional impact', c.functional_impact); para(s, 'Information impact', c.information_impact); para(s, 'Recoverability', c.recoverability); }
      sitrep(root, false);
      tbl(section(root, 'Key findings'), ['Finding', 'Severity', 'Status', 'Recommendation'], S.findings.map((x) => [x.title, x.severity, x.status, x.recommendation]));
      actions(root); conclusion(root); metrics(root);
    } else if (t === 'technical') technical(root);
    else if (t === 'sitrep') sitrep(root, true);
    else if (t === 'evidence') { header(root, 'Evidence Manifest'); evidence(root); evidenceNotes(root); }
    else if (t === 'lessons') { header(root, 'Post-Incident Review'); conclusion(root); metrics(root); lessons(root); retention(root); notifications(root); }
    else if (t === 'findings') { header(root, 'Findings and Remediation Report'); findings(root); actions(root); tbl(section(root, 'Tasks'), ['Task', 'Priority', 'Status', 'Owner', 'Due'], S.tasks.map((x) => [x.title, x.priority, x.status, x.owner, x.due_date])); }
    else { technical(root); tbl(section(root, 'Decision log'), ['Time', 'Decision', 'Decision maker', 'Rationale'], S.decisions.map((d) => [d.timestamp, d.decision, d.decision_maker, d.rationale])); tbl(section(root, 'Tasks'), ['Task', 'Priority', 'Status', 'Owner', 'Due'], S.tasks.map((x) => [x.title, x.priority, x.status, x.owner, x.due_date])); sitrep(root, false); lessons(root); retention(root); evidenceNotes(root); }
    built = true;
  }

  IW.modules.push({
    name: 'Reporting',
    init(c) {
      ctx = c;
      $('rpSaveSit').addEventListener('click', () => {
        const r = { id: U.uid(), created: U.now() }; for (const [id, k] of SIT) r[k] = U.txt($(id).value);
        if (!SIT.some(([, k]) => r[k])) { ctx.status('The SITREP form is empty.', 'bad'); return; }
        ctx.S.sitreps.push(r); ctx.changed('SITREP snapshot saved. Earlier snapshots are kept in the case history.');
      });
      $('rpLoadSit').addEventListener('click', () => { const r = ctx.S.sitreps[ctx.S.sitreps.length - 1]; if (!r) { ctx.status('No SITREP saved yet.', 'bad'); return; } for (const [id, k] of SIT) $(id).value = r[k] || ''; });
      $('rpSaveConc').addEventListener('click', () => {
        const S = ctx.S; S.conclusion = { disposition: $('rpDisp').value, confidence: $('rpConf').value, narrative: U.txt($('rpNarr').value), updated: U.now() };
        let msg = 'Conclusion saved.';
        if ($('rpCloseCase').checked) { S.case.status = 'Closed'; if (!S.case.closed) S.case.closed = U.localNow(); $('rpCloseCase').checked = false; msg += ' Case closed.'; }
        else if (!['Closed', 'Post-incident review'].includes(S.case.status)) { S.case.status = 'Post-incident review'; msg += ' Status set to Post-incident review.'; }
        ctx.changed(msg);
      });
      $('rpPrintSit').addEventListener('click', () => { if (!ctx.S.sitreps.length) { ctx.status('Save a SITREP snapshot first.', 'bad'); return; } $('rpType').value = 'sitrep'; build(); document.body.classList.add('report-print'); window.print(); });
      $('rpBuild').addEventListener('click', () => { build(); ctx.status('Report built. Review it below, then print.', 'good'); });
      $('rpPrint').addEventListener('click', () => { if (!built) build(); document.body.classList.add('report-print'); window.print(); });
      window.addEventListener('afterprint', () => document.body.classList.remove('report-print'));
    },
    render() {
      const S = ctx.S, r = S.sitreps[S.sitreps.length - 1];
      $('rpSitState').textContent = r ? `${S.sitreps.length} snapshot(s) saved; latest ${new Date(r.created).toLocaleString()}.` : 'No SITREP snapshots saved yet.';
      const c = S.conclusion || {};
      if (c.disposition && document.activeElement !== $('rpNarr')) { $('rpDisp').value = c.disposition; $('rpConf').value = c.confidence || 'Moderate'; $('rpNarr').value = c.narrative || ''; }
    }
  });
})();
