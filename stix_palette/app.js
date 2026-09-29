/**
 * app.js — STIX Palette v2 Main Application
 * Standalone HTML/JS · No CDN · OWASP Best Practices
 *
 * OWASP Controls:
 *  - No innerHTML with user data (textContent / DOM APIs only)
 *  - Input validation & sanitization on all fields
 *  - CSP header set in HTML meta tag
 *  - JSON.parse wrapped in try/catch; output sanitized
 *  - No eval(), no Function(), no setTimeout(string)
 *  - XSS-safe DOM manipulation throughout
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════════ */
const STATE = {
  objects: new Map(),     // id -> stix object
  edges: new Map(),       // id -> { id, source, target, data }
  nodes: new Map(),       // id -> { x, y, vx, vy, width, height, el }
  edgeEls: new Map(),     // id -> SVG element
  selected: null,         // { type: 'node'|'edge', id }
  transform: { x: 0, y: 0, k: 1 },
  gravity: { running: false, timer: null },
  drawingEdge: null,      // { sourceId, ghostLine }
  dragState: null,
  panState: null,
  selBoxState: null,
};

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════ */
const NODE_W = 140;
const NODE_H = 80;
const GRAVITY_ALPHA = 0.08;
const GRAVITY_DAMPING = 0.85;
const REPULSION = 18000;
const LINK_DISTANCE = 220;
const MINIMAP_W = 160;
const MINIMAP_H = 120;

/* ═══════════════════════════════════════════════════════════════════
   UTILITY — OWASP-SAFE DOM HELPERS
═══════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

/** Safe text node setter — never uses innerHTML */
function setText(el, text) {
  if (!el) return;
  el.textContent = String(text ?? '');
}

/** Create element with optional attributes (no innerHTML) */
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  }
  return e;
}

/** Create SVG element */
function svgEl(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

/** Sanitize string for display — strips any HTML tags */
function sanitizeStr(v) {
  if (v == null) return '';
  return String(v).replace(/[<>"'&]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','&':'&amp;'}[c]));
}

/** Generate STIX 2.1 compliant UUID */
function stixId(type) {
  const hex = () => Math.random().toString(16).slice(2).padStart(8,'0');
  return `${type}--${hex()}-${hex().slice(0,4)}-4${hex().slice(1,4)}-${(8+Math.floor(Math.random()*4)).toString(16)}${hex().slice(0,3)}-${hex()}${hex().slice(0,4)}`;
}

/** ISO timestamp */
function nowISO() { return new Date().toISOString().replace(/\.\d+Z$/, '.000Z'); }

/** Clamp number */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** Show toast notification */
function toast(msg, type = 'info', duration = 3000) {
  const t = el('div', { class: `toast ${type}` });
  t.textContent = msg;
  $('toast-container').appendChild(t);
  requestAnimationFrame(() => { t.classList.add('show'); });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 220);
  }, duration);
}

/* ═══════════════════════════════════════════════════════════════════
   STIX OBJECT FACTORY
═══════════════════════════════════════════════════════════════════ */
function createStixObject(type) {
  const schema = STIX_SCHEMA.ALL_TYPES_MAP[type];
  if (!schema) return null;
  const now = nowISO();
  const base = {
    type,
    spec_version: '2.1',
    id: stixId(type),
    created: now,
    modified: now,
  };
  // Add required field defaults
  if (schema.fields) {
    for (const f of schema.fields) {
      if (f.required) {
        if (f.type === 'boolean') base[f.key] = false;
        else if (f.type === 'number') base[f.key] = 0;
        else if (f.type === 'tags') base[f.key] = [];
        else if (f.key !== 'source_ref' && f.key !== 'target_ref') base[f.key] = '';
      }
    }
  }
  return base;
}

/* ═══════════════════════════════════════════════════════════════════
   CANVAS / VIEWPORT
═══════════════════════════════════════════════════════════════════ */
const canvas = $('canvas');
const root = $('canvas-root');
const edgesLayer = $('edges-layer');
const nodesLayer = $('nodes-layer');

function applyTransform() {
  const { x, y, k } = STATE.transform;
  root.setAttribute('transform', `translate(${x},${y}) scale(${k})`);
  setText($('zoom-label'), `${Math.round(k * 100)}%`);
  drawMinimap();
}

function screenToCanvas(sx, sy) {
  const { x, y, k } = STATE.transform;
  const r = canvas.getBoundingClientRect();
  return { x: (sx - r.left - x) / k, y: (sy - r.top - y) / k };
}

function canvasToScreen(cx, cy) {
  const { x, y, k } = STATE.transform;
  const r = canvas.getBoundingClientRect();
  return { x: cx * k + x + r.left, y: cy * k + y + r.top };
}

function zoomTo(newK, pivotX, pivotY) {
  const { x, y, k } = STATE.transform;
  const bounded = clamp(newK, 0.1, 4);
  const ratio = bounded / k;
  STATE.transform.x = pivotX - ratio * (pivotX - x);
  STATE.transform.y = pivotY - ratio * (pivotY - y);
  STATE.transform.k = bounded;
  applyTransform();
}

function fitToScreen() {
  if (STATE.nodes.size === 0) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  STATE.nodes.forEach(n => {
    minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W); maxY = Math.max(maxY, n.y + NODE_H);
  });
  const r = canvas.getBoundingClientRect();
  const pad = 60;
  const kx = (r.width - pad * 2) / (maxX - minX || 1);
  const ky = (r.height - pad * 2) / (maxY - minY || 1);
  const k = clamp(Math.min(kx, ky), 0.1, 2);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  STATE.transform = { x: r.width / 2 - cx * k, y: r.height / 2 - cy * k, k };
  applyTransform();
}

/* ═══════════════════════════════════════════════════════════════════
   MINIMAP
═══════════════════════════════════════════════════════════════════ */
function drawMinimap() {
  const mc = $('minimap');
  const ctx = mc.getContext('2d');
  ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, MINIMAP_W, MINIMAP_H);

  if (STATE.nodes.size === 0) return;

  // World bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  STATE.nodes.forEach(n => {
    minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W); maxY = Math.max(maxY, n.y + NODE_H);
  });
  const ww = (maxX - minX) || 200;
  const wh = (maxY - minY) || 200;
  const scale = Math.min(MINIMAP_W / ww, MINIMAP_H / wh) * 0.85;
  const offX = (MINIMAP_W - ww * scale) / 2;
  const offY = (MINIMAP_H - wh * scale) / 2;

  // Draw edges
  ctx.strokeStyle = 'rgba(127,207,255,0.35)';
  ctx.lineWidth = 1;
  STATE.edges.forEach(edge => {
    const s = STATE.nodes.get(edge.source);
    const t = STATE.nodes.get(edge.target);
    if (!s || !t) return;
    ctx.beginPath();
    ctx.moveTo((s.x + NODE_W / 2 - minX) * scale + offX, (s.y + NODE_H / 2 - minY) * scale + offY);
    ctx.lineTo((t.x + NODE_W / 2 - minX) * scale + offX, (t.y + NODE_H / 2 - minY) * scale + offY);
    ctx.stroke();
  });

  // Draw nodes
  STATE.nodes.forEach((n, id) => {
    const obj = STATE.objects.get(id);
    const cat = obj ? (STIX_SCHEMA.ALL_TYPES_MAP[obj.type]?.category || 'sdo') : 'sdo';
    const colors = { sdo: '#4fc3f7', sro: '#81c784', sco: '#ce93d8', meta: '#ffb74d' };
    ctx.fillStyle = colors[cat] || '#4fc3f7';
    ctx.globalAlpha = STATE.selected?.id === id ? 1 : 0.7;
    const rx = (n.x - minX) * scale + offX;
    const ry = (n.y - minY) * scale + offY;
    ctx.fillRect(rx, ry, NODE_W * scale, NODE_H * scale * 0.6);
    ctx.globalAlpha = 1;
  });

  // Viewport indicator
  const r = canvas.getBoundingClientRect();
  const { x, y, k } = STATE.transform;
  const vpX = (-x / k - minX) * scale + offX;
  const vpY = (-y / k - minY) * scale + offY;
  const vpW = (r.width / k) * scale;
  const vpH = (r.height / k) * scale;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(vpX, vpY, vpW, vpH);
}

/* ═══════════════════════════════════════════════════════════════════
   NODE RENDERING
═══════════════════════════════════════════════════════════════════ */
function getNodeColors(category) {
  return STIX_SCHEMA.COLORS[category] || STIX_SCHEMA.COLORS.sdo;
}

function getDisplayName(obj) {
  if (!obj) return 'Unknown';
  return obj.name || obj.value || obj.subject || obj.key || obj.product ||
         obj.user_id || obj.account_login || obj.number?.toString() ||
         obj.relationship_type || obj.type;
}

function renderNode(id) {
  const obj = STATE.objects.get(id);
  const node = STATE.nodes.get(id);
  if (!obj || !node) return;

  const schema = STIX_SCHEMA.ALL_TYPES_MAP[obj.type];
  const cat = schema?.category || 'sdo';
  const colors = getNodeColors(cat);
  const icon = schema?.icon || '◈';
  const label = schema?.label || obj.type;
  const displayName = getDisplayName(obj);
  const isSelected = STATE.selected?.id === id;

  // Remove existing
  const existing = nodesLayer.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (existing) existing.remove();

  const g = svgEl('g', { class: `stix-node${isSelected ? ' selected' : ''}`, 'data-id': id });

  // Background
  const bg = svgEl('rect', {
    class: 'node-bg',
    x: node.x, y: node.y,
    width: NODE_W, height: NODE_H,
    fill: colors.bg,
    stroke: colors.border,
    'stroke-width': isSelected ? '2.5' : '1.5',
    rx: '8', ry: '8',
    filter: isSelected ? 'url(#shadow-selected)' : 'url(#shadow)',
  });
  g.appendChild(bg);

  // Category strip (top bar)
  const strip = svgEl('rect', {
    x: node.x, y: node.y,
    width: NODE_W, height: '14',
    fill: colors.border, rx: '8', ry: '8',
    opacity: '0.7',
  });
  g.appendChild(strip);
  const strip2 = svgEl('rect', { x: node.x, y: node.y + 6, width: NODE_W, height: '8', fill: colors.border, opacity: '0.7' });
  g.appendChild(strip2);

  // Type label in strip
  const typeLabel = svgEl('text', { class: 'node-type-label', x: node.x + NODE_W / 2, y: node.y + 10, 'text-anchor': 'middle' });
  typeLabel.textContent = obj.type;
  g.appendChild(typeLabel);

  // Icon
  const iconEl = svgEl('text', { class: 'node-icon', x: node.x + 18, y: node.y + 44, 'text-anchor': 'middle', fill: colors.border });
  iconEl.textContent = icon;
  g.appendChild(iconEl);

  // Label (friendly name)
  const labelEl = svgEl('text', { class: 'node-name', x: node.x + 34, y: node.y + 38, 'text-anchor': 'start', fill: colors.text });
  labelEl.textContent = truncate(label, 14);
  g.appendChild(labelEl);

  // Display name / value
  const nameEl = svgEl('text', { class: 'node-subname', x: node.x + 34, y: node.y + 52, 'text-anchor': 'start' });
  nameEl.textContent = truncate(displayName, 16);
  g.appendChild(nameEl);

  // Labels/tags count badge
  if (obj.labels && obj.labels.length) {
    const badge = svgEl('rect', { x: node.x + NODE_W - 28, y: node.y + 56, width: 24, height: 14, rx: '4', fill: colors.border, opacity: '0.6' });
    g.appendChild(badge);
    const badgeTxt = svgEl('text', { x: node.x + NODE_W - 16, y: node.y + 66, 'text-anchor': 'middle', 'font-size': '9', fill: '#fff' });
    badgeTxt.textContent = obj.labels.length + '🏷';
    g.appendChild(badgeTxt);
  }

  // Connect handle (right edge)
  const handle = svgEl('circle', {
    class: 'connect-handle',
    cx: node.x + NODE_W,
    cy: node.y + NODE_H / 2,
    r: '5',
    'data-nodeid': id,
  });
  g.appendChild(handle);

  // Event listeners
  g.addEventListener('mousedown', e => onNodeMouseDown(e, id));
  g.addEventListener('click', e => { e.stopPropagation(); selectObject('node', id); });
  handle.addEventListener('mousedown', e => { e.stopPropagation(); startDrawEdge(e, id); });

  nodesLayer.appendChild(g);
  STATE.nodes.get(id).el = g;
}

function truncate(str, maxLen) {
  if (!str) return '';
  const s = String(str);
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
}

function updateNodePosition(id) {
  const node = STATE.nodes.get(id);
  if (!node) return;
  const g = nodesLayer.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (!g) return;

  const rects = g.querySelectorAll('rect');
  const circles = g.querySelectorAll('circle');
  const texts = g.querySelectorAll('text');

  // Update positions based on known layout
  renderNode(id); // full re-render on position change for accuracy
}

/* ═══════════════════════════════════════════════════════════════════
   EDGE RENDERING
═══════════════════════════════════════════════════════════════════ */
function renderEdge(edgeId) {
  const edge = STATE.edges.get(edgeId);
  if (!edge) return;

  const src = STATE.nodes.get(edge.source);
  const tgt = STATE.nodes.get(edge.target);
  if (!src || !tgt) return;

  const existing = edgesLayer.querySelector(`[data-eid="${CSS.escape(edgeId)}"]`);
  if (existing) existing.remove();

  const isSighting = edge.data?.type === 'sighting';
  const isSelected = STATE.selected?.id === edgeId;
  const relType = edge.data?.relationship_type || edge.data?.type || 'related';

  const g = svgEl('g', {
    class: `stix-edge${isSighting ? ' sighting' : ''}${isSelected ? ' selected' : ''}`,
    'data-eid': edgeId,
  });

  // Compute edge path (curved bezier between node centers)
  const x1 = src.x + NODE_W;
  const y1 = src.y + NODE_H / 2;
  const x2 = tgt.x;
  const y2 = tgt.y + NODE_H / 2;
  const dx = x2 - x1;
  const cx1 = x1 + dx * 0.5;
  const cy1 = y1;
  const cx2 = x2 - dx * 0.5;
  const cy2 = y2;

  const path = svgEl('path', {
    class: 'edge-line',
    d: `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`,
    'marker-end': isSighting ? 'url(#arrow-sighting)' : 'url(#arrow)',
    stroke: isSelected ? '#4fc3f7' : (isSighting ? '#ffe082' : '#7ecfff'),
    'stroke-width': isSelected ? '2.5' : '1.5',
  });
  g.appendChild(path);

  // Invisible hit area
  const hitPath = svgEl('path', {
    d: `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`,
    stroke: 'transparent', 'stroke-width': '14', fill: 'none', cursor: 'pointer',
  });
  g.appendChild(hitPath);

  // Label
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const labelText = truncate(relType, 18);
  const lw = labelText.length * 5.5 + 8;

  const labelBg = svgEl('rect', {
    class: 'edge-label-bg',
    x: mx - lw / 2, y: my - 9,
    width: lw, height: 14, rx: '3', ry: '3',
  });
  g.appendChild(labelBg);

  const label = svgEl('text', {
    class: 'edge-label',
    x: mx, y: my + 1,
    'text-anchor': 'middle',
  });
  label.textContent = labelText;
  g.appendChild(label);

  g.addEventListener('click', e => { e.stopPropagation(); selectObject('edge', edgeId); });
  edgesLayer.appendChild(g);
  STATE.edgeEls.set(edgeId, g);
}

function updateAllEdgesForNode(nodeId) {
  STATE.edges.forEach((edge, eid) => {
    if (edge.source === nodeId || edge.target === nodeId) renderEdge(eid);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   SELECTION & PROPERTIES PANEL
═══════════════════════════════════════════════════════════════════ */
function selectObject(type, id) {
  // Deselect previous
  if (STATE.selected) {
    const prev = STATE.selected;
    if (prev.type === 'node') {
      const n = STATE.nodes.get(prev.id);
      if (n) renderNode(prev.id);
    } else {
      const e = STATE.edges.get(prev.id);
      if (e) renderEdge(prev.id);
    }
  }

  STATE.selected = { type, id };

  if (type === 'node') renderNode(id);
  else renderEdge(id);

  showProperties(type, id);
}

function deselect() {
  if (!STATE.selected) return;
  const prev = STATE.selected;
  STATE.selected = null;
  if (prev.type === 'node') renderNode(prev.id);
  else renderEdge(prev.id);
  hideProperties();
}

function showProperties(type, id) {
  const propsContent = $('props-content');
  const propsActions = $('props-actions');
  propsContent.textContent = ''; // OWASP: clear safely

  if (type === 'node') {
    const obj = STATE.objects.get(id);
    if (!obj) return;
    const schema = STIX_SCHEMA.ALL_TYPES_MAP[obj.type];
    const cat = schema?.category || 'sdo';

    setText($('props-title'), schema?.label || obj.type);

    // Type badge
    const badge = el('span', { class: `type-badge ${cat}` });
    badge.textContent = `${schema?.icon || '◈'} ${obj.type}`;
    propsContent.appendChild(badge);

    // Object ID (readonly)
    const idSection = el('div', { class: 'props-section' });
    idSection.appendChild(el('div', { class: 'props-section-header' }, 'Identity'));
    addReadonlyField(idSection, 'ID', obj.id);
    addReadonlyField(idSection, 'Created', obj.created || '');
    addReadonlyField(idSection, 'Modified', obj.modified || '');
    addReadonlyField(idSection, 'Spec Version', obj.spec_version || '2.1');
    propsContent.appendChild(idSection);

    // Core fields
    if (schema?.fields?.length) {
      const coreSection = el('div', { class: 'props-section' });
      coreSection.appendChild(el('div', { class: 'props-section-header' }, 'Core Properties'));
      for (const field of schema.fields) {
        if (['source_ref', 'target_ref', 'sighting_of_ref'].includes(field.key)) {
          addReadonlyField(coreSection, field.label, obj[field.key] || '');
        } else {
          buildFieldInput(coreSection, field, obj);
        }
      }
      propsContent.appendChild(coreSection);
    }

    // Common fields
    const commonSection = el('div', { class: 'props-section' });
    commonSection.appendChild(el('div', { class: 'props-section-header' }, 'Common Properties'));
    for (const field of STIX_SCHEMA.COMMON_FIELDS) {
      buildFieldInput(commonSection, field, obj);
    }
    propsContent.appendChild(commonSection);

  } else {
    // Edge
    const edge = STATE.edges.get(id);
    if (!edge) return;
    const obj = edge.data;
    const schema = STIX_SCHEMA.ALL_TYPES_MAP[obj?.type];

    setText($('props-title'), schema?.label || 'Relationship');

    const badge = el('span', { class: 'type-badge sro' });
    badge.textContent = `${schema?.icon || '↔'} ${obj?.type || 'relationship'}`;
    propsContent.appendChild(badge);

    const idSection = el('div', { class: 'props-section' });
    idSection.appendChild(el('div', { class: 'props-section-header' }, 'Identity'));
    addReadonlyField(idSection, 'ID', obj?.id || id);
    addReadonlyField(idSection, 'Created', obj?.created || '');
    addReadonlyField(idSection, 'Modified', obj?.modified || '');
    propsContent.appendChild(idSection);

    const coreSection = el('div', { class: 'props-section' });
    coreSection.appendChild(el('div', { class: 'props-section-header' }, 'Relationship Properties'));
    addReadonlyField(coreSection, 'Source', edge.source);
    addReadonlyField(coreSection, 'Target', edge.target);

    if (schema?.fields) {
      for (const field of schema.fields) {
        if (['source_ref', 'target_ref', 'sighting_of_ref'].includes(field.key)) continue;
        buildFieldInput(coreSection, field, obj);
      }
    }
    propsContent.appendChild(coreSection);

    // Common fields for SRO
    const commonSection = el('div', { class: 'props-section' });
    commonSection.appendChild(el('div', { class: 'props-section-header' }, 'Common Properties'));
    for (const field of STIX_SCHEMA.COMMON_FIELDS) {
      buildFieldInput(commonSection, field, obj);
    }
    propsContent.appendChild(commonSection);
  }

  propsActions.style.display = 'flex';
}

function addReadonlyField(parent, label, value) {
  const row = el('div', { class: 'field-row' });
  row.appendChild(el('div', { class: 'field-label' }, label));
  const d = el('div', { class: 'object-id-display' });
  d.textContent = String(value);
  row.appendChild(d);
  parent.appendChild(row);
}

function buildFieldInput(parent, field, obj) {
  const row = el('div', { class: 'field-row', 'data-field': field.key });
  const labelEl = el('div', { class: 'field-label' });
  labelEl.textContent = field.label;
  if (field.required) {
    const star = el('span', { class: 'required-star' });
    star.textContent = ' *';
    labelEl.appendChild(star);
  }
  row.appendChild(labelEl);

  const val = obj[field.key];

  switch (field.type) {
    case 'text':
    case 'number':
    case 'datetime': {
      const inp = el('input', { class: 'field-value', type: field.type === 'number' ? 'number' : 'text', 'data-key': field.key });
      inp.value = val ?? (field.default ?? '');
      inp.addEventListener('change', () => onFieldChange(field, inp.value, obj));
      row.appendChild(inp);
      break;
    }
    case 'textarea': {
      const ta = el('textarea', { class: 'field-value', 'data-key': field.key, rows: '3' });
      ta.value = val ?? '';
      ta.addEventListener('change', () => onFieldChange(field, ta.value, obj));
      row.appendChild(ta);
      break;
    }
    case 'select': {
      const sel = el('select', { class: 'field-value', 'data-key': field.key });
      const blankOpt = el('option', { value: '' });
      blankOpt.textContent = '— select —';
      sel.appendChild(blankOpt);
      for (const opt of (field.options || [])) {
        const o = el('option', { value: opt });
        o.textContent = opt;
        if (val === opt) o.selected = true;
        sel.appendChild(o);
      }
      sel.addEventListener('change', () => onFieldChange(field, sel.value, obj));
      row.appendChild(sel);
      break;
    }
    case 'boolean': {
      const wrapper = el('div', { class: 'field-bool' });
      const cb = el('input', { type: 'checkbox', 'data-key': field.key });
      cb.checked = !!val;
      cb.addEventListener('change', () => onFieldChange(field, cb.checked, obj));
      const lbl = el('label');
      lbl.textContent = field.label;
      wrapper.appendChild(cb);
      wrapper.appendChild(lbl);
      row.appendChild(wrapper);
      break;
    }
    case 'tags': {
      const container = buildTagsInput(field, val || [], obj);
      row.appendChild(container);
      break;
    }
    case 'json': {
      const wrapper = el('div', { class: 'json-field' });
      const ta = el('textarea', { class: 'field-value', 'data-key': field.key, rows: '4' });
      try { ta.value = val ? JSON.stringify(val, null, 2) : ''; } catch { ta.value = ''; }
      ta.addEventListener('change', () => {
        try {
          const parsed = ta.value.trim() ? JSON.parse(ta.value) : null;
          ta.classList.remove('invalid');
          onFieldChange(field, parsed, obj);
        } catch {
          ta.classList.add('invalid');
          toast('Invalid JSON', 'error');
        }
      });
      wrapper.appendChild(ta);
      row.appendChild(wrapper);
      break;
    }
    case 'kill_chain': {
      row.appendChild(buildKillChainInput(field, val || [], obj));
      break;
    }
    case 'ext_refs': {
      row.appendChild(buildExtRefsInput(field, val || [], obj));
      break;
    }
  }
  parent.appendChild(row);
}

function buildTagsInput(field, currentTags, obj) {
  const container = el('div', { class: 'tags-container', 'data-key': field.key });
  const renderTags = () => {
    container.textContent = '';
    const tags = obj[field.key] || [];
    for (let i = 0; i < tags.length; i++) {
      const chip = el('span', { class: 'tag-chip' });
      chip.textContent = String(tags[i]);
      const rem = el('span', { class: 'tag-remove' });
      rem.textContent = '✕';
      rem.title = 'Remove';
      const idx = i;
      rem.addEventListener('click', () => {
        obj[field.key].splice(idx, 1);
        renderTags();
      });
      chip.appendChild(rem);
      container.appendChild(chip);
    }
    const inp = el('input', { class: 'tags-input', placeholder: 'Add…', type: 'text' });
    inp.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) {
        e.preventDefault();
        if (!obj[field.key]) obj[field.key] = [];
        obj[field.key].push(sanitizeStr(inp.value.trim()));
        inp.value = '';
        renderTags();
      } else if (e.key === 'Backspace' && !inp.value && obj[field.key]?.length) {
        obj[field.key].pop();
        renderTags();
      }
    });
    container.appendChild(inp);
  };
  if (!obj[field.key]) obj[field.key] = [...currentTags];
  renderTags();
  return container;
}

function buildKillChainInput(field, current, obj) {
  const wrapper = el('div');
  if (!obj[field.key]) obj[field.key] = [...current];
  const render = () => {
    wrapper.textContent = '';
    const phases = obj[field.key] || [];
    for (let i = 0; i < phases.length; i++) {
      const row = el('div', { class: 'kill-chain-row' });
      const kn = el('input', { class: 'field-value', type: 'text', placeholder: 'Kill chain name' });
      kn.value = phases[i].kill_chain_name || '';
      kn.addEventListener('change', () => { phases[i].kill_chain_name = kn.value; });
      const pn = el('input', { class: 'field-value', type: 'text', placeholder: 'Phase name' });
      pn.value = phases[i].phase_name || '';
      pn.addEventListener('change', () => { phases[i].phase_name = pn.value; });
      const rem = el('button', { class: 'kill-chain-add' });
      rem.textContent = '✕';
      const idx = i;
      rem.addEventListener('click', () => { phases.splice(idx, 1); render(); });
      row.appendChild(kn); row.appendChild(pn); row.appendChild(rem);
      wrapper.appendChild(row);
    }
    const addBtn = el('button', { class: 'kill-chain-add' });
    addBtn.textContent = '+ Add Phase';
    addBtn.addEventListener('click', () => {
      if (!obj[field.key]) obj[field.key] = [];
      obj[field.key].push({ kill_chain_name: '', phase_name: '' });
      render();
    });
    wrapper.appendChild(addBtn);
  };
  render();
  return wrapper;
}

function buildExtRefsInput(field, current, obj) {
  const wrapper = el('div');
  if (!obj[field.key]) obj[field.key] = [...current];
  const render = () => {
    wrapper.textContent = '';
    const refs = obj[field.key] || [];
    for (let i = 0; i < refs.length; i++) {
      const grp = el('div', { class: 'ext-ref-group' });
      const sn = el('input', { class: 'field-value', type: 'text', placeholder: 'Source name' });
      sn.value = refs[i].source_name || '';
      sn.addEventListener('change', () => { refs[i].source_name = sn.value; });
      const url = el('input', { class: 'field-value', type: 'text', placeholder: 'URL' });
      url.value = refs[i].url || '';
      url.addEventListener('change', () => { refs[i].url = url.value; });
      const eid = el('input', { class: 'field-value', type: 'text', placeholder: 'External ID (e.g. CVE-...)' });
      eid.value = refs[i].external_id || '';
      eid.addEventListener('change', () => { refs[i].external_id = eid.value; });
      const rem = el('button', { class: 'kill-chain-add' });
      rem.textContent = '✕ Remove';
      const idx = i;
      rem.addEventListener('click', () => { refs.splice(idx, 1); render(); });
      grp.appendChild(sn); grp.appendChild(url); grp.appendChild(eid); grp.appendChild(rem);
      wrapper.appendChild(grp);
    }
    const addBtn = el('button', { class: 'kill-chain-add' });
    addBtn.textContent = '+ Add Reference';
    addBtn.addEventListener('click', () => {
      if (!obj[field.key]) obj[field.key] = [];
      obj[field.key].push({ source_name: '', url: '', external_id: '' });
      render();
    });
    wrapper.appendChild(addBtn);
  };
  render();
  return wrapper;
}

function onFieldChange(field, value, obj) {
  const now = nowISO();
  if (field.type === 'number') {
    const n = parseFloat(value);
    obj[field.key] = isNaN(n) ? 0 : n;
  } else {
    obj[field.key] = value;
  }
  if (obj.modified !== undefined) obj.modified = now;

  // Re-render node if name changed
  if (['name', 'value', 'relationship_type', 'type', 'product', 'number', 'key', 'user_id'].includes(field.key)) {
    const nodeId = obj.id;
    if (STATE.nodes.has(nodeId)) {
      renderNode(nodeId);
      updateAllEdgesForNode(nodeId);
    } else {
      // It's an edge object
      STATE.edges.forEach((edge, eid) => {
        if (edge.data?.id === obj.id) renderEdge(eid);
      });
    }
  }
}

function hideProperties() {
  const propsContent = $('props-content');
  propsContent.textContent = '';
  const emptyState = el('div', { class: 'empty-state' });
  const span = el('span');
  span.textContent = 'Click an object or relationship\nto view and edit its properties.';
  emptyState.appendChild(span);
  propsContent.appendChild(emptyState);
  $('props-actions').style.display = 'none';
  setText($('props-title'), 'Properties');
}

/* ═══════════════════════════════════════════════════════════════════
   ADD / REMOVE OBJECTS
═══════════════════════════════════════════════════════════════════ */
function addObjectToCanvas(type, cx, cy) {
  const obj = createStixObject(type);
  if (!obj) { toast('Unknown type: ' + type, 'error'); return null; }

  STATE.objects.set(obj.id, obj);
  STATE.nodes.set(obj.id, { x: cx - NODE_W / 2, y: cy - NODE_H / 2, vx: 0, vy: 0 });
  renderNode(obj.id);
  drawMinimap();
  return obj.id;
}

function removeSelected() {
  if (!STATE.selected) return;
  const { type, id } = STATE.selected;
  STATE.selected = null;

  if (type === 'node') {
    // Remove connected edges
    STATE.edges.forEach((edge, eid) => {
      if (edge.source === id || edge.target === id) {
        const eEl = edgesLayer.querySelector(`[data-eid="${CSS.escape(eid)}"]`);
        if (eEl) eEl.remove();
        STATE.edges.delete(eid);
        STATE.edgeEls.delete(eid);
        STATE.objects.delete(eid);
      }
    });
    const nodeEl = nodesLayer.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (nodeEl) nodeEl.remove();
    STATE.nodes.delete(id);
    STATE.objects.delete(id);
    toast('Object deleted', 'warn');
  } else {
    const eEl = edgesLayer.querySelector(`[data-eid="${CSS.escape(id)}"]`);
    if (eEl) eEl.remove();
    STATE.edges.delete(id);
    STATE.edgeEls.delete(id);
    STATE.objects.delete(id);
    toast('Relationship deleted', 'warn');
  }

  hideProperties();
  drawMinimap();
}

/* ═══════════════════════════════════════════════════════════════════
   EDGE DRAWING
═══════════════════════════════════════════════════════════════════ */
function startDrawEdge(e, sourceId) {
  e.preventDefault();
  const src = STATE.nodes.get(sourceId);
  if (!src) return;

  canvas.classList.add('draw-edge-cursor');

  const ghost = svgEl('line', {
    id: 'edge-ghost',
    x1: src.x + NODE_W, y1: src.y + NODE_H / 2,
    x2: src.x + NODE_W, y2: src.y + NODE_H / 2,
    stroke: '#7ecfff', 'stroke-width': '1.5', 'stroke-dasharray': '6 3',
  });
  root.appendChild(ghost);

  STATE.drawingEdge = { sourceId, ghost };

  const onMove = ev => {
    if (!STATE.drawingEdge) return;
    const cp = screenToCanvas(ev.clientX, ev.clientY);
    ghost.setAttribute('x2', cp.x);
    ghost.setAttribute('y2', cp.y);
  };
  const onUp = ev => {
    if (!STATE.drawingEdge) return;
    ghost.remove();
    canvas.classList.remove('draw-edge-cursor');

    const target = ev.target.closest('[data-id]');
    if (target) {
      const targetId = target.getAttribute('data-id');
      if (targetId && targetId !== sourceId) {
        promptRelationship(sourceId, targetId);
      }
    }
    STATE.drawingEdge = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

/* ═══════════════════════════════════════════════════════════════════
   RELATIONSHIP MODAL
═══════════════════════════════════════════════════════════════════ */
function promptRelationship(sourceId, targetId) {
  const srcObj = STATE.objects.get(sourceId);
  const tgtObj = STATE.objects.get(targetId);
  if (!srcObj || !tgtObj) return;

  const overlay = $('modal-overlay');
  const body = $('modal-body');
  body.textContent = '';

  setText($('modal-title'), 'Create Relationship');

  // Source / target info
  const info = el('div', { style: 'margin-bottom:12px;font-size:12px;color:var(--text-secondary)' });
  info.textContent = `From: ${srcObj.type} → To: ${tgtObj.type}`;
  body.appendChild(info);

  // Type selector
  const typeRow = el('div', { class: 'field-row' });
  typeRow.appendChild(el('div', { class: 'field-label' }, 'Relationship Type'));

  const relTypes = [
    'relationship', 'sighting'
  ];

  const typeSelect = el('select', { class: 'field-value' });
  for (const t of relTypes) {
    const o = el('option', { value: t });
    o.textContent = t;
    typeSelect.appendChild(o);
  }
  typeRow.appendChild(typeSelect);
  body.appendChild(typeRow);

  // Relationship type (if relationship)
  const relTypeRow = el('div', { class: 'field-row', id: 'rel-type-row' });
  relTypeRow.appendChild(el('div', { class: 'field-label' }, 'Relationship Type Label'));
  const relTypeInput = el('select', { class: 'field-value', id: 'rel-type-input' });
  const commonRels = [
    'attributed-to','authored-by','beacons-to','belongs-to','communicates-with',
    'compromises','controls','cooperates-with','derived-from','downloads','drops',
    'exploits','has','hosts','impersonates','indicates','investigates',
    'is-related-to','located-at','mitigates','originates-from','owns',
    'remediates','targets','threatens','uses','variant-of',
  ];
  for (const r of commonRels) {
    const o = el('option', { value: r });
    o.textContent = r;
    relTypeInput.appendChild(o);
  }
  relTypeRow.appendChild(relTypeInput);
  body.appendChild(relTypeRow);

  // Description
  const descRow = el('div', { class: 'field-row' });
  descRow.appendChild(el('div', { class: 'field-label' }, 'Description (optional)'));
  const descInput = el('textarea', { class: 'field-value', rows: '2' });
  descRow.appendChild(descInput);
  body.appendChild(descRow);

  typeSelect.addEventListener('change', () => {
    relTypeRow.style.display = typeSelect.value === 'relationship' ? '' : 'none';
  });

  overlay.classList.remove('hidden');

  const confirm = () => {
    const rType = typeSelect.value;
    let edgeObj;
    const now = nowISO();

    if (rType === 'sighting') {
      edgeObj = {
        type: 'sighting', spec_version: '2.1',
        id: stixId('sighting'),
        created: now, modified: now,
        sighting_of_ref: sourceId,
        where_sighted_refs: [targetId],
        description: descInput.value.trim(),
        count: 1,
      };
    } else {
      edgeObj = {
        type: 'relationship', spec_version: '2.1',
        id: stixId('relationship'),
        created: now, modified: now,
        relationship_type: relTypeInput.value,
        source_ref: sourceId,
        target_ref: targetId,
        description: descInput.value.trim(),
      };
    }

    const edgeId = edgeObj.id;
    STATE.objects.set(edgeId, edgeObj);
    STATE.edges.set(edgeId, { id: edgeId, source: sourceId, target: targetId, data: edgeObj });
    renderEdge(edgeId);
    drawMinimap();
    closeModal();
    toast(`Relationship created: ${relTypeInput.value || rType}`, 'success');
  };

  $('modal-confirm').onclick = confirm;
  $('modal-cancel').onclick = closeModal;
  $('modal-close-btn').onclick = closeModal;
}

function closeModal() {
  $('modal-overlay').classList.add('hidden');
  $('modal-confirm').onclick = null;
  $('modal-cancel').onclick = null;
}

/* ═══════════════════════════════════════════════════════════════════
   DRAG & DROP — PALETTE
═══════════════════════════════════════════════════════════════════ */
function initPalette() {
  const sections = $('palette-sections');
  sections.textContent = '';

  for (const section of STIX_SCHEMA.PALETTE_SECTIONS) {
    const header = el('div', { class: 'palette-section-header', 'data-section': section.id });
    const dot = el('span', { class: `section-dot dot-${section.id}` });
    const arrow = el('span', { class: 'section-arrow' });
    arrow.textContent = '▼';
    header.appendChild(dot);
    header.appendChild(document.createTextNode(section.label));
    header.appendChild(arrow);

    const items = el('div', { class: 'palette-items', 'data-section-items': section.id });

    for (const t of section.types) {
      const item = el('div', {
        class: 'palette-item',
        draggable: 'true',
        'data-type': t.type,
        'data-category': t.category,
        title: t.description || t.label,
      });
      const icon = el('span', { class: 'pi-icon' });
      icon.textContent = t.icon;
      const label = el('span', { class: 'pi-label' });
      label.textContent = t.label;
      const typeLabel = el('span', { class: 'pi-type' });
      typeLabel.textContent = t.type;
      item.appendChild(icon);
      item.appendChild(el('span', { style: 'flex:1;display:flex;flex-direction:column;gap:1px' }, label, typeLabel));

      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', t.type);
        e.dataTransfer.effectAllowed = 'copy';
      });
      items.appendChild(item);
    }

    header.addEventListener('click', () => {
      const collapsed = header.classList.toggle('collapsed');
      items.style.display = collapsed ? 'none' : '';
    });

    sections.appendChild(header);
    sections.appendChild(items);
  }

  // Search filter
  $('palette-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    const allItems = sections.querySelectorAll('.palette-item');
    allItems.forEach(item => {
      const type = item.getAttribute('data-type') || '';
      const label = item.querySelector('.pi-label')?.textContent?.toLowerCase() || '';
      item.classList.toggle('hidden', q.length > 0 && !type.includes(q) && !label.includes(q));
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   CANVAS DRAG & DROP
═══════════════════════════════════════════════════════════════════ */
canvas.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
canvas.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('text/plain');
  if (!type) return;
  const cp = screenToCanvas(e.clientX, e.clientY);
  const id = addObjectToCanvas(type, cp.x, cp.y);
  if (id) { selectObject('node', id); toast(`Added ${type}`, 'success'); }
});

/* ═══════════════════════════════════════════════════════════════════
   NODE DRAG
═══════════════════════════════════════════════════════════════════ */
function onNodeMouseDown(e, id) {
  if (e.button !== 0) return;
  if (e.target.classList.contains('connect-handle')) return;
  e.stopPropagation();

  const node = STATE.nodes.get(id);
  if (!node) return;

  const startX = e.clientX;
  const startY = e.clientY;
  const origX = node.x;
  const origY = node.y;
  let moved = false;

  STATE.dragState = { id, startX, startY, origX, origY };

  const onMove = ev => {
    const dx = (ev.clientX - startX) / STATE.transform.k;
    const dy = (ev.clientY - startY) / STATE.transform.k;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    node.x = origX + dx;
    node.y = origY + dy;
    renderNode(id);
    updateAllEdgesForNode(id);
    drawMinimap();
  };

  const onUp = ev => {
    STATE.dragState = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    if (!moved) selectObject('node', id);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

/* ═══════════════════════════════════════════════════════════════════
   PAN & ZOOM
═══════════════════════════════════════════════════════════════════ */
canvas.addEventListener('mousedown', e => {
  if (e.button === 1 || (e.button === 0 && e.altKey)) {
    e.preventDefault();
    canvas.classList.add('pan-cursor');
    STATE.panState = { startX: e.clientX - STATE.transform.x, startY: e.clientY - STATE.transform.y };
  }
});

document.addEventListener('mousemove', e => {
  if (STATE.panState) {
    STATE.transform.x = e.clientX - STATE.panState.startX;
    STATE.transform.y = e.clientY - STATE.panState.startY;
    applyTransform();
  }
});

document.addEventListener('mouseup', () => {
  if (STATE.panState) { STATE.panState = null; canvas.classList.remove('pan-cursor'); }
});

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  const r = canvas.getBoundingClientRect();
  zoomTo(STATE.transform.k * delta, e.clientX - r.left, e.clientY - r.top);
}, { passive: false });

canvas.addEventListener('click', e => {
  if (e.target === canvas || e.target === root || e.target.id === 'canvas-root') {
    deselect();
  }
});

$('btn-zoom-in').addEventListener('click', () => {
  const r = canvas.getBoundingClientRect();
  zoomTo(STATE.transform.k * 1.2, r.width / 2, r.height / 2);
});
$('btn-zoom-out').addEventListener('click', () => {
  const r = canvas.getBoundingClientRect();
  zoomTo(STATE.transform.k * 0.8, r.width / 2, r.height / 2);
});
$('btn-zoom-fit').addEventListener('click', fitToScreen);

/* ═══════════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === 'Delete' || e.key === 'Backspace') removeSelected();
  if (e.key === 'Escape') deselect();
  if (e.key === 'f' || e.key === 'F') fitToScreen();
  if (e.key === 'g' || e.key === 'G') toggleGravity();
});

/* ═══════════════════════════════════════════════════════════════════
   GRAVITY / FORCE-DIRECTED LAYOUT
═══════════════════════════════════════════════════════════════════ */
function toggleGravity() {
  if (STATE.gravity.running) {
    stopGravity();
    $('btn-toggle-gravity').classList.remove('active');
    toast('Gravity off', 'info');
  } else {
    startGravity();
    $('btn-toggle-gravity').classList.add('active');
    toast('Gravity on — objects will settle', 'success');
  }
}

function startGravity() {
  if (STATE.gravity.running) return;
  STATE.gravity.running = true;
  let alpha = 1;
  const tick = () => {
    if (!STATE.gravity.running) return;
    alpha *= (1 - GRAVITY_ALPHA);
    if (alpha < 0.001) { stopGravity(); $('btn-toggle-gravity').classList.remove('active'); return; }
    applyForces(alpha);
    STATE.gravity.timer = requestAnimationFrame(tick);
  };
  STATE.gravity.timer = requestAnimationFrame(tick);
}

function stopGravity() {
  STATE.gravity.running = false;
  if (STATE.gravity.timer) { cancelAnimationFrame(STATE.gravity.timer); STATE.gravity.timer = null; }
}

function applyForces(alpha) {
  const nodes = [...STATE.nodes.entries()];
  if (nodes.length === 0) return;

  // Center gravity
  const cx = canvas.clientWidth / 2 / STATE.transform.k - STATE.transform.x / STATE.transform.k;
  const cy = canvas.clientHeight / 2 / STATE.transform.k - STATE.transform.y / STATE.transform.k;

  // Repulsion between all node pairs
  for (let i = 0; i < nodes.length; i++) {
    const [, ni] = nodes[i];
    ni.vx = ni.vx || 0;
    ni.vy = ni.vy || 0;
    for (let j = i + 1; j < nodes.length; j++) {
      const [, nj] = nodes[j];
      nj.vx = nj.vx || 0;
      nj.vy = nj.vy || 0;
      const dx = (ni.x + NODE_W / 2) - (nj.x + NODE_W / 2);
      const dy = (ni.y + NODE_H / 2) - (nj.y + NODE_H / 2);
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = REPULSION / (dist * dist);
      const fx = (dx / dist) * force * alpha;
      const fy = (dy / dist) * force * alpha;
      ni.vx += fx; ni.vy += fy;
      nj.vx -= fx; nj.vy -= fy;
    }
    // Center gravity
    ni.vx += (cx - ni.x - NODE_W / 2) * 0.01 * alpha;
    ni.vy += (cy - ni.y - NODE_H / 2) * 0.01 * alpha;
  }

  // Link attraction
  STATE.edges.forEach(edge => {
    const s = STATE.nodes.get(edge.source);
    const t = STATE.nodes.get(edge.target);
    if (!s || !t) return;
    s.vx = s.vx || 0; s.vy = s.vy || 0;
    t.vx = t.vx || 0; t.vy = t.vy || 0;
    const dx = (t.x + NODE_W / 2) - (s.x + NODE_W / 2);
    const dy = (t.y + NODE_H / 2) - (s.y + NODE_H / 2);
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = (dist - LINK_DISTANCE) * 0.05 * alpha;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    s.vx += fx; s.vy += fy;
    t.vx -= fx; t.vy -= fy;
  });

  // Apply velocities
  nodes.forEach(([id, n]) => {
    n.vx *= GRAVITY_DAMPING;
    n.vy *= GRAVITY_DAMPING;
    n.x += n.vx;
    n.y += n.vy;
    renderNode(id);
    updateAllEdgesForNode(id);
  });
  drawMinimap();
}

/* ═══════════════════════════════════════════════════════════════════
   LAYOUT ALGORITHMS
═══════════════════════════════════════════════════════════════════ */
function layoutForce() { stopGravity(); startGravity(); }

function layoutRadial() {
  stopGravity();
  const nodes = [...STATE.nodes.keys()];
  const n = nodes.length;
  if (!n) return;
  const cx = 400, cy = 400;
  const radius = Math.max(180, n * 40);
  nodes.forEach((id, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    STATE.nodes.get(id).x = cx + radius * Math.cos(angle) - NODE_W / 2;
    STATE.nodes.get(id).y = cy + radius * Math.sin(angle) - NODE_H / 2;
    renderNode(id);
    updateAllEdgesForNode(id);
  });
  drawMinimap();
  fitToScreen();
  toast('Radial layout applied', 'success');
}

function layoutTree() {
  stopGravity();
  // BFS from nodes with no incoming edges
  const nodeIds = [...STATE.nodes.keys()];
  const inDeg = new Map(nodeIds.map(id => [id, 0]));
  STATE.edges.forEach(e => { inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1); });
  const roots = nodeIds.filter(id => (inDeg.get(id) || 0) === 0);
  const visited = new Set();
  const levels = [];
  let queue = roots.length ? roots : nodeIds.slice(0, 1);
  while (queue.length) {
    levels.push(queue);
    queue.forEach(id => visited.add(id));
    const next = [];
    queue.forEach(id => {
      STATE.edges.forEach(e => {
        if (e.source === id && !visited.has(e.target)) {
          visited.add(e.target); next.push(e.target);
        }
      });
    });
    queue = next;
  }
  // Add unvisited
  nodeIds.filter(id => !visited.has(id)).forEach(id => { levels.push([id]); });

  const xGap = NODE_W + 40;
  const yGap = NODE_H + 50;
  levels.forEach((level, li) => {
    const totalW = level.length * xGap;
    level.forEach((id, i) => {
      const n = STATE.nodes.get(id);
      if (!n) return;
      n.x = i * xGap - totalW / 2 + 400;
      n.y = li * yGap + 60;
      renderNode(id);
      updateAllEdgesForNode(id);
    });
  });
  drawMinimap();
  fitToScreen();
  toast('Tree layout applied', 'success');
}

function layoutGrid() {
  stopGravity();
  const nodes = [...STATE.nodes.keys()];
  const n = nodes.length;
  if (!n) return;
  const cols = Math.ceil(Math.sqrt(n));
  const xGap = NODE_W + 60;
  const yGap = NODE_H + 50;
  nodes.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const nd = STATE.nodes.get(id);
    nd.x = col * xGap + 60;
    nd.y = row * yGap + 60;
    renderNode(id);
    updateAllEdgesForNode(id);
  });
  drawMinimap();
  fitToScreen();
  toast('Grid layout applied', 'success');
}

/* ═══════════════════════════════════════════════════════════════════
   IMPORT / EXPORT
═══════════════════════════════════════════════════════════════════ */
function exportBundle() {
  const objects = [...STATE.objects.values()];
  const bundle = {
    type: 'bundle',
    id: stixId('bundle'),
    objects,
  };
  const json = JSON.stringify(bundle, null, 2);
  downloadFile(json, 'stix_bundle.json', 'application/json');
  toast('STIX 2.1 bundle exported', 'success');
}

function exportInternal() {
  const nodeData = {};
  STATE.nodes.forEach((n, id) => { nodeData[id] = { x: n.x, y: n.y }; });
  const data = {
    _meta: { version: '2', tool: 'stix-palette-v2', exported: nowISO() },
    objects: [...STATE.objects.entries()].map(([, v]) => v),
    nodePositions: nodeData,
  };
  downloadFile(JSON.stringify(data, null, 2), 'stix_palette_state.json', 'application/json');
  toast('State exported', 'success');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────────────
   EXPORT AS SVG
   Serializes the live canvas SVG with all styling inlined so the
   exported file renders correctly without the page CSS.
   OWASP: no innerHTML reads of user content; only serializes the
   trusted SVG DOM that was built via safe DOM APIs.
───────────────────────────────────────────────────────────────── */
function exportSVG() {
  if (STATE.nodes.size === 0) { toast('Nothing on canvas to export', 'warn'); return; }

  // Compute tight bounding box around all nodes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  STATE.nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W);
    maxY = Math.max(maxY, n.y + NODE_H);
  });
  const pad = 40;
  const vbX = minX - pad;
  const vbY = minY - pad;
  const vbW = (maxX - minX) + pad * 2;
  const vbH = (maxY - minY) + pad * 2;

  // Clone the canvas SVG root (edges + nodes)
  const svgRoot = document.getElementById('canvas');
  const canvasRoot = document.getElementById('canvas-root');

  // Build a fresh standalone SVG document
  const ns = 'http://www.w3.org/2000/svg';
  const svgEl2 = document.createElementNS(ns, 'svg');
  svgEl2.setAttribute('xmlns', ns);
  svgEl2.setAttribute('version', '1.1');
  svgEl2.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  svgEl2.setAttribute('width', String(vbW));
  svgEl2.setAttribute('height', String(vbH));

  // ── Inline <defs> (markers, filters) from original SVG ──
  const origDefs = svgRoot.querySelector('defs');
  if (origDefs) {
    svgEl2.appendChild(origDefs.cloneNode(true));
  }

  // ── Inline CSS styles needed for standalone rendering ──
  const styleEl = document.createElementNS(ns, 'style');
  styleEl.textContent = [
    'text { font-family: "Segoe UI", system-ui, Arial, sans-serif; }',
    '.node-type-label { font-size: 8px; fill: #fff; opacity: 0.65; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px; }',
    '.node-icon { font-size: 20px; }',
    '.node-name { font-size: 10px; fill: #fff; font-weight: 600; }',
    '.node-subname { font-size: 9px; fill: rgba(255,255,255,0.55); }',
    '.edge-line { fill: none; stroke-width: 1.5; }',
    '.edge-label { font-size: 9px; fill: #aad4f5; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }',
    '.edge-label-bg { fill: #161b22; opacity: 0.9; }',
    '.connect-handle { display: none; }',
  ].join('\n');
  svgEl2.appendChild(styleEl);

  // ── Background rect ──
  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('x', String(vbX));
  bg.setAttribute('y', String(vbY));
  bg.setAttribute('width', String(vbW));
  bg.setAttribute('height', String(vbH));
  bg.setAttribute('fill', '#0d1117');
  svgEl2.appendChild(bg);

  // ── Clone canvas content at identity transform (no pan/zoom offset) ──
  // We clone the full canvasRoot then reset its transform so the
  // viewBox handles framing — no user-supplied strings injected.
  const contentClone = canvasRoot.cloneNode(true);
  contentClone.setAttribute('transform', ''); // strip pan/zoom transform
  svgEl2.appendChild(contentClone);

  // ── Title / metadata (safe text nodes only) ──
  const title = document.createElementNS(ns, 'title');
  title.textContent = 'STIX Palette v2 Export';
  svgEl2.insertBefore(title, svgEl2.firstChild);

  const desc = document.createElementNS(ns, 'desc');
  desc.textContent = 'STIX 2.1 relationship diagram exported from STIX Palette v2. Generated: ' + nowISO();
  svgEl2.insertBefore(desc, svgEl2.children[1]);

  // ── Serialize via XMLSerializer (safe — no innerHTML) ──
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl2);

  downloadFile(svgString, 'stix_diagram.svg', 'image/svg+xml');
  toast('SVG exported', 'success');
}

/* ─────────────────────────────────────────────────────────────────
   PRINT / SAVE AS PDF
   Opens a minimal print window with the SVG embedded and a
   print-optimised stylesheet, then triggers window.print().
   The user's browser handles PDF generation natively (Save as PDF
   in the print dialog). No third-party library required.
   OWASP: popup content built entirely with DOM APIs; no innerHTML
   of user-supplied strings; SVG serialized via XMLSerializer.
───────────────────────────────────────────────────────────────── */
function printAsPDF() {
  if (STATE.nodes.size === 0) { toast('Nothing on canvas to print', 'warn'); return; }

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  STATE.nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W);
    maxY = Math.max(maxY, n.y + NODE_H);
  });
  const pad = 50;
  const vbX = minX - pad, vbY = minY - pad;
  const vbW = (maxX - minX) + pad * 2;
  const vbH = (maxY - minY) + pad * 2;

  // Build standalone SVG string (same logic as exportSVG)
  const ns = 'http://www.w3.org/2000/svg';
  const svgDoc = document.createElementNS(ns, 'svg');
  svgDoc.setAttribute('xmlns', ns);
  svgDoc.setAttribute('version', '1.1');
  svgDoc.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  svgDoc.setAttribute('style', 'width:100%;height:auto;display:block;');

  const origDefs = document.getElementById('canvas').querySelector('defs');
  if (origDefs) svgDoc.appendChild(origDefs.cloneNode(true));

  const styleEl = document.createElementNS(ns, 'style');
  styleEl.textContent = [
    'text { font-family: "Segoe UI", Arial, sans-serif; }',
    '.node-type-label { font-size: 8px; fill: #fff; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.5px; }',
    '.node-icon { font-size: 20px; }',
    '.node-name { font-size: 10px; fill: #fff; font-weight: 600; }',
    '.node-subname { font-size: 9px; fill: rgba(255,255,255,0.55); }',
    '.edge-line { fill: none; stroke-width: 1.5; }',
    '.edge-label { font-size: 9px; fill: #aad4f5; font-weight: 600; text-transform: uppercase; }',
    '.edge-label-bg { fill: #161b22; opacity: 0.9; }',
    '.connect-handle { display: none; }',
  ].join('\n');
  svgDoc.appendChild(styleEl);

  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('x', String(vbX)); bg.setAttribute('y', String(vbY));
  bg.setAttribute('width', String(vbW)); bg.setAttribute('height', String(vbH));
  bg.setAttribute('fill', '#0d1117');
  svgDoc.appendChild(bg);

  const contentClone = document.getElementById('canvas-root').cloneNode(true);
  contentClone.setAttribute('transform', '');
  svgDoc.appendChild(contentClone);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgDoc);

  // ── Build print window using DOM APIs only — no innerHTML of user data ──
  const printWin = window.open('', '_blank', 'width=1200,height=900');
  if (!printWin) {
    toast('Pop-up blocked — please allow pop-ups for this page', 'error');
    return;
  }

  // Build the print document safely
  const doc = printWin.document;
  doc.open();

  // We use doc.write here ONLY for the structural shell — no user data is
  // written via this path. The SVG is inserted as a data-URI blob URL below.
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(blob);

  // Build the page structure entirely via DOM
  const html = doc.documentElement;
  html.lang = 'en';

  const head = doc.head;
  const metaCharset = doc.createElement('meta');
  metaCharset.setAttribute('charset', 'UTF-8');
  head.appendChild(metaCharset);

  const titleEl = doc.createElement('title');
  titleEl.textContent = 'STIX Palette — Print / PDF';
  head.appendChild(titleEl);

  const styleSheet = doc.createElement('style');
  styleSheet.textContent = [
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'body { background: #fff; font-family: "Segoe UI", Arial, sans-serif; }',
    '.print-header { padding: 14px 20px 8px; border-bottom: 2px solid #0d1117; display: flex; align-items: center; justify-content: space-between; }',
    '.print-title { font-size: 18px; font-weight: 700; color: #0d1117; }',
    '.print-meta { font-size: 11px; color: #555; }',
    '.print-legend { padding: 8px 20px; display: flex; gap: 18px; flex-wrap: wrap; border-bottom: 1px solid #ddd; }',
    '.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #333; }',
    '.legend-dot { width: 10px; height: 10px; border-radius: 50%; }',
    '.diagram-wrap { padding: 16px; }',
    'img.svg-diagram { width: 100%; height: auto; border: 1px solid #e0e0e0; border-radius: 4px; }',
    '.print-footer { padding: 10px 20px; border-top: 1px solid #ddd; font-size: 10px; color: #777; display: flex; justify-content: space-between; }',
    '.no-print { padding: 10px 20px; background: #f5f5f5; display: flex; gap: 10px; border-bottom: 1px solid #ddd; }',
    '.no-print button { padding: 7px 18px; border-radius: 4px; border: 1px solid #aaa; background: #0d1117; color: #fff; cursor: pointer; font-size: 13px; font-weight: 600; }',
    '.no-print button:hover { background: #1c2128; }',
    '.no-print .cancel-btn { background: #fff; color: #333; }',
    '@media print {',
    '  .no-print { display: none !important; }',
    '  body { background: #fff; }',
    '  .print-header { border-color: #000; }',
    '  .diagram-wrap { padding: 8px; }',
    '}',
  ].join('\n');
  head.appendChild(styleSheet);

  const body = doc.body;

  // No-print toolbar (hidden in print mode)
  const toolbar = doc.createElement('div');
  toolbar.className = 'no-print';
  const printBtn = doc.createElement('button');
  printBtn.textContent = '🖨  Print / Save as PDF';
  printBtn.addEventListener('click', () => { printWin.print(); });
  const closeBtn = doc.createElement('button');
  closeBtn.className = 'cancel-btn';
  closeBtn.textContent = '✕ Close';
  closeBtn.addEventListener('click', () => { URL.revokeObjectURL(svgUrl); printWin.close(); });
  toolbar.appendChild(printBtn);
  toolbar.appendChild(closeBtn);
  body.appendChild(toolbar);

  // Header
  const header = doc.createElement('div');
  header.className = 'print-header';
  const titleDiv = doc.createElement('div');
  titleDiv.className = 'print-title';
  titleDiv.textContent = 'STIX 2.1 Relationship Diagram';
  const metaDiv = doc.createElement('div');
  metaDiv.className = 'print-meta';
  metaDiv.textContent = 'Generated: ' + new Date().toLocaleString() +
    '  |  Objects: ' + STATE.nodes.size +
    '  |  Relationships: ' + STATE.edges.size;
  header.appendChild(titleDiv);
  header.appendChild(metaDiv);
  body.appendChild(header);

  // Legend
  const legend = doc.createElement('div');
  legend.className = 'print-legend';
  const legendItems = [
    { label: 'Domain Object (SDO)', color: '#4fc3f7' },
    { label: 'Relationship (SRO)', color: '#81c784' },
    { label: 'Cyber Observable (SCO)', color: '#ce93d8' },
    { label: 'Meta Object', color: '#ffb74d' },
  ];
  legendItems.forEach(item => {
    const li = doc.createElement('div');
    li.className = 'legend-item';
    const dot = doc.createElement('span');
    dot.className = 'legend-dot';
    dot.style.background = item.color;
    const lbl = doc.createElement('span');
    lbl.textContent = item.label;
    li.appendChild(dot);
    li.appendChild(lbl);
    legend.appendChild(li);
  });
  body.appendChild(legend);

  // SVG diagram — embed as <img src="blob:..."> for clean rendering
  const diagramWrap = doc.createElement('div');
  diagramWrap.className = 'diagram-wrap';
  const img = doc.createElement('img');
  img.className = 'svg-diagram';
  img.src = svgUrl;
  img.alt = 'STIX 2.1 Relationship Diagram';
  // Revoke the blob URL once the image loads to free memory
  img.addEventListener('load', () => { URL.revokeObjectURL(svgUrl); });
  diagramWrap.appendChild(img);
  body.appendChild(diagramWrap);

  // Object summary table
  if (STATE.nodes.size > 0) {
    const summaryHead = doc.createElement('div');
    summaryHead.style.cssText = 'padding: 8px 20px 4px; font-size: 13px; font-weight: 700; color: #0d1117; border-top: 1px solid #ddd;';
    summaryHead.textContent = 'Object Summary';
    body.appendChild(summaryHead);

    const table = doc.createElement('table');
    table.style.cssText = 'width:calc(100% - 40px); margin: 0 20px 12px; border-collapse: collapse; font-size: 11px;';
    const thead = doc.createElement('thead');
    const hRow = doc.createElement('tr');
    ['Type', 'Label', 'Name / Value', 'ID'].forEach(col => {
      const th = doc.createElement('th');
      th.style.cssText = 'text-align:left; padding: 5px 8px; background: #0d1117; color: #fff; border: 1px solid #333;';
      th.textContent = col;
      hRow.appendChild(th);
    });
    thead.appendChild(hRow);
    table.appendChild(thead);

    const tbody = doc.createElement('tbody');
    let rowIdx = 0;
    STATE.nodes.forEach((node, id) => {
      const obj = STATE.objects.get(id);
      if (!obj) return;
      const schema = STIX_SCHEMA.ALL_TYPES_MAP[obj.type];
      const tr = doc.createElement('tr');
      tr.style.background = rowIdx % 2 === 0 ? '#f9f9f9' : '#fff';
      rowIdx++;
      [obj.type, schema?.label || obj.type, getDisplayName(obj), obj.id].forEach(cellVal => {
        const td = doc.createElement('td');
        td.style.cssText = 'padding: 4px 8px; border: 1px solid #ddd; word-break: break-all;';
        td.textContent = String(cellVal);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    body.appendChild(table);
  }

  // Footer
  const footer = doc.createElement('div');
  footer.className = 'print-footer';
  const footerLeft = doc.createElement('span');
  footerLeft.textContent = 'STIX Palette v2 — STIX 2.1 Visual Composer';
  const footerRight = doc.createElement('span');
  footerRight.textContent = 'KU IT Security Office';
  footer.appendChild(footerLeft);
  footer.appendChild(footerRight);
  body.appendChild(footer);

  doc.close();
  toast('Print window opened', 'success');
}

function importFile(file) {
  if (!file) return;
  if (!file.name.endsWith('.json')) { toast('Only JSON files are supported', 'error'); return; }
  if (file.size > 10 * 1024 * 1024) { toast('File too large (max 10MB)', 'error'); return; }

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const raw = ev.target.result;
      const data = JSON.parse(raw);
      loadData(data);
    } catch (err) {
      toast('Invalid JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function loadData(data) {
  // Clear canvas
  clearCanvas(false);

  let objects = [];
  let positions = {};

  // Detect format: STIX bundle vs internal state
  if (data.type === 'bundle' && Array.isArray(data.objects)) {
    // STIX 2.1 bundle
    objects = data.objects;
  } else if (data._meta?.tool === 'stix-palette-v2') {
    // Internal state
    objects = data.objects || [];
    positions = data.nodePositions || {};
  } else if (Array.isArray(data)) {
    objects = data;
  } else if (data.objects) {
    objects = data.objects;
  }

  // Validate and load objects
  let cx = 100, cy = 100;
  const sdoSro = [];
  const edges = [];

  for (const obj of objects) {
    if (!obj || typeof obj !== 'object') continue;
    if (!obj.type || !obj.id) continue;
    // Sanitize strings
    const clean = sanitizeObject(obj);
    STATE.objects.set(clean.id, clean);

    const isEdge = clean.type === 'relationship' || clean.type === 'sighting';
    if (isEdge) edges.push(clean);
    else sdoSro.push(clean);
  }

  // Place non-edge objects on canvas
  let col = 0, row = 0;
  const colCount = Math.max(1, Math.ceil(Math.sqrt(sdoSro.length)));
  for (const obj of sdoSro) {
    const pos = positions[obj.id];
    const x = pos ? pos.x : col * (NODE_W + 50) + 60;
    const y = pos ? pos.y : row * (NODE_H + 60) + 60;
    STATE.nodes.set(obj.id, { x, y, vx: 0, vy: 0 });
    col++;
    if (col >= colCount) { col = 0; row++; }
    renderNode(obj.id);
  }

  // Place edge objects
  for (const obj of edges) {
    const src = obj.source_ref || obj.sighting_of_ref;
    const tgt = obj.target_ref || (obj.where_sighted_refs?.[0]);
    if (src && tgt && STATE.nodes.has(src) && STATE.nodes.has(tgt)) {
      STATE.edges.set(obj.id, { id: obj.id, source: src, target: tgt, data: obj });
      renderEdge(obj.id);
    }
  }

  drawMinimap();
  fitToScreen();
  toast(`Loaded ${sdoSro.length} objects, ${edges.length} relationships`, 'success');
}

/** Sanitize a STIX object — validate types, strip unexpected chars */
function sanitizeObject(obj) {
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    // Only allow safe key names
    if (!/^[a-zA-Z0-9_]+$/.test(k)) continue;
    if (typeof v === 'string') clean[k] = v.slice(0, 65535);
    else if (typeof v === 'number') clean[k] = isFinite(v) ? v : 0;
    else if (typeof v === 'boolean') clean[k] = v;
    else if (Array.isArray(v)) clean[k] = v.map(i => typeof i === 'string' ? i.slice(0, 1024) : (typeof i === 'object' ? sanitizeObject(i) : i));
    else if (typeof v === 'object' && v !== null) clean[k] = sanitizeObject(v);
    else clean[k] = null;
  }
  return clean;
}

function clearCanvas(showToast = true) {
  stopGravity();
  STATE.objects.clear();
  STATE.nodes.clear();
  STATE.edges.clear();
  STATE.edgeEls.clear();
  STATE.selected = null;
  nodesLayer.textContent = '';
  edgesLayer.textContent = '';
  hideProperties();
  drawMinimap();
  if (showToast) toast('Canvas cleared', 'warn');
}

/* ═══════════════════════════════════════════════════════════════════
   MINIMAP CLICK TO PAN
═══════════════════════════════════════════════════════════════════ */
$('minimap').addEventListener('click', e => {
  if (STATE.nodes.size === 0) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  STATE.nodes.forEach(n => {
    minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W); maxY = Math.max(maxY, n.y + NODE_H);
  });
  const ww = (maxX - minX) || 200;
  const wh = (maxY - minY) || 200;
  const scale = Math.min(MINIMAP_W / ww, MINIMAP_H / wh) * 0.85;
  const offX = (MINIMAP_W - ww * scale) / 2;
  const offY = (MINIMAP_H - wh * scale) / 2;
  const r = $('minimap').getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;
  const wx = (mx - offX) / scale + minX;
  const wy = (my - offY) / scale + minY;
  const cr = canvas.getBoundingClientRect();
  STATE.transform.x = cr.width / 2 - wx * STATE.transform.k;
  STATE.transform.y = cr.height / 2 - wy * STATE.transform.k;
  applyTransform();
});

/* ═══════════════════════════════════════════════════════════════════
   PROPS PANEL BUTTONS
═══════════════════════════════════════════════════════════════════ */
$('btn-save-props').addEventListener('click', () => {
  if (!STATE.selected) return;
  const { type, id } = STATE.selected;
  if (type === 'node') {
    const obj = STATE.objects.get(id);
    if (obj) { obj.modified = nowISO(); renderNode(id); updateAllEdgesForNode(id); }
  } else {
    const edge = STATE.edges.get(id);
    if (edge?.data) { edge.data.modified = nowISO(); renderEdge(id); }
  }
  toast('Saved', 'success');
});

$('btn-delete-obj').addEventListener('click', () => removeSelected());
$('btn-close-props').addEventListener('click', () => deselect());

/* ═══════════════════════════════════════════════════════════════════
   HEADER BUTTON WIRING
═══════════════════════════════════════════════════════════════════ */
$('btn-import').addEventListener('click', () => $('file-import-input').click());
$('file-import-input').addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (f) importFile(f);
  e.target.value = '';
});
$('btn-export').addEventListener('click', exportInternal);
$('btn-export-stix2').addEventListener('click', exportBundle);
$('btn-export-svg').addEventListener('click', exportSVG);
$('btn-print-pdf').addEventListener('click', printAsPDF);
$('btn-clear').addEventListener('click', () => {
  if (STATE.objects.size === 0 || confirm('Clear all objects from the canvas?')) clearCanvas();
});
$('btn-layout-force').addEventListener('click', () => { layoutForce(); toast('Force layout running…', 'info'); });
$('btn-layout-radial').addEventListener('click', layoutRadial);
$('btn-layout-tree').addEventListener('click', layoutTree);
$('btn-layout-grid').addEventListener('click', layoutGrid);
$('btn-toggle-gravity').addEventListener('click', toggleGravity);
$('btn-zoom-fit').addEventListener('click', fitToScreen);

/* ═══════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════ */
function init() {
  initPalette();
  applyTransform();
  drawMinimap();

  // Load example bundle if no state
  loadExampleData();
}

function loadExampleData() {
  const now = nowISO();
  const ta = {
    type: 'threat-actor', spec_version: '2.1',
    id: stixId('threat-actor'),
    created: now, modified: now,
    name: 'APT Example',
    threat_actor_types: ['nation-state'],
    description: 'Example threat actor for demonstration.',
    labels: ['example'],
  };
  const mal = {
    type: 'malware', spec_version: '2.1',
    id: stixId('malware'),
    created: now, modified: now,
    name: 'ExampleRAT',
    malware_types: ['remote-access-trojan'],
    is_family: false,
  };
  const vuln = {
    type: 'vulnerability', spec_version: '2.1',
    id: stixId('vulnerability'),
    created: now, modified: now,
    name: 'CVE-2024-0001',
    description: 'Example vulnerability.',
    external_references: [{ source_name: 'cve', external_id: 'CVE-2024-0001', url: '' }],
  };
  const rel1 = {
    type: 'relationship', spec_version: '2.1',
    id: stixId('relationship'),
    created: now, modified: now,
    relationship_type: 'uses',
    source_ref: ta.id,
    target_ref: mal.id,
  };
  const rel2 = {
    type: 'relationship', spec_version: '2.1',
    id: stixId('relationship'),
    created: now, modified: now,
    relationship_type: 'exploits',
    source_ref: mal.id,
    target_ref: vuln.id,
  };

  STATE.objects.set(ta.id, ta);
  STATE.objects.set(mal.id, mal);
  STATE.objects.set(vuln.id, vuln);
  STATE.objects.set(rel1.id, rel1);
  STATE.objects.set(rel2.id, rel2);

  STATE.nodes.set(ta.id, { x: 80, y: 200, vx: 0, vy: 0 });
  STATE.nodes.set(mal.id, { x: 320, y: 200, vx: 0, vy: 0 });
  STATE.nodes.set(vuln.id, { x: 560, y: 200, vx: 0, vy: 0 });

  STATE.edges.set(rel1.id, { id: rel1.id, source: ta.id, target: mal.id, data: rel1 });
  STATE.edges.set(rel2.id, { id: rel2.id, source: mal.id, target: vuln.id, data: rel2 });

  [ta.id, mal.id, vuln.id].forEach(id => renderNode(id));
  [rel1.id, rel2.id].forEach(id => renderEdge(id));

  drawMinimap();
  fitToScreen();
}

document.addEventListener('DOMContentLoaded', init);
