/**
 * STIX CASEFILE ENGINE - Updated with PDF/SVG Export
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
    Object.keys(STIX_TEMPLATES).forEach(key => {
        const div = document.createElement('div');
        div.className = 'palette-item';
        div.innerText = key.toUpperCase().replace(/-/g, ' ');
        div.draggable = true;
        div.addEventListener('dragstart', (e) => e.dataTransfer.setData('stixType', key));
        palette.appendChild(div);
    });
}

function generateStixId(type) {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return `${type}--${uuid}`;
}

// --- Viewport & Coordinate Math ---

function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * state.view.zoom + state.view.x;
    const y = (clientY - rect.top) * state.view.zoom + state.view.y;
    return { x, y };
}

function updateViewBox() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width * state.view.zoom;
    const h = rect.height * state.view.zoom;
    canvas.setAttribute('viewBox', `${state.view.x} ${state.view.y} ${w} ${h}`);
}

// --- Interaction Handlers ---

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const mBefore = screenToWorld(e.clientX, e.clientY);
    state.view.zoom *= zoomFactor;
    const mAfter = screenToWorld(e.clientX, e.clientY);
    state.view.x += (mBefore.x - mAfter.x);
    state.view.y += (mBefore.y - mAfter.y);
    updateViewBox();
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        state.view.isPanning = true;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('dragover', (e) => e.preventDefault());
canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('stixType');
    if (!type) return;
    const coords = screenToWorld(e.clientX, e.clientY);
    createStixNode(type, coords.x, coords.y);
});

// --- Node & Link Logic ---

function createStixNode(type, x, y) {
    const template = STIX_TEMPLATES[type] || { name: "Unknown", color: "#999" };
    const newNode = {
        ...template,
        id: generateStixId(type),
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        spec_version: "2.1",
        x, y
    };
    state.nodes.push(newNode);
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

    state.relationships.forEach(rel => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "edge" + (state.selection?.id === rel.id ? " selected" : ""));
        line.setAttribute("x1", rel.source_node.x); line.setAttribute("y1", rel.source_node.y);
        line.setAttribute("x2", rel.target_node.x); line.setAttribute("y2", rel.target_node.y);
        line.setAttribute("marker-end", "url(#arrowhead)");
        line.onmousedown = (e) => { e.stopPropagation(); state.selection = rel; render(); };
        edgesGroup.appendChild(line);
    });

    state.nodes.forEach(node => {
        const isMatch = !state.searchTerm || 
                        (node.name && node.name.toLowerCase().includes(state.searchTerm)) || 
                        (node.type && node.type.toLowerCase().includes(state.searchTerm));
        
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "node" + (state.selection?.id === node.id ? " selected" : "") + (state.searchTerm && !isMatch ? " filtered" : ""));
        g.setAttribute("transform", `translate(${node.x}, ${node.y})`);
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", 25);
        circle.setAttribute("fill", node.color || "#999");
        circle.onmousedown = (e) => {
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
        typeText.textContent = `(${node.type})`;

        g.appendChild(circle); g.appendChild(nameText); g.appendChild(typeText);
        nodesGroup.appendChild(g);
    });
}

// --- Global Events ---

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

window.onkeydown = (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (state.selection) {
            const id = state.selection.id;
            state.nodes = state.nodes.filter(n => n.id !== id);
            state.relationships = state.relationships.filter(r => r.id !== id && r.source_ref !== id && r.target_ref !== id);
            state.selection = null;
            render();
        }
    }
};

// --- Sidebar UI Actions ---

if (searchInput) searchInput.oninput = (e) => { state.searchTerm = e.target.value.toLowerCase(); render(); };
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

// --- EXPORT GRAPHIC (SVG/PDF) ---

exportGraphicButton.onclick = () => {
    if (state.nodes.length === 0) return alert("No objects to export.");

    // 1. Calculate Bounding Box
    const pad = 60;
    const minX = Math.min(...state.nodes.map(n => n.x)) - pad;
    const minY = Math.min(...state.nodes.map(n => n.y)) - pad;
    const maxX = Math.max(...state.nodes.map(n => n.x)) + pad;
    const maxY = Math.max(...state.nodes.map(n => n.y)) + pad;
    const width = maxX - minX;
    const height = maxY - minY;

    // 2. Clone and Style for Print
    const clone = canvas.cloneNode(true);
    clone.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
    clone.style.background = "white";

    // Invert Text and Lines for Light Background
    clone.querySelectorAll('.node text').forEach(t => t.style.fill = "#333");
    clone.querySelectorAll('.edge').forEach(e => {
        e.style.stroke = "#444";
        e.style.opacity = "1";
    });
    clone.querySelectorAll('.filtered').forEach(f => f.style.opacity = "1");

    const svgData = new XMLSerializer().serializeToString(clone);
    
    // 3. Open Print Window (PDF)
    const pWin = window.open('', '_blank');
    pWin.document.write(`
        <html><head><title>STIX CaseFile Export</title>
        <style>
            @page { size: letter landscape; margin: 10mm; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
            svg { width: 100%; height: auto; max-height: 100%; }
        </style></head>
        <body>${svgData}</body></html>
    `);
    pWin.document.close();
    setTimeout(() => { pWin.print(); pWin.close(); }, 500);
};

// --- IMPORT / EXPORT BUNDLE ---

exportButton.onclick = () => {
    const objects = [
        ...state.nodes.map(({x, y, color, ...rest}) => rest), 
        ...state.relationships.map(({source_node, target_node, ...rest}) => rest)
    ];
    const bundle = { type: "bundle", id: generateStixId('bundle'), objects };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "stix_bundle.json";
    a.click();
};

loadButton.onclick = () => importInput.click();
importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const bundle = JSON.parse(event.target.result);
        state.nodes = bundle.objects.filter(o => o.type !== 'relationship').map((n, i) => ({
            ...n, x: n.x || 300 + (i % 4) * 200, y: n.y || 200 + Math.floor(i / 4) * 200, color: (STIX_TEMPLATES[n.type] || {}).color
        }));
        state.relationships = bundle.objects.filter(o => o.type === 'relationship').map(r => ({
            ...r, source_node: state.nodes.find(n => n.id === r.source_ref), target_node: state.nodes.find(n => n.id === r.target_ref)
        })).filter(rel => rel.source_node && rel.target_node);
        render();
    };
    reader.readAsText(file);
};

updateViewBox();
window.onresize = updateViewBox;
