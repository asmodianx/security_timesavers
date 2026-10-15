'use strict';
/* Tab 4: manual events, CSV import with header-based field mapping, timeline review. */
(function () {
  const { $, el, button } = U;
  const FIELDS = [['', 'Ignore'], ['timestamp', 'Timestamp'], ['event_type', 'Event type'], ['source', 'Source'], ['description', 'Description'], ['entity', 'Entity name (matched or created)'], ['confidence', 'Confidence'], ['notes', 'Notes']];
  const GUESS = [[/^(time|timestamp|date|datetime|eventtime|time_?generated|@timestamp|created)/i, 'timestamp'], [/(action_?type|event_?type|^type$|^action$|category|event_?name)/i, 'event_type'], [/(^source|provider|product|log_?source)/i, 'source'], [/(description|message|details|summary|command_?line|additional)/i, 'description'], [/(device_?name|host|computer|account_?name|user|^entity)/i, 'entity'], [/confidence/i, 'confidence'], [/notes?$/i, 'notes']];
  const MAX_ROWS = 5000;
  let ctx, csv = null, staged = [];

  function parseCSV(s) {
    const out = []; let row = [], cur = '', q = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i], n = s[i + 1];
      if (q) { if (c === '"' && n === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && n === '\n') i++; row.push(cur); out.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur || row.length) { row.push(cur); out.push(row); }
    return out.filter((r) => r.some((x) => x.trim()));
  }
  const hasZone = (v) => /(Z|[+-]\d\d:?\d\d)$/i.test(v.trim());
  function toISO(v, tz) {
    v = String(v || '').trim(); if (!v) return null;
    let d = new Date(/^\d{4}-\d\d-\d\d \d/.test(v) ? v.replace(' ', 'T') : v);
    if (Number.isNaN(d.getTime())) return null;
    if (tz === 'UTC' && !hasZone(v) && !/^\d{4}-\d\d-\d\d$/.test(v)) d = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return d.toISOString();
  }
  function findOrCreateEntity(name) {
    const S = ctx.S; let e = S.entities.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (!e) { e = STSModel.normalizeEntity({ name, type: 'other', description: 'Created from timeline CSV import' }); S.entities.push(e); }
    return e.id;
  }

  function renderMap() {
    if (!csv) { $('tMap').replaceChildren(el('p', 'Choose a CSV file to see its columns.', 'muted')); return; }
    const used = new Set();
    $('tMap').replaceChildren(...csv.headers.map((h, i) => {
      const l = el('label', `${h || 'Column ' + (i + 1)}  (e.g. "${(csv.rows[0]?.[i] || '').slice(0, 40)}")`), s = el('select', null, 'mapField');
      s.dataset.col = i; U.options(s, FIELDS, '');
      const g = GUESS.find(([re, f]) => re.test(h) && (f === 'description' || !used.has(f)));
      if (g) { s.value = g[1]; used.add(g[1]); }
      l.append(s); return l;
    }));
  }
  function mapping() { const m = {}; document.querySelectorAll('#tMap .mapField').forEach((s) => { if (s.value) (m[s.value] = m[s.value] || []).push(Number(s.dataset.col)); }); return m; }

  function render() {
    const S = ctx.S, q = U.txt($('tFilter').value).toLowerCase(), desc = $('tSort').value === 'desc';
    U.options($('tEntity'), ctx.entityOptions()); U.options($('tEvidence'), ctx.evidenceOptions());
    const rows = S.events.filter((x) => !q || JSON.stringify(x).toLowerCase().includes(q)).sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)) * (desc ? -1 : 1));
    $('tList').replaceChildren(U.table(['UTC time', 'Type', 'Source', 'Description', 'Entities', 'Evidence', 'Conf.', ''], rows.map((x) => [
      x.timestamp, x.event_type, x.source, x.description, (x.entity_refs || []).map(ctx.entityName).join(', '), (x.evidence_refs || []).map(ctx.evidenceName).join(', '), x.confidence,
      button('Remove', 'danger small', () => { S.events.splice(S.events.indexOf(x), 1); ctx.changed('Event removed.'); })])));
  }

  IW.modules.push({
    name: 'Timeline',
    init(c) {
      ctx = c;
      $('tAdd').addEventListener('click', () => {
        const ts = toISO($('tAt').value, $('tTz').value); if (!ts) { ctx.status('Enter a valid date and time.', 'bad'); return; }
        const n = Number($('tConfidence').value);
        ctx.S.events.push({ id: U.uid(), timestamp: ts, original_timestamp: $('tAt').value, timezone: $('tTz').value, event_type: U.txt($('tType').value) || 'Observation', source: U.txt($('tSource').value), description: U.txt($('tDesc').value), entity_refs: [$('tEntity').value].filter(Boolean), evidence_refs: [$('tEvidence').value].filter(Boolean), confidence: Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 50, tags: U.tags($('tTags').value), notes: U.txt($('tNotes').value) });
        U.clear('tDesc', 'tNotes', 'tTags'); ctx.changed('Event added to the timeline.');
      });
      $('tCsv').addEventListener('change', async () => {
        const f = $('tCsv').files[0]; staged = []; $('tPreviewOut').textContent = ''; csv = null;
        if (f) try { Hardening.checkSize(f, Hardening.limits.MAX_CSV); const rows = parseCSV(await f.text()); if (rows.length < 2) throw Error('CSV needs a header row and at least one data row.'); csv = { name: f.name, headers: rows[0].map((h) => h.trim()), rows: rows.slice(1) }; }
        catch (e) { ctx.status('CSV could not be read: ' + e.message, 'bad'); }
        renderMap();
      });
      $('tPreview').addEventListener('click', () => {
        if (!csv) { ctx.status('Choose a CSV file first.', 'bad'); return; }
        const m = mapping(); if (!m.timestamp) { ctx.status('Map one column to Timestamp.', 'bad'); return; }
        const get = (r, f) => (m[f] || []).map((i) => r[i] || '').filter(Boolean).join(' | ');
        let bad = 0; staged = [];
        for (const r of csv.rows.slice(0, MAX_ROWS)) {
          const ts = toISO(get(r, 'timestamp'), $('tCsvTz').value); if (!ts) { bad++; continue; }
          const n = Number(get(r, 'confidence'));
          staged.push({ timestamp: ts, original_timestamp: get(r, 'timestamp'), event_type: get(r, 'event_type') || 'Imported', source: get(r, 'source') || csv.name, description: get(r, 'description'), entity: get(r, 'entity'), confidence: Number.isFinite(n) && get(r, 'confidence') ? Math.max(0, Math.min(100, n)) : 50, notes: get(r, 'notes') });
        }
        const capped = csv.rows.length > MAX_ROWS ? `\nOnly the first ${MAX_ROWS} rows are imported per operation.` : '';
        $('tPreviewOut').textContent = `${staged.length} event(s) ready, ${bad} row(s) skipped (unreadable timestamp).${capped}\n\nFirst rows:\n` + staged.slice(0, 5).map((x) => `${x.timestamp}  ${x.event_type}  ${x.entity}  ${x.description.slice(0, 80)}`).join('\n');
      });
      $('tCommit').addEventListener('click', () => {
        if (!staged.length) { ctx.status('Preview the mapping first.', 'bad'); return; }
        for (const r of staged) ctx.S.events.push({ id: U.uid(), timestamp: r.timestamp, original_timestamp: r.original_timestamp, timezone: $('tCsvTz').value, event_type: r.event_type, source: r.source, description: r.description, entity_refs: r.entity ? [findOrCreateEntity(r.entity)] : [], evidence_refs: [], confidence: r.confidence, tags: ['csv-import'], notes: r.notes });
        const n = staged.length; staged = []; csv = null; U.clear('tCsv'); $('tPreviewOut').textContent = ''; renderMap();
        ctx.changed(`${n} event(s) imported from CSV.`);
      });
      $('tFilter').addEventListener('input', render); $('tSort').addEventListener('change', render);
      renderMap();
    },
    render
  });
})();
