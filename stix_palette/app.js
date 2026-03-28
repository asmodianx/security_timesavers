/**
 * STIX CASEFILE ENGINE - Stable with STIX 1.x (MISP) & Scaled PDF Export
 */
const state = {
    nodes: [],
    relationships: [],
    selection: null,
    mode: 'move',
    linkSource: null,
    isDragging: false,
    dragTarget: null,
    searchTerm: "",
    view: { x: 0, y: 0, zoom: 1, isPanning: false }
};

// DOM Cache
const canvas = document.getElementById('canvas');
const nodesGroup = document.getElementById('nodes-group');
const edgesGroup = document.getElementById('edges-group');
const palette = document.getElementById('palette');
const importInput = document.getElementById('import-input');
const loadButton = document.getElementById('load-button');
const exportButton = document.getElementById('export-button');
const exportGraphicButton = document.getElementById('export-graphic-button');
const searchInput = document.getElementById('node-search');

// --- Initialization ---

if (typeof STIX_TEMPLATES !== 'undefined') {
    Object.keys(STIX_TEMPLATES).forEach(function(key) {
        const div = document.createElement('div');
        div.className = 'palette-item';
        div.innerText = key.toUpperCase().replace(/-/g, ' ');
        div.draggable = true;
        div.addEventListener('dragstart', function(e) { e.dataTransfer.setData('stixType', key); });
        palette.appendChild(div);
    });
}

function generateStixId(type) {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return type + '--' + uuid;
}

// --- Viewport Math ---

function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * state.view.zoom + state.view.x;
    const y = (clientY - rect.top) * state.view.zoom + state.view.y;
    return { x: x, y: y };
}

function updateViewBox() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width * state.view.zoom;
    const h = rect.height * state.view.zoom;
    canvas.setAttribute('viewBox', state.view.x + ' ' + state.view.y + ' ' + w + ' ' + h);
}

// --- Interaction Handlers ---

canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const mBefore = screenToWorld(e.clientX, e.clientY);
    state.view.zoom *= zoomFactor;
    const mAfter = screenToWorld(e.clientX, e.clientY);
    state.view.x += (mBefore.x - mAfter.x);
    state.view.y += (mBefore.y - mAfter.y);
    updateViewBox();
}, { passive: false });

canvas.addEventListener('mousedown', function(e) {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        state.view.isPanning = true;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('dragover', (e) => e.preventDefault());
canvas.addEventListener('drop', function(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('stixType');
    if (!type) return;
    const coords = screenToWorld(e.clientX, e.clientY);
    createStixNode(type, coords.x, coords.y);
});

// --- Node & Link Logic ---

function createStixNode(type, x, y) {
    const template = STIX_TEMPLATES[type] || { name: "Unknown", color: "#999" };
    state.nodes.push(Object.assign({}, template, {
        id: generateStixId(type),
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        spec_version: "2.1",
        x: x, 
        y: y
    }));
    render();
}

function handleLinkClick(node) {
    if (!state.linkSource) {
        state.linkSource = node;
    } else {
        if (state.linkSource.id !== node.id) {
            state.relationships.push({
                type: "relationship",
                id: generateStixId('relationship'),
                relationship_type: "related-to",
                source_ref: state.linkSource.id,
                target_ref: node.id,
                source_node: state.linkSource,
                target_node: node
            });
        }
        state.linkSource = null;
        render();
    }
}

// --- Rendering ---

function render() {
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';

    state.relationships.forEach(function(rel) {
        if (!rel.source_node || !rel.target_node) return;
        const isSelected = (state.selection && state.selection.id === rel.id);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "edge" + (isSelected ? " selected" : ""));
        line.setAttribute("x1", rel.source_node.x); line.setAttribute("y1", rel.source_node.y);
        line.setAttribute("x2", rel.target_node.x); line.setAttribute("y2", rel.target_node.y);
        line.setAttribute("marker-end", "url(#arrowhead)");
        line.onmousedown = function(e) { e.stopPropagation(); state.selection = rel; render(); };
        edgesGroup.appendChild(line);
    });

    state.nodes.forEach(function(node) {
        const isMatch = !state.searchTerm || 
                        (node.name && node.name.toLowerCase().indexOf(state.searchTerm) !== -1) || 
                        (node.type && node.type.toLowerCase().indexOf(state.searchTerm) !== -1);
        
        const isSelected = (state.selection && state.selection.id === node.id);
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "node" + (isSelected ? " selected" : "") + (state.searchTerm && !isMatch ? " filtered" : ""));
        g.setAttribute("transform", "translate(" + node.x + "," + node.y + ")");
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", 25);
        circle.setAttribute("fill", node.color || "#999");
        circle.onmousedown = function(e) {
            state.selection = node;
            if (state.mode === 'move') { state.isDragging = true; state.dragTarget = node; }
            else { handleLinkClick(node); }
            showInspector(node);
            render();
        };

        const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        nameText.setAttribute("y", 40); 
        nameText.textContent = node.name || "Unnamed";
        const typeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        typeText.setAttribute("y", 54); 
        typeText.style.fontSize = "10px";
        typeText.style.fill = "#aaaaaa";
        typeText.textContent = "(" + node.type + ")";

        g.appendChild(circle); g.appendChild(nameText); g.appendChild(typeText);
        nodesGroup.appendChild(g);
    });
}

// --- MISP / STIX 1.x Deep Parser ---

function parseMispStix1(bundle) {
    const objects = [];
    let pkg = null;

    // Direct path based on provided misp.event.12.json structure
    if (bundle.related_packages && bundle.related_packages.related_packages && bundle.related_packages.related_packages) {
        pkg = bundle.related_packages.related_packages.package;
    } else if (bundle.incidents || bundle.ttps) {
        pkg = bundle;
    }

    if (!pkg) return [];

    // Extract Incidents -> Reports
    if (pkg.incidents && Array.isArray(pkg.incidents)) {
        pkg.incidents.forEach(function(inc) {
            const reportId = (inc.id || "").replace(/^.*:/, 'report--');
            objects.push({ 
                type: 'report', id: reportId, name: inc.title || "Incident", published: inc.timestamp 
            });
            
            // Extract Observables -> Indicators
            if (inc.related_observables && inc.related_observables.observables) {
                inc.related_observables.observables.forEach(function(obs) {
                    if (!obs.observable || !obs.observable.object) return;
                    const props = obs.observable.object.properties || {};
                    let val = "Observable";
                    
                    if (props.address_value) val = props.address_value.value;
                    else if (props.hashes && props.hashes) val = props.hashes.simple_hash_value.value;
                    else if (props.value) val = props.value.value;

                    const indicatorId = (obs.observable.id || "").replace(/^.*:/, 'indicator--');
                    objects.push({ type: 'indicator', id: indicatorId, name: val });
                    
                    // Create Relationship
                    objects.push({
                        type: 'relationship', id: generateStixId('relationship'),
                        relationship_type: 'contains', source_ref: reportId, target_ref: indicatorId
                    });
                });
            }
        });
    }

    // Extract TTPs -> Attack Patterns
    if (pkg.ttps && pkg.ttps.ttps) {
        pkg.ttps.ttps.forEach(function(ttp) {
            const pattern = (ttp.behavior && ttp.behavior.attack_patterns) ? ttp.behavior.attack_patterns : {};
            const attackId = (ttp.id || "").replace(/^.*:/, 'attack-pattern--');
            objects.push({ 
                type: 'attack-pattern', 
                id: attackId, 
                name: pattern.title || ttp.title || "Attack Pattern",
                description: pattern.description || ""
            });
        });
    }
    return objects;
}

// --- Sidebar UI Actions ---

loadButton.onclick = () => importInput.click();
importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target.result);
            // STIX 1.x / MISP detection
            let raw = (json.version === "1.1.1" || json.stix_header) ? parseMispStix1(json) : (json.objects || []);
            
            // 1. Process Nodes First
            state.nodes = raw.filter(function(o) { return o.type !== 'relationship'; }).map(function(n, i) {
                const template = STIX_TEMPLATES[n.type] || { color: "#999" };
                return Object.assign({}, n, {
                    x: n.x || 300 + (i % 5) * 200, 
                    y: n.y || 200 + Math.floor(i / 5) * 200,
                    color: template.color
                });
            });

            // 2. Process Relationships
            state.relationships = raw.filter(function(o) { return o.type === 'relationship'; }).map(function(r) {
                return Object.assign({}, r, {
                    source_node: state.nodes.find(function(n) { return n.id === r.source_ref; }),
                    target_node: state.nodes.find(function(n) { return n.id === r.target_ref; })
                });
            }).filter(function(rel) { return rel.source_node && rel.target_node; });
            
            render();
        } catch (err) { alert("Import Error: " + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
};

// --- PDF/SVG EXPORT ---

exportGraphicButton.onclick = () => {
    if (state.nodes.length === 0) return alert("No objects to export.");
    const pad = 60;
    const xs = state.nodes.map(n => n.x), ys = state.nodes.map(n => n.y);
    const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
    const width = Math.max(...xs) - minX + pad, height = Math.max(...ys) - minY + pad;

    const clone = canvas.cloneNode(true);
    clone.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
    clone.style.background = "white";

    clone.querySelectorAll('.node text').forEach(t => t.style.fill = "#333");
    clone.querySelectorAll('.edge').forEach(e => { e.style.stroke = "#444"; e.style.opacity = "1"; });

    const pWin = window.open('', '_blank');
    pWin.document.write(`
        <html><head><title>STIX CaseFile Export</title>
        <style>
            @page { size: letter landscape; margin: 10mm; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
            svg { width: 100%; height: auto; max-height: 100%; }
        </style></head>
        <body>${new XMLSerializer().serializeToString(clone)}</body></html>
    `);
    pWin.document.close();
    setTimeout(() => { pWin.print(); pWin.close(); }, 500);
};

exportButton.onclick = () => {
    const objects = [
        ...state.nodes.map(function(n) {
            const copy = Object.assign({}, n);
            delete copy.x; delete copy.y; delete copy.color;
            return copy;
        }), 
        ...state.relationships.map(function(r) {
            const copy = Object.assign({}, r);
            delete copy.source_node; delete copy.target_node;
            return copy;
        })
    ];
    const bundle = { type: "bundle", id: generateStixId('bundle'), objects: objects };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "stix_bundle.json";
    a.click();
};

// Global Mouse Handlers
window.onmousemove = (e) => {
    if (state.view.isPanning) {
        state.view.x -= e.movementX * state.view.zoom;
        state.view.y -= e.movementY * state.view.zoom;
        updateViewBox();
    } else if (state.isDragging && state.dragTarget) {
        const coords = screenToWorld(e.clientX, e.clientY);
        state.dragTarget.x = coords.x;
        state.dragTarget.y = coords.y;
        render();
    }
};
window.onmouseup = () => { state.isDragging = false; state.view.isPanning = false; canvas.style.cursor = 'crosshair'; };

document.getElementById('btn-move').onclick = () => setMode('move');
document.getElementById('btn-link').onclick = () => setMode('link');

function setMode(m) {
    state.mode = m;
    document.getElementById('btn-move').className = m === 'move' ? 'active' : '';
    document.getElementById('btn-link').className = m === 'link' ? 'active' : '';
}

function showInspector(node) {
    const ins = document.getElementById('inspector');
    ins.classList.remove('hidden');
    document.getElementById('inspector-content').innerHTML = `
        <label>Name</label><input type="text" id="edit-name" value="${node.name || ''}">
        <label>Type</label><p>${node.type}</p>
        <p style="font-size:9px; color:#888;">${node.id}</p>`;
    document.getElementById('edit-name').oninput = (e) => { node.name = e.target.value; render(); };
}

document.getElementById('close-inspector').onclick = () => document.getElementById('inspector').classList.add('hidden');
if (searchInput) searchInput.oninput = (e) => { state.searchTerm = e.target.value.toLowerCase(); render(); };

updateViewBox();
window.onresize = updateViewBox;

