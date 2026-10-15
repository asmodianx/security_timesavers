'use strict';
/* Browser localStorage persistence: convenience/recovery only, not an evidence vault. */
(function () {
  const PREFIX = 'sts.iw.case.', INDEX = 'sts.iw.index.v1', LIMIT = 4 * 1024 * 1024;
  const ok = () => { try { const k = PREFIX + 'probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (_) { return false; } };
  const index = () => { try { const v = JSON.parse(localStorage.getItem(INDEX) || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
  const setIndex = (v) => localStorage.setItem(INDEX, JSON.stringify(v));
  function save(c) {
    if (!ok()) throw Error('Browser local storage is unavailable. Use Save case file.');
    const raw = JSON.stringify(c);
    if (raw.length > LIMIT) throw Error('Case exceeds the local autosave limit. Use Save case file.');
    const id = c.case?.id; if (!id) throw Error('Case ID is missing.');
    localStorage.setItem(PREFIX + id, raw);
    const a = index().filter((x) => x.id !== id);
    a.unshift({ id, title: c.case.title || 'Untitled case', case_number: c.case.case_number || '', modified: c.case.modified || new Date().toISOString() });
    setIndex(a.slice(0, 50));
    return raw.length;
  }
  function load(id) { const raw = localStorage.getItem(PREFIX + id); if (!raw) throw Error('Saved case not found.'); return Hardening.parseJSON(raw); }
  function remove(id) { localStorage.removeItem(PREFIX + id); setIndex(index().filter((x) => x.id !== id)); }
  function clear() { for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) localStorage.removeItem(k); localStorage.removeItem(INDEX); }
  window.STSStorage = { available: ok, save, load, list: index, remove, clear, latest: () => index()[0] || null };
})();
