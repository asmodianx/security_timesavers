'use strict';
/* Tab 2: entities, CTI attributes, relationships. */
(function () {
  const { $, el, button } = U;
  const ENTITY_TYPES = ['host', 'account', 'person', 'email-address', 'ip-address', 'domain', 'url', 'file', 'process', 'application', 'network', 'cloud-resource', 'vulnerability', 'malware', 'tool', 'threat-actor', 'organization', 'location', 'other'];
  const CATS = ['Antivirus detection', 'Artifacts dropped', 'Attribution', 'External analysis', 'Financial fraud', 'Internal reference', 'Network activity', 'Other', 'Payload delivery', 'Payload installation', 'Payload type', 'Persistence mechanism', 'Person', 'Social network', 'Support Tool', 'Targeting data'];
  const TYPES = 'AS,attachment,authentihash,boolean,campaign-id,campaign-name,comment,cookie,counter,cpe,datetime,dkim,dkim-signature,domain,domain|ip,email,email-attachment,email-body,email-dst,email-dst-display-name,email-header,email-message-id,email-reply-to,email-src,email-src-display-name,email-subject,email-x-mailer,filename,filename|md5,filename|sha1,filename|sha256,float,full-name,hex,hostname,hostname|port,http-method,imphash,integer,ip-dst,ip-dst|port,ip-src,ip-src|port,ja3-fingerprint-md5,kusto-query,link,mac-address,malware-sample,malware-type,md5,mime-type,mutex,named pipe,other,pattern-in-file,pattern-in-memory,pattern-in-traffic,pdb,port,regkey,regkey|value,sha1,sha224,sha256,sha384,sha512,sigma,size-in-bytes,snort,ssdeep,ssh-fingerprint,stix2-pattern,text,threat-actor,tlsh,uri,url,user-agent,uuid,vulnerability,weakness,windows-scheduled-task,windows-service-name,x509-fingerprint-sha1,x509-fingerprint-sha256,yara,zeek'.split(',');
  const openIds = new Set();
  let ctx;

  function sel(list, value, onChange) {
    const s = el('select'); const opts = list.includes(value) || !value ? list : [value, ...list];
    U.options(s, opts.map((x) => [x, x]), value); s.addEventListener('change', () => onChange(s.value)); return s;
  }
  function inp(value, onInput, cls, tag) {
    const i = el(tag || 'input', null, cls); i.value = value ?? ''; i.addEventListener('input', () => onInput(i.value)); return i;
  }

  function attrTable(list) {
    const rows = list.map((a) => {
      const to = el('input'); to.type = 'checkbox'; to.checked = a.to_ids; to.title = 'Use for detection (to_ids)';
      to.addEventListener('change', () => { a.to_ids = to.checked; ctx.touch(); });
      return [
        sel(TYPES, a.type, (v) => { a.type = v; ctx.touch(); }),
        inp(a.value, (v) => { a.value = v; ctx.touch(); }, 'compact', 'textarea'),
        sel(CATS, a.category, (v) => { a.category = v; ctx.touch(); }),
        inp(a.relation, (v) => { a.relation = v; ctx.touch(); }),
        inp(a.comment, (v) => { a.comment = v; ctx.touch(); }, 'compact', 'textarea'),
        inp(a.tags.join(', '), (v) => { a.tags = U.tags(v); ctx.touch(); }),
        to,
        button('Remove', 'danger small', () => { list.splice(list.indexOf(a), 1); ctx.changed('Attribute removed.'); })
      ];
    });
    const w = el('div', null, 'scroll'); w.append(U.table(['Type', 'Value', 'Category', 'Relation', 'Comment', 'Tags', 'IDS', ''], rows, 'No attributes.')); return w;
  }

  function entityCard(title, list, entity) {
    const d = el('details', null, 'entity'); const key = entity ? entity.id : 'root';
    d.open = openIds.has(key); d.addEventListener('toggle', () => (d.open ? openIds.add(key) : openIds.delete(key)));
    const sum = el('summary'); sum.append(el('b', title), el('span', ` ${list.length} attribute(s)`, 'muted')); d.append(sum);
    if (entity) {
      const g = el('div', null, 'edit');
      const lab = (t, node) => { const l = el('label', t); l.append(node); return l; };
      g.append(
        lab('Name / value', inp(entity.name, (v) => { entity.name = v; ctx.touch(); })),
        lab('Type', sel(ENTITY_TYPES, entity.type, (v) => { entity.type = v; ctx.touch(); })),
        lab('Confidence (0-100)', inp(entity.confidence, (v) => { const n = Number(v); entity.confidence = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 50; ctx.touch(); })),
        lab('Tags', inp(entity.tags.join(', '), (v) => { entity.tags = U.tags(v); ctx.touch(); })));
      const desc = lab('Description', inp(entity.description, (v) => { entity.description = v; ctx.touch(); }, '', 'textarea')); desc.classList.add('wide'); g.append(desc);
      d.append(g);
    }
    d.append(attrTable(list));
    const row = el('div', null, 'row');
    row.append(button('+ Attribute', '', () => { list.push(STSModel.normalizeAttr({ provenance: { method: 'manual', at: U.now() } })); openIds.add(key); ctx.changed('Attribute added.'); }));
    if (entity) row.append(button('Delete entity', 'danger', () => {
      if (!confirm(`Delete entity "${entity.name}" and its relationships?`)) return;
      const S = ctx.S; S.entities = S.entities.filter((x) => x !== entity);
      S.relationships = S.relationships.filter((r) => r.source_ref !== entity.id && r.target_ref !== entity.id);
      ctx.changed('Entity deleted.');
    }));
    d.append(row); return d;
  }

  function renderList() {
    const S = ctx.S, q = $('eFilter').value.toLowerCase();
    const match = (e, list) => !q || JSON.stringify([e || {}, list]).toLowerCase().includes(q);
    const cards = [];
    if (match(null, S.rootAttributes)) cards.push(entityCard('Case-level attributes', S.rootAttributes, null));
    for (const e of S.entities) if (match(e, e.attributes)) cards.push(entityCard(`${e.name} [${e.type}]`, e.attributes, e));
    $('eList').replaceChildren(...cards);
  }

  function renderRelationships() {
    const S = ctx.S;
    $('rList').replaceChildren(U.table(['Source', 'Relationship', 'Target', 'Confidence', 'First', 'Last', ''], S.relationships.map((r) => [
      ctx.entityName(r.source_ref), r.relationship_type, ctx.entityName(r.target_ref), r.confidence, r.first_observed, r.last_observed,
      button('Remove', 'danger small', () => { S.relationships.splice(S.relationships.indexOf(r), 1); ctx.changed('Relationship removed.'); })])));
  }

  IW.modules.push({
    name: 'Entities',
    init(c) {
      ctx = c;
      U.options($('eType'), ENTITY_TYPES.map((x) => [x, x]), 'host');
      $('eAdd').addEventListener('click', () => {
        const name = U.txt($('eName').value); if (!name) { ctx.status('Enter a name or value for the entity.', 'bad'); return; }
        const e = STSModel.normalizeEntity({ name, type: $('eType').value, description: U.txt($('eDesc').value), confidence: $('eConfidence').value, tags: $('eTags').value });
        ctx.S.entities.push(e); openIds.add(e.id); U.clear('eName', 'eDesc', 'eTags'); ctx.changed(`Entity "${name}" added.`);
      });
      $('eFilter').addEventListener('input', renderList);
      $('rAdd').addEventListener('click', () => {
        const a = $('rSource').value, b = $('rTarget').value;
        if (!a || !b) { ctx.status('Choose both a source and a target entity.', 'bad'); return; }
        if (a === b) { ctx.status('Source and target must be different entities.', 'bad'); return; }
        const n = Number($('rConfidence').value);
        ctx.S.relationships.push({ id: U.uid(), source_ref: a, target_ref: b, relationship_type: U.txt($('rType').value) || 'related-to', first_observed: $('rFirst').value, last_observed: $('rLast').value, confidence: Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 50, evidence_refs: [] });
        ctx.changed('Relationship added.');
      });
    },
    render() { renderList(); renderRelationships(); const o = ctx.entityOptions(); U.options($('rSource'), o); U.options($('rTarget'), o); }
  });
})();
