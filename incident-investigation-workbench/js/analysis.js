'use strict';
/* Tab 5: analytical question, competing hypotheses, evidence matrix, information gaps, decisions. */
(function () {
  const { $, el, button } = U;
  const SHORT = { 'Strongly Supports': '++', Supports: '+', Neutral: '0', Contradicts: '−', 'Strongly Contradicts': '−−', Unknown: '?' };
  let ctx;
  function statusSelect(obj, key, values) { const s = el('select'); U.options(s, values.map((v) => [v, v]), obj[key]); s.addEventListener('change', () => { obj[key] = s.value; ctx.touch(); }); return s; }

  function render() {
    const S = ctx.S;
    if (document.activeElement !== $('aQuestion')) $('aQuestion').value = S.extensions.analysis?.question || '';
    for (const id of ['aMHyp', 'aGHyp', 'aDHyp']) U.options($(id), ctx.hypothesisOptions());
    for (const id of ['aMEvidence', 'aDEv']) U.options($(id), ctx.evidenceOptions());
    $('aHList').replaceChildren(U.table(['Hypothesis', 'Confidence', 'Status', 'Description', 'Rationale', ''], S.hypotheses.map((h) => [h.title, statusSelect(h, 'confidence', ['Low', 'Moderate', 'High']), statusSelect(h, 'status', ['Active', 'Rejected', 'Accepted']), h.description, h.rationale,
      button('Remove', 'danger small', () => { if (confirm('Remove this hypothesis and its assessments?')) { S.hypotheses.splice(S.hypotheses.indexOf(h), 1); ctx.changed('Hypothesis removed.'); } })])));
    /* Matrix: rows = evidence assessed, columns = hypotheses. */
    const evIds = [...new Set(S.hypotheses.flatMap((h) => (h.assessments || []).map((a) => a.evidence_ref)))];
    $('aMatrix').replaceChildren(U.table(['Evidence', ...S.hypotheses.map((h) => h.title)], evIds.map((ev) => [ctx.evidenceName(ev), ...S.hypotheses.map((h) => (h.assessments || []).filter((a) => a.evidence_ref === ev).map((a) => SHORT[a.assessment] || a.assessment).join(' / '))]), 'No assessments yet. ++ strongly supports, + supports, 0 neutral, − contradicts, −− strongly contradicts, ? unknown.'));
    const rows = []; S.hypotheses.forEach((h) => (h.assessments || []).forEach((a) => rows.push([h.title, ctx.evidenceName(a.evidence_ref), a.assessment, a.source_reliability, a.evidence_quality, a.relevance, a.reasoning])));
    $('aMList').replaceChildren(U.table(['Hypothesis', 'Evidence', 'Assessment', 'Reliability', 'Quality', 'Relevance', 'Reasoning'], rows));
    $('aGList').replaceChildren(U.table(['Question', 'Priority', 'Hypothesis', 'Source', 'Owner', 'Status', 'Answer'], S.information_gaps.map((g) => {
      const ans = el('textarea', null, 'compact'); ans.value = g.answer || ''; ans.addEventListener('input', () => { g.answer = ans.value; ctx.touch(); });
      return [g.question, g.priority, (S.hypotheses.find((h) => h.id === g.hypothesis_ref) || {}).title || '', g.required_source, g.owner, statusSelect(g, 'status', ['Open', 'In Progress', 'Answered', 'Unable to Answer']), ans];
    })));
    $('aDList').replaceChildren(U.table(['Time', 'Phase', 'Decision', 'Decision maker', 'Hypothesis', 'Evidence', 'Rationale', 'Alternatives', 'Consequences'], S.decisions.map((d) => [new Date(d.timestamp).toLocaleString(), d.phase || '', d.decision, d.decision_maker, (S.hypotheses.find((h) => h.id === (d.hypothesis_refs || [])[0]) || {}).title || '', (d.evidence_refs || []).map(ctx.evidenceName).join(', '), d.rationale, d.alternatives, d.consequences])));
  }

  IW.modules.push({
    name: 'Analysis',
    init(c) {
      ctx = c;
      $('aQuestion').addEventListener('input', () => { ctx.S.extensions.analysis = ctx.S.extensions.analysis || {}; ctx.S.extensions.analysis.question = $('aQuestion').value; ctx.touch(); });
      $('aHAdd').addEventListener('click', () => {
        const title = U.txt($('aHTitle').value); if (!title) { ctx.status('Enter the hypothesis.', 'bad'); return; }
        ctx.S.hypotheses.push({ id: U.uid(), title, description: U.txt($('aHDesc').value), status: 'Active', confidence: $('aHConf').value, rationale: U.txt($('aHRat').value), created: U.now(), assessments: [] });
        U.clear('aHTitle', 'aHDesc', 'aHRat'); ctx.changed('Hypothesis added.');
      });
      $('aMAdd').addEventListener('click', () => {
        const h = ctx.S.hypotheses.find((x) => x.id === $('aMHyp').value), ev = $('aMEvidence').value;
        if (!h || !ev) { ctx.status('Choose a hypothesis and an evidence item (register evidence in 2.2).', 'bad'); return; }
        h.assessments = (h.assessments || []).filter((a) => a.evidence_ref !== ev);
        h.assessments.push({ id: U.uid(), evidence_ref: ev, assessment: $('aMAssess').value, source_reliability: $('aMRel').value, evidence_quality: $('aMQual').value, relevance: $('aMRelev').value, reasoning: U.txt($('aMReason').value), created: U.now() });
        U.clear('aMReason'); ctx.changed('Assessment recorded (replaces any earlier assessment of the same evidence for this hypothesis).');
      });
      $('aGAdd').addEventListener('click', () => {
        const q = U.txt($('aGQ').value); if (!q) { ctx.status('Enter the question.', 'bad'); return; }
        ctx.S.information_gaps.push({ id: U.uid(), question: q, priority: $('aGPri').value, hypothesis_ref: $('aGHyp').value, required_source: U.txt($('aGSrc').value), owner: U.txt($('aGOwner').value), status: $('aGStatus').value, answer: U.txt($('aGAns').value), evidence_refs: [], created: U.now() });
        U.clear('aGQ', 'aGSrc', 'aGAns'); ctx.changed('Information gap added.');
      });
      $('aDAdd').addEventListener('click', () => {
        const d = U.txt($('aDText').value); if (!d) { ctx.status('Enter the decision.', 'bad'); return; }
        ctx.S.decisions.push({ id: U.uid(), timestamp: U.now(), phase: $('aDPhase').value, decision: d, decision_maker: U.txt($('aDMaker').value), evidence_refs: [$('aDEv').value].filter(Boolean), alternatives: U.txt($('aDAlt').value), rationale: U.txt($('aDRat').value), consequences: U.txt($('aDCon').value), hypothesis_refs: [$('aDHyp').value].filter(Boolean) });
        U.clear('aDText', 'aDRat', 'aDAlt', 'aDCon'); ctx.changed('Decision recorded.');
      });
    },
    render
  });
})();
