'use strict';
/* Security Time Savers Case 1.0 model, normalisation and CTI Workbench v2.2.1 migration. */
(function () {
  const uuid = () => crypto.randomUUID(), iso = () => new Date().toISOString();
  const COLLECTIONS = ['contacts', 'obligations', 'evidence', 'custody', 'events', 'indicators', 'relationships', 'hypotheses', 'information_gaps', 'findings', 'tasks', 'actions', 'decisions', 'notifications', 'notes', 'sitreps', 'history'];
  /* Per-case lifecycle records (NIST SP 800-61). Each is a plain object of strings unless noted. */
  const RECORDS = { preparation: { communication_plan: '', scope: '' }, detection: { reported_by: '', reported_at: '', detected_at: '', source: '', source_detail: '', description: '' }, categorization: { determination: 'Under assessment', declared_at: '', attack_vector: '', functional_impact: '', information_impact: '', recoverability: '', rationale: '' }, lessons: { review_date: '', participants: '', went_well: '', to_improve: '', root_cause: '', contributing_factors: '', improvements: [] }, retention: { location: '', period: '', custodian: '', legal_hold: 'No', disposal_date: '', notes: '' } };
  /* Older status values mapped onto the NIST-aligned set. */
  const STATUS_MAP = { New: 'Reported', Investigation: 'Analysis', Remediation: 'Eradication', Monitoring: 'Recovery' };
  const STATUSES = ['Reported', 'Triage', 'Analysis', 'Containment', 'Eradication', 'Recovery', 'Post-incident review', 'Closed', 'Reopened'];
  const tags = (v) => Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v.split(',').map((x) => x.trim()).filter(Boolean) : [];
  function makeCase() {
    const t = iso();
    return { id: uuid(), case_number: '', title: '', description: '', classification: 'Internal', status: 'Reported', severity: 'Informational', priority: 'Normal', owner: '', responders: [], tags: [], created: t, modified: t, incident_start: '', discovered: '', contained: '', closed: '' };
  }
  function create() {
    const c = { format: 'security-timesavers-case', format_version: '1.0', application: 'Incident Investigation Workbench', version: '1.3.0', case: makeCase(), rootAttributes: [], entities: [], conclusion: {}, extensions: { cti: {}, analysis: {} } };
    for (const k of COLLECTIONS) c[k] = [];
    for (const [k, v] of Object.entries(RECORDS)) c[k] = JSON.parse(JSON.stringify(v));
    return c;
  }
  function normalizeAttr(a = {}) {
    return { id: String(a.id || uuid()), type: String(a.type || 'text'), category: String(a.category || 'Other'), value: String(a.value ?? ''), relation: String(a.relation || ''), comment: String(a.comment || ''), tags: tags(a.tags), to_ids: Boolean(a.to_ids ?? a.toIds), provenance: a.provenance && typeof a.provenance === 'object' ? a.provenance : {} };
  }
  function normalizeEntity(o = {}) {
    const c = Number(o.confidence);
    return { id: String(o.id || o.uuid || uuid()), name: String(o.name || o.type || 'Entity'), type: String(o.type || 'other'), description: String(o.description || ''), aliases: Array.isArray(o.aliases) ? o.aliases.map(String) : [], tags: tags(o.tags), confidence: Number.isFinite(c) ? Math.max(0, Math.min(100, c)) : 50, first_observed: String(o.first_observed || ''), last_observed: String(o.last_observed || ''), notes: String(o.notes || ''), attributes: Array.isArray(o.attributes) ? o.attributes.map(normalizeAttr) : [], source_refs: Array.isArray(o.source_refs) ? o.source_refs.map(String) : [] };
  }
  function fromLegacy(p) {
    const n = create(), e = p.event || {};
    Object.assign(n.case, { id: String(e.id || n.case.id), title: String(e.title || ''), description: String(e.description || ''), classification: String(e.classification || 'Internal'), tags: tags(e.tags), created: String(e.created || n.case.created), modified: String(e.modified || n.case.modified) });
    n.rootAttributes = Array.isArray(p.rootAttributes) ? p.rootAttributes.map(normalizeAttr) : [];
    n.entities = Array.isArray(p.objects) ? p.objects.map(normalizeEntity) : [];
    n.evidence = Array.isArray(p.evidence) ? p.evidence.map((x) => ({ ...x, id: String(x.id || uuid()) })) : [];
    n.extensions.cti = { legacy_application: String(p.application || 'CTI Workbench Wizard'), legacy_version: String(p.version || ''), legacy_event_format: String(e.format || 'neutral') };
    n.history.push({ id: uuid(), timestamp: iso(), action: 'legacy-import', description: 'Imported CTI Workbench v2.2.1 project into STS Case 1.0 model.' });
    return n;
  }
  function normalize(p) {
    if (window.Hardening) Hardening.scan(p);
    if (!p || typeof p !== 'object' || Array.isArray(p)) throw Error('Case file root must be a JSON object.');
    if (p.event && Array.isArray(p.objects)) return fromLegacy(p);
    if (p.format !== 'security-timesavers-case') throw Error('Not a Security Time Savers case file or CTI Workbench v2.2.1 project.');
    const n = create();
    n.case = { ...n.case, ...(p.case && typeof p.case === 'object' ? p.case : {}), tags: tags(p.case?.tags), responders: Array.isArray(p.case?.responders) ? p.case.responders.map(String) : [] };
    n.rootAttributes = Array.isArray(p.rootAttributes) ? p.rootAttributes.map(normalizeAttr) : [];
    n.entities = Array.isArray(p.entities) ? p.entities.map(normalizeEntity) : [];
    for (const k of COLLECTIONS) n[k] = Array.isArray(p[k]) ? p[k] : [];
    n.case.status = STATUS_MAP[n.case.status] || n.case.status || 'Reported';
    for (const [k, v] of Object.entries(RECORDS)) n[k] = { ...JSON.parse(JSON.stringify(v)), ...(p[k] && typeof p[k] === 'object' && !Array.isArray(p[k]) ? p[k] : {}) };
    if (!Array.isArray(n.lessons.improvements)) n.lessons.improvements = [];
    n.conclusion = p.conclusion && typeof p.conclusion === 'object' ? p.conclusion : {};
    n.extensions = p.extensions && typeof p.extensions === 'object' ? p.extensions : {};
    n.extensions.cti = n.extensions.cti || {}; n.extensions.analysis = n.extensions.analysis || {};
    return n;
  }
  /* Canonical serialisation used for both "Save case file" and signing, so signed bytes == saved bytes. */
  const serialize = (c) => new TextEncoder().encode(JSON.stringify(c, null, 2) + '\n');
  /* Lifecycle metrics from case timestamps (SP 800-61 post-incident measures). */
  function metrics(S) {
    const t = (v) => { const d = new Date(v); return v && !Number.isNaN(d.getTime()) ? d.getTime() : null; };
    const span = (a, b) => { const x = t(a), y = t(b); if (x === null || y === null || y < x) return null; const h = (y - x) / 3600000; return h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} d`; };
    const c = S.case, first = S.events.map((e) => e.timestamp).filter(Boolean).sort()[0] || '';
    return [
      ['Incident start → discovered (dwell / time to detect)', span(c.incident_start || first, c.discovered)],
      ['Discovered → declared', span(c.discovered, S.categorization.declared_at)],
      ['Discovered → contained (time to contain)', span(c.discovered, c.contained)],
      ['Contained → closed (eradication and recovery)', span(c.contained, c.closed)],
      ['Discovered → closed (total response time)', span(c.discovered, c.closed)]
    ].map(([k, v]) => [k, v || 'Not available — record the relevant times']);
  }
  window.STSModel = { create, metrics, STATUSES, normalize, fromLegacy, normalizeAttr, normalizeEntity, serialize, uuid, iso };
})();
