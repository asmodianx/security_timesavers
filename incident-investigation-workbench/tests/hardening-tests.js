'use strict';
/* Browser console: load after hardening.js, then run IWHardeningTests.run() */
window.IWHardeningTests = {
  cases: [
    { name: 'stored XSS text', input: '{"format":"security-timesavers-case","format_version":"1.0","case":{"id":"x","title":"<svg onload=alert(1)>"},"entities":[],"evidence":[]}', expect: 'accept-inert' },
    { name: 'prototype pollution', input: '{"__proto__":{"polluted":true}}', expect: 'reject' },
    { name: 'constructor prototype', input: '{"constructor":{"prototype":{"polluted":true}}}', expect: 'reject' },
    { name: 'malformed json', input: '{"x":', expect: 'reject' },
    { name: 'deep json', input: '['.repeat(40) + '0' + ']'.repeat(40), expect: 'reject' }
  ],
  run() { return this.cases.map((c) => { try { Hardening.parseJSON(c.input); return { name: c.name, pass: c.expect === 'accept-inert' }; } catch (_) { return { name: c.name, pass: c.expect === 'reject' }; } }); }
};
