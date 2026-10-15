'use strict';
/* Tabs 5-6 (Containment, Eradication & Recovery): findings, tasks, phase-specific actions, status tracking. */
(function () {
  const { $, el } = U;
  const F_STATUS = ['Open', 'Investigating', 'Remediation Planned', 'Remediating', 'Validation', 'Closed', 'Accepted'];
  const T_STATUS = ['Open', 'In Progress', 'Blocked', 'Completed'];
  const A_STATUS = ['Requested', 'Planned', 'In Progress', 'Blocked', 'Completed', 'Cancelled'];
  const ORDER = ['Reported', 'Triage', 'Analysis', 'Containment', 'Eradication', 'Recovery', 'Post-incident review', 'Closed'];
  const FORMS = [
    { box: 'actContain', p: 'ac', phase: 'Containment', example: 'e.g. Isolate WS-0123 from the network', verify: false },
    { box: 'actErad', p: 'ae', phase: 'Eradication', example: 'e.g. Remove scheduled-task persistence; reset all credentials used on host', verify: false },
    { box: 'actRecover', p: 'ar', phase: 'Recovery', example: 'e.g. Reimage WS-0123 and return to user', verify: true }
  ];
  let ctx;
  const findingTitle = (id) => (ctx.S.findings.find((f) => f.id === id) || {}).title || '';

  /* Move the case status forward (never backward) when work starts in a later phase. */
  function advance(to) {
    const c = ctx.S.case, i = ORDER.indexOf(c.status), j = ORDER.indexOf(to);
    if (c.status !== 'Reopened' && j > i && i >= 0 && c.status !== 'Closed') { c.status = to; return ` Case status moved to ${to}.`; }
    return '';
  }

  function buildForm(f) {
    const box = $(f.box), g = el('div', null, 'edit'), fields = {};
    const add = (key, label, node, wide) => { const l = el('label', label); l.append(node); if (wide) l.classList.add('wide'); g.append(l); node.id = f.p + key; fields[key] = node; };
    const inp = (type, ph) => { const i = el('input'); if (type) i.type = type; if (ph) i.placeholder = ph; return i; };
    add('Action', 'Action', inp('', f.example));
    add('Owner', 'Owner', inp());
    const pri = el('select'); U.options(pri, ['Low', 'Normal', 'High', 'Critical'].map((x) => [x, x]), 'Normal'); add('Pri', 'Priority', pri);
    add('Req', 'Requested', inp('datetime-local'));
    add('Finding', 'Related finding', el('select'));
    add('Entity', 'Affected entity', el('select'));
    add('Notes', 'Notes', el('textarea'), true);
    if (f.verify) add('Verify', 'How will success be verified?', el('textarea'), true);
    const btn = U.button(`Add ${f.phase.toLowerCase()} action`, 'primary', () => {
      const action = U.txt(fields.Action.value); if (!action) { ctx.status('Describe the action.', 'bad'); return; }
      ctx.S.actions.push({ id: U.uid(), phase: f.phase, action, status: 'Requested', priority: fields.Pri.value, owner: U.txt(fields.Owner.value), requested: fields.Req.value || U.localNow(), started: '', completed: '', finding_refs: [fields.Finding.value].filter(Boolean), entity_refs: [fields.Entity.value].filter(Boolean), notes: U.txt(fields.Notes.value), verification: f.verify ? U.txt(fields.Verify.value) : '', created: U.now(), modified: U.now() });
      fields.Action.value = ''; fields.Notes.value = ''; if (fields.Verify) fields.Verify.value = '';
      ctx.changed(`${f.phase} action added.` + advance(f.phase));
    });
    btn.id = f.p + 'Add';
    const list = el('div', null, 'scroll'); list.id = f.p + 'List';
    box.replaceChildren(g, btn, list);
    f.fields = fields;
  }

  function onActionStatus(a) {
    const c = ctx.S.case;
    if (a.status === 'In Progress' && !a.started) a.started = U.localNow();
    if (a.status === 'Completed' && !a.completed) a.completed = U.localNow();
    if (a.phase === 'Containment' && a.status === 'Completed' && !c.contained) { c.contained = a.completed; ctx.status('Containment action completed; case Contained time recorded (edit in 1.1 if needed).', 'good'); }
  }
  const actionRow = (a, withPhase) => [...(withPhase ? [a.phase || 'Unassigned'] : []), a.action, a.priority, a.owner, a.requested, a.started, a.completed, findingTitle((a.finding_refs || [])[0]), U.statusSelect(ctx, a, 'status', A_STATUS, onActionStatus), U.noteField(ctx, a, 'verification'), U.noteField(ctx, a, 'notes')];
  const ACTION_HEAD = ['Action', 'Priority', 'Owner', 'Requested', 'Started', 'Completed', 'Finding', 'Status', 'Verification', 'Notes'];

  function render() {
    const S = ctx.S, eo = ctx.entityOptions(), fo = ctx.findingOptions();
    for (const id of ['fEntity', 'kTEntity']) U.options($(id), eo);
    U.options($('fEvidence'), ctx.evidenceOptions()); U.options($('kTFinding'), fo);
    for (const f of FORMS) {
      U.options(f.fields.Finding, fo); U.options(f.fields.Entity, eo);
      $(f.p + 'List').replaceChildren(U.table(ACTION_HEAD, S.actions.filter((a) => a.phase === f.phase).map((a) => actionRow(a, false)), `No ${f.phase.toLowerCase()} actions yet.`));
    }
    const openF = S.findings.filter((x) => !['Closed', 'Accepted'].includes(x.status)).length, openT = S.tasks.filter((x) => x.status !== 'Completed').length;
    const act = (p) => S.actions.filter((x) => x.phase === p && !['Completed', 'Cancelled'].includes(x.status)).length;
    $('oSummary').textContent = `${openF} open finding(s) · ${openT} incomplete task(s) · active actions: ${act('Containment')} containment, ${act('Eradication')} eradication, ${act('Recovery')} recovery`;
    $('fList').replaceChildren(U.table(['Finding', 'Severity', 'Owner', 'Due', 'Status', 'Recommendation', 'Validation notes', 'Closure notes'], S.findings.map((f) => [f.title, f.severity, f.owner, f.due_date, U.statusSelect(ctx, f, 'status', F_STATUS), f.recommendation, U.noteField(ctx, f, 'validation'), U.noteField(ctx, f, 'closure_notes')])));
    const order = { Containment: 0, Eradication: 1, Recovery: 2 };
    $('oList').replaceChildren(U.table(['Phase', ...ACTION_HEAD], [...S.actions].sort((a, b) => (order[a.phase] ?? 3) - (order[b.phase] ?? 3)).map((a) => actionRow(a, true))));
    $('kTList').replaceChildren(U.table(['Task', 'Priority', 'Owner', 'Due', 'Finding', 'Status', 'Completion notes'], S.tasks.map((t) => [t.title, t.priority, t.owner, t.due_date, findingTitle(t.finding_ref), U.statusSelect(ctx, t, 'status', T_STATUS), U.noteField(ctx, t, 'completion_notes')])));
  }

  IW.modules.push({
    name: 'Response',
    init(c) {
      ctx = c; FORMS.forEach(buildForm);
      $('fAdd').addEventListener('click', () => {
        const title = U.txt($('fTitle').value); if (!title) { ctx.status('Enter a finding title.', 'bad'); return; }
        ctx.S.findings.push({ id: U.uid(), title, description: U.txt($('fDesc').value), category: U.txt($('fCat').value), severity: $('fSev').value, confidence: $('fConf').value, likelihood: $('fLike').value, entity_refs: [$('fEntity').value].filter(Boolean), evidence_refs: [$('fEvidence').value].filter(Boolean), risk: U.txt($('fRisk').value), impact: U.txt($('fImpact').value), recommendation: U.txt($('fRec').value), status: 'Open', owner: U.txt($('fOwner').value), due_date: $('fDue').value, validation: '', closure_notes: '', created: U.now(), modified: U.now() });
        U.clear('fTitle', 'fDesc', 'fRisk', 'fImpact', 'fRec'); ctx.changed('Finding added. Track it in 6.3.');
      });
      $('kTAdd').addEventListener('click', () => {
        const title = U.txt($('kTTitle').value); if (!title) { ctx.status('Enter a task.', 'bad'); return; }
        ctx.S.tasks.push({ id: U.uid(), title, description: U.txt($('kTDesc').value), owner: U.txt($('kTOwner').value), priority: $('kTPri').value, status: 'Open', due_date: $('kTDue').value, finding_ref: $('kTFinding').value, entity_ref: $('kTEntity').value, evidence_ref: '', completion_notes: '', created: U.now(), modified: U.now() });
        U.clear('kTTitle', 'kTDesc'); ctx.changed('Task added. Track it in 6.3.');
      });
    },
    render
  });
})();
