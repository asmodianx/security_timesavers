'use strict';
/* Tab 8: merge STIX/MISP intelligence into the case; export STIX 2.0 and MISP event JSON. */
(function () {
  const { $ } = U;
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const TS = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
  const SDO_NEEDS_TIME = new Set(['attack-pattern', 'campaign', 'course-of-action', 'identity', 'indicator', 'intrusion-set', 'malware', 'observed-data', 'report', 'threat-actor', 'tool', 'vulnerability', 'relationship', 'sighting']);
  let ctx, staged = null, built = null;

  function validateBundle(b) {
    const errors = [], warnings = [];
    if (!b || typeof b !== 'object' || b.type !== 'bundle') errors.push('Root object must have type "bundle".');
    if (typeof b?.id !== 'string' || !b.id.startsWith('bundle--') || !UUID.test(b.id.slice(8))) errors.push('Bundle id must be bundle--<UUID>.');
    let version = b?.spec_version;
    if (version === '2.0') { /* ok */ } else if (version === undefined && (b?.objects || []).some((o) => o?.spec_version === '2.1')) { version = '2.1'; warnings.push('STIX 2.1 content detected; supported objects will be mapped, but 2.1-only properties are ignored.'); }
    else errors.push('STIX 2.0 bundles require spec_version "2.0".');
    if (!Array.isArray(b?.objects)) { errors.push('Bundle objects must be an array.'); return { valid: false, errors, warnings, version }; }
    const ids = new Set();
    b.objects.forEach((o, i) => {
      if (!o || typeof o !== 'object') { errors.push(`objects[${i}] is not an object.`); return; }
      if (typeof o.type !== 'string' || !/^[a-z0-9-]+$/.test(o.type)) errors.push(`objects[${i}] has an invalid type.`);
      if (typeof o.id !== 'string' || o.id.split('--')[0] !== o.type || !UUID.test(o.id.split('--')[1] || '')) errors.push(`objects[${i}] id must be ${o.type}--<UUID>.`);
      else { if (ids.has(o.id)) warnings.push(`Duplicate id ${o.id}.`); ids.add(o.id); }
      if (version === '2.0' && SDO_NEEDS_TIME.has(o.type)) for (const k of ['created', 'modified']) if (!TS.test(o[k] || '')) errors.push(`${o.id}: ${k} must be an RFC 3339 UTC timestamp.`);
      if (o.type === 'indicator' && (!o.pattern || !Array.isArray(o.labels) && version === '2.0')) errors.push(`${o.id}: indicator requires pattern and labels.`);
      if (o.type === 'relationship' && (!o.source_ref || !o.target_ref || !o.relationship_type)) errors.push(`${o.id}: relationship requires relationship_type, source_ref and target_ref.`);
    });
    for (const o of b.objects) for (const k of ['source_ref', 'target_ref', 'created_by_ref']) if (o && o[k] && !ids.has(o[k])) warnings.push(`${o.id}: ${k} refers to an object not in this bundle.`);
    return { valid: !errors.length, errors, warnings, version };
  }

  const stixTime = (v) => { const d = new Date(v || Date.now()); return (Number.isNaN(d.getTime()) ? new Date() : d).toISOString(); };
  const sid = (type, id) => `${type}--${UUID.test(id || '') ? id : U.uid()}`;
  function entityToStix(e) {
    const first = (...t) => (e.attributes.find((a) => t.includes(a.type)) || {}).value;
    switch (e.type) {
      case 'ip-address': { const v = first('ip-dst', 'ip-src') || e.name, t = v.includes(':') ? 'ipv6-addr' : 'ipv4-addr'; return { type: t, id: sid(t, e.id), value: v }; }
      case 'domain': return { type: 'domain-name', id: sid('domain-name', e.id), value: first('domain', 'hostname') || e.name };
      case 'url': return { type: 'url', id: sid('url', e.id), value: first('url', 'link') || e.name };
      case 'email-address': return { type: 'email-addr', id: sid('email-addr', e.id), value: first('email', 'email-src', 'email-dst') || e.name };
      case 'file': { const o = { type: 'file', id: sid('file', e.id), name: first('filename') || e.name }, h = first('sha256'); if (h) o.hashes = { 'SHA-256': h }; return o; }
      case 'account': return { type: 'user-account', id: sid('user-account', e.id), user_id: e.name, account_login: e.name };
      default: return null;
    }
  }
  /* STIX 2.0 cyber-observables are carried inside observed-data; relationships target SDOs. */
  function export20() {
    const S = ctx.S, objects = [], obsMap = new Map(), now = stixTime();
    for (const e of S.entities) {
      const sco = entityToStix(e); if (!sco) continue;
      const { id, ...obs } = sco, od = { type: 'observed-data', id: sid('observed-data', e.id), created: now, modified: now, first_observed: stixTime(e.first_observed || S.case.created), last_observed: stixTime(e.last_observed || S.case.modified), number_observed: 1, objects: { 0: obs }, labels: e.tags.length ? e.tags : undefined };
      if (!od.labels) delete od.labels;
      objects.push(od); obsMap.set(e.id, od.id);
    }
    for (const i of S.indicators) if (i.pattern) objects.push({ type: 'indicator', id: sid('indicator', i.id), created: stixTime(i.created), modified: stixTime(i.modified || i.created), name: i.name || 'Case indicator', pattern: i.pattern, valid_from: stixTime(i.valid_from), labels: i.labels?.length ? i.labels : ['malicious-activity'] });
    for (const r of S.relationships) if (obsMap.has(r.source_ref) && obsMap.has(r.target_ref)) objects.push({ type: 'relationship', id: sid('relationship', r.id), created: now, modified: now, relationship_type: r.relationship_type || 'related-to', source_ref: obsMap.get(r.source_ref), target_ref: obsMap.get(r.target_ref) });
    return { type: 'bundle', id: 'bundle--' + U.uid(), spec_version: '2.0', objects };
  }

  function scoToEntity(o) {
    if (!o || typeof o !== 'object') return null;
    if (o.type === 'ipv4-addr' || o.type === 'ipv6-addr') return { name: o.value, type: 'ip-address', attributes: [{ type: 'ip-dst', value: o.value }] };
    if (o.type === 'domain-name') return { name: o.value, type: 'domain', attributes: [{ type: 'domain', value: o.value }] };
    if (o.type === 'url') return { name: o.value, type: 'url', attributes: [{ type: 'url', value: o.value }] };
    if (o.type === 'email-addr') return { name: o.value, type: 'email-address', attributes: [{ type: 'email', value: o.value }] };
    if (o.type === 'file') return { name: o.name || 'file', type: 'file', attributes: [...(o.name ? [{ type: 'filename', value: o.name }] : []), ...(o.hashes?.['SHA-256'] ? [{ type: 'sha256', value: o.hashes['SHA-256'] }] : []), ...(o.hashes?.MD5 ? [{ type: 'md5', value: o.hashes.MD5 }] : [])] };
    if (o.type === 'user-account') return { name: o.account_login || o.user_id || 'account', type: 'account', attributes: [] };
    return null;
  }
  const SDO_ENTITY = { malware: 'malware', tool: 'tool', 'threat-actor': 'threat-actor', 'intrusion-set': 'threat-actor', identity: 'organization', vulnerability: 'vulnerability' };

  function mergeStix(b) {
    const S = ctx.S, map = new Map(); let ents = 0, inds = 0, rels = 0;
    const add = (stixId, e) => { if (!e || !e.name) return; const x = STSModel.normalizeEntity({ ...e, attributes: (e.attributes || []).map((a) => ({ ...a, category: 'External analysis', provenance: { method: 'stix-import', source: stixId } })), source_refs: [stixId] }); S.entities.push(x); map.set(stixId, x.id); ents++; };
    for (const o of b.objects) {
      if (o.type === 'observed-data' && o.objects && typeof o.objects === 'object') { const first = Object.values(o.objects).map(scoToEntity).find(Boolean); add(o.id, first); }
      else if (SDO_ENTITY[o.type]) add(o.id, { name: o.name || o.id, type: SDO_ENTITY[o.type], description: o.description || '' });
      else if (o.type === 'indicator') { S.indicators.push({ id: U.uid(), name: o.name || o.id, pattern: o.pattern || '', created: o.created || '', valid_from: o.valid_from || '', labels: Array.isArray(o.labels) ? o.labels.map(String) : [], source_stix_id: o.id }); inds++; }
      else { const e = scoToEntity(o); if (e) add(o.id, e); }
    }
    for (const o of b.objects) if (o.type === 'relationship' && map.has(o.source_ref) && map.has(o.target_ref)) { S.relationships.push({ id: U.uid(), source_ref: map.get(o.source_ref), target_ref: map.get(o.target_ref), relationship_type: String(o.relationship_type), confidence: 50, evidence_refs: [], source_stix_id: o.id }); rels++; }
    S.extensions.stix = S.extensions.stix || { imports: [] }; S.extensions.stix.imports = S.extensions.stix.imports || [];
    S.extensions.stix.imports.push({ imported: U.now(), bundle_id: b.id, object_count: b.objects.length });
    S.history.push({ id: U.uid(), timestamp: U.now(), action: 'stix-import', description: `Merged ${b.id}: ${ents} entities, ${inds} indicators, ${rels} relationships.` });
    return `${ents} entities, ${inds} indicators, ${rels} relationships merged.`;
  }
  function mergeMisp(ev) {
    const S = ctx.S; let n = 0;
    const attr = (a) => STSModel.normalizeAttr({ type: a.type, category: a.category, value: a.value, relation: a.object_relation || '', comment: a.comment || '', to_ids: !!a.to_ids, tags: (a.Tag || []).map((t) => t.name), provenance: { method: 'misp-import', source: ev.uuid || ev.info } });
    for (const a of ev.Attribute || []) { S.rootAttributes.push(attr(a)); n++; }
    for (const o of ev.Object || []) { const e = STSModel.normalizeEntity({ name: o.name || 'MISP object', type: o.name || 'other', description: o.description || '', attributes: [] }); e.attributes = (o.Attribute || []).map(attr); n += e.attributes.length; S.entities.push(e); }
    S.case.tags = [...new Set([...S.case.tags, ...(ev.Tag || []).map((t) => String(t.name))])];
    S.history.push({ id: U.uid(), timestamp: U.now(), action: 'misp-import', description: `Merged MISP event "${ev.info || ev.uuid}" (${n} attributes).` });
    return `${n} MISP attribute(s) merged.`;
  }
  function misp() {
    const S = ctx.S, a = (x) => ({ uuid: U.uid(), category: x.category, type: x.type, value: x.value, to_ids: x.to_ids, comment: x.comment, object_relation: x.relation || x.type, Tag: x.tags.map((name) => ({ name })) });
    return { Event: { uuid: S.case.id, info: S.case.title || 'Incident Investigation Workbench case', date: S.case.created.slice(0, 10), analysis: '1', distribution: '0', threat_level_id: { Critical: '1', High: '1', Medium: '2', Low: '3' }[S.case.severity] || '4', Tag: S.case.tags.map((name) => ({ name })), Attribute: S.rootAttributes.map(a), Object: S.entities.filter((e) => e.attributes.length).map((e) => ({ uuid: U.uid(), name: e.type, meta_category: 'misc', description: e.description || e.name, Attribute: e.attributes.map(a) })) } };
  }
  const show = (id, v) => { $(id).textContent = [v.valid === undefined ? '' : (v.valid ? 'VALID' : 'INVALID') + (v.version ? ` (STIX ${v.version})` : ''), ...v.errors.map((e) => 'ERROR   ' + e), ...v.warnings.map((w) => 'WARNING ' + w), v.extra || ''].filter(Boolean).join('\n'); };

  IW.modules.push({
    name: 'Exchange',
    init(c) {
      ctx = c;
      $('xiPreview').addEventListener('click', async () => {
        staged = null; const f = $('xiFile').files[0]; if (!f) { ctx.status('Choose a file first.', 'bad'); return; }
        try {
          Hardening.checkSize(f, Hardening.limits.MAX_JSON); const j = Hardening.parseJSON(await f.text());
          if (j.format === 'security-timesavers-case' || (j.event && j.objects)) { show('xiOut', { valid: false, errors: ['This is a whole case file. Open it with "Open case file" in the header.'], warnings: [] }); return; }
          if (j.type === 'bundle') { const v = validateBundle(j); v.extra = `${j.objects?.length || 0} object(s) in bundle.`; show('xiOut', v); if (v.valid) staged = { kind: 'stix', data: j }; return; }
          const ev = j.Event || j.response?.[0]?.Event; if (ev) { staged = { kind: 'misp', data: ev }; show('xiOut', { valid: true, errors: [], warnings: [], extra: `MISP event "${ev.info || ev.uuid}": ${(ev.Attribute || []).length} attribute(s), ${(ev.Object || []).length} object(s).` }); return; }
          show('xiOut', { valid: false, errors: ['Unrecognised format. Expected a STIX bundle or a MISP event.'], warnings: [] });
        } catch (e) { show('xiOut', { valid: false, errors: [e.message], warnings: [] }); }
      });
      $('xiCommit').addEventListener('click', () => {
        if (!staged) { ctx.status('Validate a file successfully first (step 1).', 'bad'); return; }
        const msg = staged.kind === 'stix' ? mergeStix(staged.data) : mergeMisp(staged.data);
        staged = null; U.clear('xiFile'); $('xiOut').textContent = msg; ctx.changed(msg);
      });
      $('xsBuild').addEventListener('click', () => { built = export20(); const v = validateBundle(built); v.extra = `${built.objects.length} object(s).\n\n` + JSON.stringify(built, null, 2); show('xsOut', v); });
      $('xsDownload').addEventListener('click', () => {
        built = built || export20(); const v = validateBundle(built);
        if (!v.valid) { show('xsOut', v); ctx.status('Bundle failed validation; not downloaded.', 'bad'); return; }
        U.download(ctx.fileBase() + '.stix20.json', JSON.stringify(built, null, 2), 'application/json'); built = null; ctx.status('STIX 2.0 bundle downloaded.', 'good');
      });
      $('xmDownload').addEventListener('click', () => { U.download(ctx.fileBase() + '.misp.json', JSON.stringify(misp(), null, 2), 'application/json'); ctx.status('MISP event downloaded.', 'good'); });
    },
    render() {},
    validateBundle
  });
  window.STIXValidate = validateBundle;
})();
