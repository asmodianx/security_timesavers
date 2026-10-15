'use strict';
/* Shared DOM/data helpers. All dynamic text is written with textContent / text nodes. */
(function () {
  const U = {};
  U.$ = (id) => document.getElementById(id);
  U.uid = () => crypto.randomUUID();
  U.now = () => new Date().toISOString();
  U.txt = (v) => String(v ?? '').trim();
  U.tags = (v) => U.txt(v).split(',').map((x) => x.trim()).filter(Boolean);
  U.el = (tag, text, cls) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = String(text);
    return e;
  };
  U.button = (label, cls, onClick) => {
    const b = U.el('button', label, cls);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  };
  U.options = (select, items, keep) => {
    const prev = keep !== undefined ? keep : select.value;
    select.replaceChildren();
    for (const [v, l] of items) {
      const o = document.createElement('option');
      o.value = v; o.textContent = l; select.append(o);
    }
    if (items.some(([v]) => v === prev)) select.value = prev;
  };
  U.table = (headers, rows, emptyText) => {
    const t = U.el('table');
    const thead = U.el('thead'), hr = U.el('tr');
    headers.forEach((h) => hr.append(U.el('th', h)));
    thead.append(hr); t.append(thead);
    const tb = U.el('tbody');
    if (!rows.length) {
      const tr = U.el('tr'), td = U.el('td', emptyText || 'No records yet.', 'muted');
      td.colSpan = headers.length; tr.append(td); tb.append(tr);
    }
    for (const r of rows) {
      const tr = U.el('tr');
      for (const c of r) {
        const td = U.el('td');
        if (c instanceof Node) td.append(c); else td.textContent = String(c ?? '');
        tr.append(td);
      }
      tb.append(tr);
    }
    t.append(tb);
    return t;
  };
  U.download = (name, data, type) => {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  U.sha256 = async (buf) => {
    const d = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
  };
  U.safeName = (s) => U.txt(s).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'case';
  U.clear = (...ids) => ids.forEach((id) => { const e = U.$(id); if (!e) return; if (e.type === 'file') e.value = ''; else if (e.tagName === 'SELECT') e.selectedIndex = 0; else e.value = ''; });
  window.U = U;
  /* Module registry: feature modules register here; app.js initialises them in order. */
  window.IW = window.IW || { modules: [] };
})();
/* Local wall-clock time in datetime-local format (matches values typed into datetime-local inputs). */
U.localNow = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
/* Two-way binding of a form control to obj()[key]; obj is a getter because the case object can be replaced. */
U.bindField = (ctx, id, obj, key) => {
  const e = U.$(id);
  e.addEventListener(e.tagName === 'SELECT' || e.type === 'checkbox' ? 'change' : 'input', () => { obj()[key] = e.value; ctx.touch(); });
  return () => { if (document.activeElement === e) return; e.value = obj()[key] || ''; if (e.tagName === 'SELECT' && e.value !== (obj()[key] || '')) e.selectedIndex = 0; };
};
U.statusSelect = (ctx, o, k, values, after) => { const s = U.el('select'); U.options(s, values.map((v) => [v, v]), o[k]); s.addEventListener('change', () => { o[k] = s.value; o.modified = U.now(); if (after) after(o); ctx.changed(); }); return s; };
U.noteField = (ctx, o, k) => { const t = U.el('textarea', null, 'compact'); t.value = o[k] || ''; t.addEventListener('input', () => { o[k] = t.value; o.modified = U.now(); ctx.touch(); }); return t; };
