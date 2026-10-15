'use strict';
/* NIST lifecycle records: initial report (2.1), categorization & declaration (4.5),
   notifications & obligations (7.1), lessons learned & metrics (8.2), evidence retention (8.3). */
(function () {
  const { $, el, button } = U;
  let ctx, refresh = [];
  const S = () => ctx.S;

  function suggestSeverity(c) {
    const f = c.functional_impact || '', i = c.information_impact || '', r = c.recoverability || '';
    if (f.startsWith('High') || r.startsWith('Not') || (i.startsWith('Privacy') && r.startsWith('Extended'))) return 'Critical';
    if (f.startsWith('Medium') || i.startsWith('Privacy') || i.startsWith('Proprietary') || r.startsWith('Extended')) return 'High';
    if (f.startsWith('Low') || i.startsWith('Integrity') || r.startsWith('Supplemented')) return 'Medium';
    return (f || i || r) ? 'Low' : '';
  }

  function renderCategorization() {
    const c = S().categorization, sug = suggestSeverity(c);
    $('gHint').textContent = (sug ? `Suggested severity from the impact categories: ${sug}. ` : '') + (c.determination === 'Incident declared' ? `Declared ${c.declared_at ? new Date(c.declared_at).toLocaleString() : ''}. Next: tab 5 Contain.` : c.determination.startsWith('Event') ? 'Recorded as an event. Record the conclusion in 8.1 and close the case.' : 'Keep assessing until you can declare or dismiss.');
  }

  function renderNotifications() {
    const s = S();
    $('nContacts').replaceChildren(...s.contacts.map((x) => { const o = el('option'); o.value = x.name; o.textContent = `${x.role}${x.organization ? ' — ' + x.organization : ''}`; return o; }));
    U.options($('nObligation'), [['', '— none —'], ...s.obligations.map((o) => [o.id, o.name])]);
    $('nObList').replaceChildren(U.table(['Obligation', 'Applies?', 'Deadline', 'Notification sent', 'State'], s.obligations.map((o) => {
      const due = IWDeadline(s.case.discovered, o.deadline_hours), sent = s.notifications.filter((n) => n.obligation_ref === o.id).map((n) => n.notified_at).sort()[0];
      let state = 'Pending';
      if (o.applies === 'No') state = 'Not applicable';
      else if (sent) state = due && new Date(sent) > due ? 'Met late' : 'Met';
      else if (due && Date.now() > due.getTime()) state = 'OVERDUE';
      else if (!s.case.discovered && o.deadline_hours) state = 'Pending — set Discovered time (1.1) to calculate deadline';
      return [o.name, o.applies, due ? due.toLocaleString() : (o.deadline_hours ? `${o.deadline_hours} h after discovery` : 'None'), sent ? new Date(sent).toLocaleString() : '', state];
    }), 'No obligations recorded (add them in 1.3).'));
    $('nList').replaceChildren(U.table(['Notified at', 'Recipient', 'Type', 'Method', 'By', 'Obligation', 'What was communicated', ''], [...s.notifications].sort((a, b) => String(a.notified_at).localeCompare(String(b.notified_at))).map((n) => [
      n.notified_at ? new Date(n.notified_at).toLocaleString() : '', n.recipient, n.recipient_type, n.method, n.notified_by, (s.obligations.find((o) => o.id === n.obligation_ref) || {}).name || '', n.summary,
      button('Remove', 'danger small', () => { s.notifications.splice(s.notifications.indexOf(n), 1); ctx.changed('Notification removed.'); })])));
  }

  function renderLessons() {
    $('lMetrics').replaceChildren(U.table(['Measure', 'Value'], STSModel.metrics(S())));
    $('liList').replaceChildren(U.table(['Improvement', 'Area', 'Owner', 'Due', 'Status', 'Notes'], S().lessons.improvements.map((x) => [x.item, x.area, x.owner, x.due_date, U.statusSelect(ctx, x, 'status', ['Open', 'In Progress', 'Done', 'Deferred']), U.noteField(ctx, x, 'notes')]), 'No improvement actions yet.'));
  }

  IW.modules.push({
    name: 'Lifecycle',
    init(c) {
      ctx = c;
      const det = () => S().detection, cat = () => S().categorization, les = () => S().lessons, ret = () => S().retention, cs = () => S().case;
      refresh = [
        ['drSource', det, 'source'], ['drSourceDetail', det, 'source_detail'], ['drBy', det, 'reported_by'], ['drAt', det, 'reported_at'], ['drDetected', det, 'detected_at'], ['drDesc', det, 'description'],
        ['gDeclared', cat, 'declared_at'], ['gVector', cat, 'attack_vector'], ['gFunctional', cat, 'functional_impact'], ['gInformation', cat, 'information_impact'], ['gRecover', cat, 'recoverability'], ['gRationale', cat, 'rationale'],
        ['gSeverity', cs, 'severity'], ['gPriority', cs, 'priority'],
        ['lDate', les, 'review_date'], ['lParticipants', les, 'participants'], ['lRoot', les, 'root_cause'], ['lFactors', les, 'contributing_factors'], ['lWell', les, 'went_well'], ['lImprove', les, 'to_improve'],
        ['reLocation', ret, 'location'], ['reCustodian', ret, 'custodian'], ['rePeriod', ret, 'period'], ['reHold', ret, 'legal_hold'], ['reDispose', ret, 'disposal_date'], ['reNotes', ret, 'notes']
      ].map(([id, o, k]) => U.bindField(ctx, id, o, k));
      for (const id of ['gFunctional', 'gInformation', 'gRecover', 'gSeverity']) $(id).addEventListener('change', () => { renderCategorization(); ctx.changed(); });

      $('drUseDiscovered').addEventListener('click', () => {
        if (!det().detected_at) { ctx.status('Enter "First detected at" first.', 'bad'); return; }
        cs().discovered = det().detected_at; ctx.changed('Case Discovered time set from the initial report.');
      });
      $('gDetermination').addEventListener('change', () => {
        const v = $('gDetermination').value, k = cat(); k.determination = v;
        if (v === 'Incident declared') {
          if (!k.declared_at) k.declared_at = U.localNow();
          if (!cs().discovered) cs().discovered = det().detected_at || k.declared_at;
          if (['Reported', 'Triage'].includes(cs().status)) cs().status = 'Analysis';
          ctx.changed('Incident declared. Discovered time and status updated where they were empty or earlier.');
        } else if (v.startsWith('Event')) ctx.changed('Recorded as an event (not an incident).');
        else ctx.changed();
      });
      $('nAdd').addEventListener('click', () => {
        const to = U.txt($('nTo').value); if (!to) { ctx.status('Enter or choose the recipient.', 'bad'); return; }
        S().notifications.push({ id: U.uid(), recipient: to, recipient_type: $('nType').value, method: U.txt($('nMethod').value), notified_at: $('nAt').value || U.localNow(), notified_by: U.txt($('nBy').value), obligation_ref: $('nObligation').value, summary: U.txt($('nSummary').value) });
        U.clear('nTo', 'nMethod', 'nSummary', 'nAt'); ctx.changed('Notification logged.');
      });
      $('liAdd').addEventListener('click', () => {
        const item = U.txt($('liItem').value); if (!item) { ctx.status('Describe the improvement.', 'bad'); return; }
        les().improvements.push({ id: U.uid(), item, area: $('liArea').value, owner: U.txt($('liOwner').value), due_date: $('liDue').value, status: 'Open', notes: '' });
        U.clear('liItem', 'liOwner', 'liDue'); ctx.changed('Improvement action added.');
      });
    },
    render() {
      refresh.forEach((f) => f());
      if (document.activeElement !== $('gDetermination')) $('gDetermination').value = S().categorization.determination || 'Under assessment';
      renderCategorization(); renderNotifications(); renderLessons();
    },
    suggestSeverity
  });
})();
