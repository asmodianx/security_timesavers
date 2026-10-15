'use strict';
/* Hostile-input controls: size, depth, node-count and prototype-pollution screening. */
(function () {
  const BANNED = new Set(['__proto__', 'prototype', 'constructor']);
  const MAX_JSON = 4 * 1024 * 1024, MAX_CSV = 10 * 1024 * 1024, MAX_DEPTH = 32, MAX_NODES = 100000;
  function scan(value) {
    let nodes = 0;
    (function walk(v, d) {
      if (++nodes > MAX_NODES) throw Error('Imported data exceeds object-count limit.');
      if (d > MAX_DEPTH) throw Error('Imported data exceeds nesting-depth limit.');
      if (v && typeof v === 'object') for (const k of Object.keys(v)) {
        if (BANNED.has(k)) throw Error(`Rejected dangerous property: ${k}`);
        walk(v[k], d + 1);
      }
    })(value, 0);
    return value;
  }
  function parseJSON(text) {
    if (typeof text !== 'string') throw Error('Import must be text.');
    if (new Blob([text]).size > MAX_JSON) throw Error('JSON import exceeds 4 MiB safety limit.');
    return scan(JSON.parse(text));
  }
  function checkSize(file, max) { if (file.size > max) throw Error(`${file.name} exceeds the ${Math.round(max / 1048576)} MiB import limit.`); }
  function selfTest() {
    const out = [];
    const t = (name, fn, expectThrow) => { try { fn(); out.push({ name, pass: !expectThrow }); } catch (_) { out.push({ name, pass: !!expectThrow }); } };
    t('XSS string remains inert data', () => parseJSON('{"case":{"title":"<img src=x onerror=alert(1)>"}}'));
    t('__proto__ key rejected', () => parseJSON('{"__proto__":{"polluted":true}}'), true);
    t('constructor key rejected', () => parseJSON('{"constructor":{"prototype":{"x":1}}}'), true);
    t('Malformed JSON rejected', () => parseJSON('{bad'), true);
    t('Excessive nesting rejected', () => parseJSON('['.repeat(40) + '0' + ']'.repeat(40)), true);
    t('Object.prototype not polluted', () => { if ({}.polluted !== undefined) throw Error('polluted'); });
    return out;
  }
  window.Hardening = { parseJSON, scan, checkSize, selfTest, limits: { MAX_JSON, MAX_CSV, MAX_DEPTH, MAX_NODES } };
})();
