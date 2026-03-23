
(() => {
  'use strict';

  const STORAGE_KEY = 'cti-analysis-assistant-v2';
  const stepEls = Array.from(document.querySelectorAll('.step'));
  const stepListItems = Array.from(document.querySelectorAll('#stepList li'));
  let currentStep = 0;

  const state = {
    case: {
      case_id: '', analyst_name: '', datetime: '', org_unit: '',
      source_name: '', source_type: '', collection_method: '', track_record: '',
      intelligence_type: '', scope: '', affected_assets: '', indicators: '', ttps: '', assumptions_gaps: ''
    },
    source: { answers: {}, recommended: '', final: '', explanation: '', trace: [], overrideEnabled: false, overrideValue: '', overrideReason: '' },
    credibility: { answers: {}, recommended: '', final: '', explanation: '', trace: [], overrideEnabled: false, overrideValue: '', overrideReason: '' },
    tlp: { answers: {}, recommended: '', final: '', explanation: '', trace: [], caveats: '', overrideEnabled: false, overrideValue: '', overrideReason: '' },
    product: { answers: {}, recommended: '', final: '', explanation: '', trace: [], overrideEnabled: false, overrideValue: '', overrideReason: '' },
    scores: { reliability: 0, credibility: 0, confidence: 0 },
    output: { admiralty_rating: '', tlp: '', confidence: '', recommended_tags: [], recommended_metadata: {}, narrative_summary: '', next_actions: [], report_text: '' }
  };

  const caseFieldIds = ['case_id','analyst_name','datetime','org_unit','source_name','source_type','collection_method','track_record','intelligence_type','scope','affected_assets','indicators','ttps','assumptions_gaps'];
  const reliabilityFields = ['rel_track_record','rel_authenticity','rel_competence','rel_bias','rel_proximity','rel_transparency'];
  const credibilityFields = ['cred_corroboration','cred_logic','cred_context','cred_evidence','cred_repro'];
  const confidenceFields = ['conf_source_count','conf_variety','conf_agreement','conf_gaps','conf_timeliness'];
  const tlpFields = ['tlp_audience','tlp_harm','tlp_external'];

  const reliabilityMap = [
    { min: 19, label: 'A', text: 'Completely reliable based on strong verification, track record, and direct access.' },
    { min: 15, label: 'B', text: 'Usually reliable with minor limitations.' },
    { min: 10, label: 'C', text: 'Fairly reliable but with notable uncertainty.' },
    { min: 6, label: 'D', text: 'Not usually reliable; caution warranted.' },
    { min: 1, label: 'E', text: 'Unreliable based on weak support or strong concerns.' },
    { min: 0, label: 'F', text: 'Reliability cannot be judged from available information.' }
  ];
  const credibilityMap = [
    { min: 15, label: '1', text: 'Confirmed by independent sources or direct validation.' },
    { min: 11, label: '2', text: 'Probably true based on strong support.' },
    { min: 7, label: '3', text: 'Possibly true but not yet well confirmed.' },
    { min: 4, label: '4', text: 'Doubtful due to limited support or contradictions.' },
    { min: 1, label: '5', text: 'Improbable given current evidence.' },
    { min: 0, label: '6', text: 'Truth cannot be judged from available information.' }
  ];
  const confidenceMap = [
    { min: 14, label: 'High', text: 'High confidence: evidence is strong and mostly consistent, but not certain.' },
    { min: 8, label: 'Moderate', text: 'Moderate confidence: evidence is credible but incomplete, mixed, or limited.' },
    { min: 0, label: 'Low', text: 'Low confidence: limited, conflicting, or weak evidence.' }
  ];

  function byId(id) { return document.getElementById(id); }

  function sanitizeText(value, maxLen) {
    const cleaned = String(value || '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.slice(0, maxLen || 600);
  }

  function safeNumber(value) {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function mapScore(score, rules) {
    for (const rule of rules) {
      if (score >= rule.min) return rule;
    }
    return rules[rules.length - 1];
  }

  function setDefaultDateTime() {
    const dt = byId('datetime');
    if (!dt.value) {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      dt.value = new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16);
    }
  }

  function gatherState() {
    caseFieldIds.forEach((id) => {
      const el = byId(id);
      state.case[id] = sanitizeText(el.value, el.maxLength || 600);
    });
    state.tlp.caveats = sanitizeText(byId('tlp_caveats').value, 300);

    reliabilityFields.forEach((id) => { state.source.answers[id] = safeNumber(byId(id).value); });
    credibilityFields.forEach((id) => { state.credibility.answers[id] = safeNumber(byId(id).value); });
    confidenceFields.forEach((id) => { state.product.answers[id] = safeNumber(byId(id).value); });
    tlpFields.forEach((id) => { state.tlp.answers[id] = safeNumber(byId(id).value); });

    state.source.overrideEnabled = byId('reliability_override_enabled').checked;
    state.source.overrideValue = sanitizeText(byId('reliability_override_value').value, 5);
    state.source.overrideReason = sanitizeText(byId('reliability_override_reason').value, 300);

    state.credibility.overrideEnabled = byId('credibility_override_enabled').checked;
    state.credibility.overrideValue = sanitizeText(byId('credibility_override_value').value, 5);
    state.credibility.overrideReason = sanitizeText(byId('credibility_override_reason').value, 300);

    state.tlp.overrideEnabled = byId('tlp_override_enabled').checked;
    state.tlp.overrideValue = sanitizeText(byId('tlp_override_value').value, 20);
    state.tlp.overrideReason = sanitizeText(byId('tlp_override_reason').value, 300);

    state.product.overrideEnabled = byId('confidence_override_enabled').checked;
    state.product.overrideValue = sanitizeText(byId('confidence_override_value').value, 20);
    state.product.overrideReason = sanitizeText(byId('confidence_override_reason').value, 300);
  }

  function traceFromScale(value, label, texts) {
    if (value === null || value === undefined) return '';
    const idx = Math.max(0, Math.min(texts.length - 1, Number(value)));
    return label + ': ' + texts[idx] + '.';
  }

  function buildList(elId, items) {
    const el = byId(elId);
    while (el.firstChild) el.removeChild(el.firstChild);
    items.filter(Boolean).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      el.appendChild(li);
    });
  }

  function renderRecommendation(resultId, explanationId, traceId, finalValue, explanation, trace, overrideEnabled, overrideReason) {
    byId(resultId).textContent = finalValue || '—';
    let text = explanation || 'Complete the questions to see the recommendation.';
    if (overrideEnabled && overrideReason) text += ' Override justification: ' + overrideReason;
    byId(explanationId).textContent = text;
    buildList(traceId, trace.concat(overrideEnabled ? ['Analyst override applied.' + (overrideReason ? ' Reason: ' + overrideReason : '')] : []));
  }

  function computeReliability() {
    const a = state.source.answers;
    const values = Object.values(a).filter((v) => v !== null);
    const score = values.reduce((sum, v) => sum + v, 0);
    state.scores.reliability = score;
    const mapped = values.length ? mapScore(score, reliabilityMap) : reliabilityMap[reliabilityMap.length - 1];
    state.source.recommended = mapped.label;
    state.source.final = state.source.overrideEnabled && state.source.overrideValue ? state.source.overrideValue : mapped.label;
    state.source.explanation = mapped.text;
    state.source.trace = [
      traceFromScale(a.rel_track_record, 'Track record', ['unknown', 'poor', 'mixed or limited', 'generally accurate', 'consistently accurate']),
      traceFromScale(a.rel_authenticity, 'Authenticity', ['unknown', 'weak verification', 'partial verification', 'mostly verified', 'strongly verified']),
      traceFromScale(a.rel_competence, 'Competence', ['unknown/poor expertise', 'limited expertise', 'adequate expertise', 'strong expertise']),
      traceFromScale(a.rel_bias, 'Bias / intent', ['unknown/likely deceptive', 'strong bias', 'some possible bias', 'no obvious deceptive motive']),
      traceFromScale(a.rel_proximity, 'Proximity', ['unknown', 'multiple steps removed', 'one step removed', 'firsthand / primary telemetry']),
      traceFromScale(a.rel_transparency, 'Transparency', ['opaque', 'minimal support', 'some evidence detail', 'clear evidence and method detail'])
    ].filter(Boolean);
    renderRecommendation('reliabilityResult', 'reliabilityExplanation', 'reliabilityTrace', state.source.final, state.source.explanation, state.source.trace, state.source.overrideEnabled, state.source.overrideReason);
  }

  function computeCredibility() {
    const a = state.credibility.answers;
    const values = Object.values(a).filter((v) => v !== null);
    const score = values.reduce((sum, v) => sum + v, 0);
    state.scores.credibility = score;
    const mapped = values.length ? mapScore(score, credibilityMap) : credibilityMap[credibilityMap.length - 1];
    state.credibility.recommended = mapped.label;
    state.credibility.final = state.credibility.overrideEnabled && state.credibility.overrideValue ? state.credibility.overrideValue : mapped.label;
    state.credibility.explanation = mapped.text;
    state.credibility.trace = [
      traceFromScale(a.cred_corroboration, 'Corroboration', ['conflicting or unknown', 'no corroboration', 'indirect support', 'one strong confirmation', 'multiple independent confirmations']),
      traceFromScale(a.cred_logic, 'Internal logic', ['major contradictions', 'some inconsistencies', 'mostly consistent', 'highly consistent']),
      traceFromScale(a.cred_context, 'Known context', ['strongly inconsistent', 'some mismatch', 'generally aligns', 'strongly aligns']),
      traceFromScale(a.cred_evidence, 'Evidence quality', ['no evidence', 'rumor or repost', 'narrative only', 'screenshots/artifacts', 'direct technical evidence']),
      traceFromScale(a.cred_repro, 'Reproducibility', ['cannot validate', 'validation difficult', 'validation possible', 'another analyst can validate'])
    ].filter(Boolean);
    renderRecommendation('credibilityResult', 'credibilityExplanation', 'credibilityTrace', state.credibility.final, state.credibility.explanation, state.credibility.trace, state.credibility.overrideEnabled, state.credibility.overrideReason);
  }

  function audienceText(v) { return ['Public release', 'Trusted community', 'Limited partners / need-to-know', 'Single recipient organization', 'Named participants only'][v] || 'Unknown'; }
  function harmText(v) { return ['Minimal', 'Moderate', 'High', 'Severe / operationally sensitive'][v] || 'Unknown'; }
  function externalText(v) { return ['Public release acceptable', 'Community sharing only', 'Limited sharing as needed to act', 'No; organization only', 'No; named participants only'][v] || 'Unknown'; }

  function computeTlp() {
    const a = state.tlp.answers;
    let recommended = '—';
    const trace = [];

    if ([a.tlp_audience, a.tlp_harm, a.tlp_external].every((v) => v !== null)) {
      if (a.tlp_audience === 4 || a.tlp_external === 4 || a.tlp_harm === 3) {
        recommended = 'TLP:RED';
        trace.push('Named participants only or severe operational sensitivity points to TLP:RED.');
      } else if (a.tlp_audience === 3 || a.tlp_external === 3) {
        recommended = 'TLP:AMBER+STRICT';
        trace.push('Sharing limited to a single recipient organization fits TLP:AMBER+STRICT.');
      } else if (a.tlp_audience === 2 || a.tlp_external === 2 || a.tlp_harm === 2) {
        recommended = 'TLP:AMBER';
        trace.push('Need-to-know sharing and higher harm align with TLP:AMBER.');
      } else if (a.tlp_audience === 1 || a.tlp_external === 1 || a.tlp_harm === 1) {
        recommended = 'TLP:GREEN';
        trace.push('Trusted community sharing without public release aligns with TLP:GREEN.');
      } else {
        recommended = 'TLP:CLEAR';
        trace.push('Minimal harm and public release suitability align with TLP:CLEAR.');
      }
    }

    if (a.tlp_audience !== null) trace.push('Audience scope selected: ' + audienceText(a.tlp_audience) + '.');
    if (a.tlp_harm !== null) trace.push('Potential harm selected: ' + harmText(a.tlp_harm) + '.');
    if (a.tlp_external !== null) trace.push('External sharing selected: ' + externalText(a.tlp_external) + '.');
    if (state.tlp.caveats) trace.push('Caveats entered: ' + state.tlp.caveats + '.');

    state.tlp.recommended = recommended;
    state.tlp.final = state.tlp.overrideEnabled && state.tlp.overrideValue ? state.tlp.overrideValue : recommended;
    state.tlp.explanation = recommended === '—' ? 'Complete the questions to see the recommendation.' : 'TLP recommendation based on intended audience, harm, and downstream sharing permissions.';
    state.tlp.trace = trace;
    renderRecommendation('tlpResult', 'tlpExplanation', 'tlpTrace', state.tlp.final, state.tlp.explanation, state.tlp.trace, state.tlp.overrideEnabled, state.tlp.overrideReason);
  }

  function reliabilityBonus(label) {
    return ({ A: 3, B: 2, C: 1, D: 0, E: -1, F: 0 })[label] ?? 0;
  }
  function credibilityBonus(label) {
    return ({ '1': 3, '2': 2, '3': 1, '4': 0, '5': -1, '6': 0 })[label] ?? 0;
  }

  function computeConfidence() {
    const a = state.product.answers;
    const values = Object.values(a).filter((v) => v !== null);
    let score = values.reduce((sum, v) => sum + v, 0);
    const relBonus = reliabilityBonus(state.source.final || state.source.recommended);
    const credBonus = credibilityBonus(state.credibility.final || state.credibility.recommended);
    score += relBonus + credBonus;
    state.scores.confidence = score;
    const mapped = values.length ? mapScore(score, confidenceMap) : confidenceMap[2];
    state.product.recommended = mapped.label;
    state.product.final = state.product.overrideEnabled && state.product.overrideValue ? state.product.overrideValue : mapped.label;
    state.product.explanation = mapped.text;
    state.product.trace = [
      traceFromScale(a.conf_source_count, 'Source count', ['unknown', '1 source', '2 sources', '3 sources', '4+ sources']),
      traceFromScale(a.conf_variety, 'Source variety', ['unknown', 'single collection type', 'some variety', 'multiple distinct collection types']),
      traceFromScale(a.conf_agreement, 'Agreement among sources', ['major conflicts', 'some conflict', 'mostly agrees', 'strong agreement']),
      traceFromScale(a.conf_gaps, 'Documented gaps', ['not documented', 'partially documented', 'clearly documented']),
      traceFromScale(a.conf_timeliness, 'Timeliness / completeness', ['stale or incomplete', 'somewhat stale/incomplete', 'current and reasonably complete']),
      'Reliability influence on confidence: ' + relBonus + ' points from source rating ' + (state.source.final || '—') + '.',
      'Credibility influence on confidence: ' + credBonus + ' points from credibility rating ' + (state.credibility.final || '—') + '.'
    ].filter(Boolean);
    renderRecommendation('confidenceResult', 'confidenceExplanation', 'confidenceTrace', state.product.final, state.product.explanation, state.product.trace, state.product.overrideEnabled, state.product.overrideReason);
  }

  function csvCount(text) {
    return String(text || '').split(/[\n,;]/).map((s) => s.trim()).filter(Boolean).length;
  }

  function updateSummary() {
    byId('summaryCase').textContent = state.case.case_id || '—';
    const admiralty = (state.source.final || '—') + (state.credibility.final || '—');
    byId('summaryAdmiralty').textContent = admiralty === '——' ? '—' : admiralty;
    byId('summaryTlp').textContent = state.tlp.final || '—';
    byId('summaryConfidence').textContent = state.product.final || '—';
  }

  function renderOutput() {
    const admiralty = (state.source.final || '—') + (state.credibility.final || '—');
    const tlp = state.tlp.final || '—';
    const confidence = state.product.final || '—';
    const indicatorCount = csvCount(state.case.indicators);
    const ttpCount = csvCount(state.case.ttps);

    state.output.admiralty_rating = admiralty;
    state.output.tlp = tlp;
    state.output.confidence = confidence;
    state.output.recommended_tags = [
      'admiralty_rating:' + admiralty,
      'tlp:' + tlp,
      'confidence:' + confidence,
      state.case.intelligence_type ? 'intelligence_type:' + state.case.intelligence_type : '',
      state.case.scope ? 'scope:' + state.case.scope : '',
      state.case.indicators ? 'indicator_count:' + indicatorCount : '',
      state.case.ttps ? 'ttp_count:' + ttpCount : ''
    ].filter(Boolean);
    state.output.recommended_metadata = {
      case_id: state.case.case_id || '',
      analyst_name: state.case.analyst_name || '',
      datetime: state.case.datetime || '',
      org_unit: state.case.org_unit || '',
      source_name: state.case.source_name || '',
      source_type: state.case.source_type || '',
      collection_method: state.case.collection_method || '',
      intelligence_type: state.case.intelligence_type || '',
      scope: state.case.scope || '',
      tlp: tlp,
      admiralty_rating: admiralty,
      confidence: confidence,
      caveats: state.tlp.caveats || ''
    };

    const assumptions = state.case.assumptions_gaps || 'No assumptions or gaps recorded.';
    state.output.narrative_summary = 'We assess this CTI product with ' + confidence + ' confidence because the source was rated ' + (state.source.final || '—') + ', the information was rated ' + (state.credibility.final || '—') + ', and the available evidence was scored for quantity, variety, consistency, and timeliness. Key assumptions and gaps: ' + assumptions;
    state.output.next_actions = [
      'Validate and enrich indicators before operational use.',
      'Seek additional corroboration if credibility is 3, 4, 5, or 6.',
      'Request peer review if confidence is Low or Moderate.',
      tlp === 'TLP:RED' ? 'Restrict dissemination to named participants only.' : '',
      tlp === 'TLP:AMBER+STRICT' ? 'Keep distribution inside the recipient organization only.' : '',
      tlp === 'TLP:AMBER' ? 'Share only on a need-to-know basis to enable action.' : '',
      tlp === 'TLP:GREEN' ? 'Share within the trusted community but do not publicly post.' : '',
      tlp === 'TLP:CLEAR' ? 'Public release is acceptable if organizational policy allows.' : ''
    ].filter(Boolean);

    const reportLines = [
      'CTI Packaging Report',
      '====================',
      'Case ID: ' + (state.case.case_id || '—'),
      'Analyst: ' + (state.case.analyst_name || '—'),
      'Date/Time: ' + (state.case.datetime || '—'),
      'Org/Unit: ' + (state.case.org_unit || '—'),
      '',
      'Recommended Tags',
      '- Admiralty Rating: ' + admiralty,
      '- TLP: ' + tlp,
      '- Confidence: ' + confidence,
      state.case.intelligence_type ? '- Intelligence Type: ' + state.case.intelligence_type : '',
      state.case.scope ? '- Scope: ' + state.case.scope : '',
      state.case.indicators ? '- Indicator Count: ' + indicatorCount : '',
      state.case.ttps ? '- TTP Count: ' + ttpCount : '',
      '',
      'Narrative Summary',
      state.output.narrative_summary,
      '',
      'Decision Trace',
      '[Reliability] ' + (state.source.trace.join(' | ') || 'No trace available'),
      '[Credibility] ' + (state.credibility.trace.join(' | ') || 'No trace available'),
      '[TLP] ' + (state.tlp.trace.join(' | ') || 'No trace available'),
      '[Confidence] ' + (state.product.trace.join(' | ') || 'No trace available'),
      '',
      'Next Actions'
    ].concat(state.output.next_actions.map((item) => '- ' + item)).filter(Boolean);

    state.output.report_text = reportLines.join('\n');

    const metadataEl = byId('outputMetadata');
    while (metadataEl.firstChild) metadataEl.removeChild(metadataEl.firstChild);
    Object.entries(state.output.recommended_metadata).forEach(([key, value]) => {
      const dt = document.createElement('dt');
      dt.textContent = key.replace(/_/g, ' ');
      const dd = document.createElement('dd');
      dd.textContent = value || '—';
      metadataEl.appendChild(dt);
      metadataEl.appendChild(dd);
    });

    byId('outputNarrative').textContent = state.output.narrative_summary;
    buildList('outputChecklist', [
      'Case intake completed.',
      'Source reliability evaluated.',
      'Information credibility evaluated.',
      'TLP dissemination boundary selected.',
      'Confidence assessed with documented uncertainty.'
    ].concat(state.output.next_actions));

    byId('outputDecisionTrace').textContent = [
      'Reliability (' + (state.source.final || '—') + '): ' + (state.source.trace.join(' | ') || '—'),
      'Credibility (' + (state.credibility.final || '—') + '): ' + (state.credibility.trace.join(' | ') || '—'),
      'TLP (' + (state.tlp.final || '—') + '): ' + (state.tlp.trace.join(' | ') || '—'),
      'Confidence (' + (state.product.final || '—') + '): ' + (state.product.trace.join(' | ') || '—')
    ].join('\n\n');
    byId('reportText').textContent = state.output.report_text;
  }

  function validateOverrides() {
    const rules = [
      ['reliability_override_enabled', 'reliability_override_value', 'reliability_override_reason', 'source reliability'],
      ['credibility_override_enabled', 'credibility_override_value', 'credibility_override_reason', 'information credibility'],
      ['tlp_override_enabled', 'tlp_override_value', 'tlp_override_reason', 'TLP label'],
      ['confidence_override_enabled', 'confidence_override_value', 'confidence_override_reason', 'confidence level']
    ];
    for (const [enabledId, valueId, reasonId, label] of rules) {
      if (byId(enabledId).checked) {
        if (!byId(valueId).value || !sanitizeText(byId(reasonId).value, 300)) {
          alert('If you override ' + label + ', select a value and enter a justification.');
          return false;
        }
      }
    }
    return true;
  }

  function validateStep(stepIndex) {
    if (stepIndex === 0) {
      if (!sanitizeText(byId('case_id').value, 60) || !sanitizeText(byId('analyst_name').value, 80)) {
        alert('Case ID and Analyst Name are required.');
        return false;
      }
    }
    return validateOverrides();
  }

  function recompute() {
    gatherState();
    computeReliability();
    computeCredibility();
    computeTlp();
    computeConfidence();
    updateSummary();
    renderOutput();
  }

  function showStep(index) {
    currentStep = Math.max(0, Math.min(stepEls.length - 1, index));
    stepEls.forEach((step, i) => { step.classList.toggle('active', i === currentStep); });
    stepListItems.forEach((li, i) => { li.classList.toggle('current', i === currentStep); });
    const pct = Math.round((currentStep / (stepEls.length - 1)) * 100);
    const bar = byId('progressBar');
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', String(pct));
    byId('prevBtn').disabled = currentStep === 0;
    byId('nextBtn').textContent = currentStep === stepEls.length - 1 ? 'Review Complete' : 'Next';
    const heading = stepEls[currentStep].querySelector('h2');
    if (heading && typeof heading.focus === 'function') heading.focus();
  }

  function setOverrideEnabled(toggleId, valueId, reasonId) {
    const enabled = byId(toggleId).checked;
    byId(valueId).disabled = !enabled;
    byId(reasonId).disabled = !enabled;
    if (!enabled) {
      byId(valueId).value = '';
      byId(reasonId).value = '';
    }
    recompute();
  }

  function saveDraft() {
    recompute();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    alert('Draft saved locally in this browser.');
  }

  function loadDraft() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      alert('No saved draft found.');
      return;
    }
    try {
      const saved = JSON.parse(raw);
      const srcCase = saved.case || {};
      caseFieldIds.forEach((id) => {
        if (Object.prototype.hasOwnProperty.call(srcCase, id)) {
          byId(id).value = sanitizeText(srcCase[id], byId(id).maxLength || 600);
        }
      });
      byId('tlp_caveats').value = sanitizeText(saved.tlp && saved.tlp.caveats ? saved.tlp.caveats : '', 300);
      reliabilityFields.forEach((id) => { byId(id).value = saved.source && saved.source.answers ? String(saved.source.answers[id] ?? '') : ''; });
      credibilityFields.forEach((id) => { byId(id).value = saved.credibility && saved.credibility.answers ? String(saved.credibility.answers[id] ?? '') : ''; });
      confidenceFields.forEach((id) => { byId(id).value = saved.product && saved.product.answers ? String(saved.product.answers[id] ?? '') : ''; });
      tlpFields.forEach((id) => { byId(id).value = saved.tlp && saved.tlp.answers ? String(saved.tlp.answers[id] ?? '') : ''; });

      byId('reliability_override_enabled').checked = !!(saved.source && saved.source.overrideEnabled);
      byId('reliability_override_value').value = saved.source && saved.source.overrideValue ? saved.source.overrideValue : '';
      byId('reliability_override_reason').value = saved.source && saved.source.overrideReason ? saved.source.overrideReason : '';

      byId('credibility_override_enabled').checked = !!(saved.credibility && saved.credibility.overrideEnabled);
      byId('credibility_override_value').value = saved.credibility && saved.credibility.overrideValue ? saved.credibility.overrideValue : '';
      byId('credibility_override_reason').value = saved.credibility && saved.credibility.overrideReason ? saved.credibility.overrideReason : '';

      byId('tlp_override_enabled').checked = !!(saved.tlp && saved.tlp.overrideEnabled);
      byId('tlp_override_value').value = saved.tlp && saved.tlp.overrideValue ? saved.tlp.overrideValue : '';
      byId('tlp_override_reason').value = saved.tlp && saved.tlp.overrideReason ? saved.tlp.overrideReason : '';

      byId('confidence_override_enabled').checked = !!(saved.product && saved.product.overrideEnabled);
      byId('confidence_override_value').value = saved.product && saved.product.overrideValue ? saved.product.overrideValue : '';
      byId('confidence_override_reason').value = saved.product && saved.product.overrideReason ? saved.product.overrideReason : '';

      setOverrideEnabled('reliability_override_enabled', 'reliability_override_value', 'reliability_override_reason');
      setOverrideEnabled('credibility_override_enabled', 'credibility_override_value', 'credibility_override_reason');
      setOverrideEnabled('tlp_override_enabled', 'tlp_override_value', 'tlp_override_reason');
      setOverrideEnabled('confidence_override_enabled', 'confidence_override_value', 'confidence_override_reason');
      recompute();
      alert('Draft loaded.');
    } catch (err) {
      alert('Could not load the saved draft.');
    }
  }

  function clearDraft() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  async function copyReport() {
    recompute();
    try {
      await navigator.clipboard.writeText(state.output.report_text || '');
      alert('Report copied to clipboard.');
    } catch (err) {
      alert('Clipboard copy failed in this browser context. You can still select and copy the report manually.');
    }
  }

  function downloadJson() {
    recompute();
    const safeCaseId = (state.case.case_id || 'cti-report').replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 50);
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeCaseId + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    document.querySelectorAll('input, select, textarea').forEach((el) => {
      el.addEventListener('input', recompute);
      el.addEventListener('change', recompute);
    });

    byId('reliability_override_enabled').addEventListener('change', () => setOverrideEnabled('reliability_override_enabled', 'reliability_override_value', 'reliability_override_reason'));
    byId('credibility_override_enabled').addEventListener('change', () => setOverrideEnabled('credibility_override_enabled', 'credibility_override_value', 'credibility_override_reason'));
    byId('tlp_override_enabled').addEventListener('change', () => setOverrideEnabled('tlp_override_enabled', 'tlp_override_value', 'tlp_override_reason'));
    byId('confidence_override_enabled').addEventListener('change', () => setOverrideEnabled('confidence_override_enabled', 'confidence_override_value', 'confidence_override_reason'));

    byId('prevBtn').addEventListener('click', () => showStep(currentStep - 1));
    byId('nextBtn').addEventListener('click', () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < stepEls.length - 1) showStep(currentStep + 1);
      else renderOutput();
    });
    byId('saveDraftBtn').addEventListener('click', saveDraft);
    byId('loadDraftBtn').addEventListener('click', loadDraft);
    byId('clearDraftBtn').addEventListener('click', clearDraft);
    byId('copyReportBtn').addEventListener('click', copyReport);
    byId('downloadJsonBtn').addEventListener('click', downloadJson);
    byId('printBtn').addEventListener('click', () => window.print());
  }

  function init() {
    setDefaultDateTime();
    bindEvents();
    setOverrideEnabled('reliability_override_enabled', 'reliability_override_value', 'reliability_override_reason');
    setOverrideEnabled('credibility_override_enabled', 'credibility_override_value', 'credibility_override_reason');
    setOverrideEnabled('tlp_override_enabled', 'tlp_override_value', 'tlp_override_reason');
    setOverrideEnabled('confidence_override_enabled', 'confidence_override_value', 'confidence_override_reason');
    recompute();
    showStep(0);
  }

  init();
})();
