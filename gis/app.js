/**
 * Analyst GIS Portal - Application Logic
 * No dependencies outside of CDN-loaded Leaflet and Geoman.
 */

// 1. Map & Layer Initialization
const map = L.map('map').setView([38.00, -94.00], 5);
const drawnItems = new L.FeatureGroup().addTo(map);

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap'
});

L.control.layers({ "Streets": osm, "Topography": topo }).addTo(map);
L.control.browserPrint({title: 'Print Current Map', documentTitle: 'Site Export'}).addTo(map);

// 2. Geoman Drawing Configuration
map.pm.addControls({
    position: 'topleft',
    drawCircleMarker: false,
    rotateMode: false,
    cutPolygon: false
});

// Event: When an object is created
map.on('pm:create', (e) => {
    const layer = e.layer;
    drawnItems.addLayer(layer);
    
    // Initialize custom metadata structure
    layer.feature = layer.feature || { type: 'Feature', properties: {} };
    layer.feature.properties.name = layer.feature.properties.name || `Object ${L.stamp(layer)}`;
    layer.feature.properties.comments = layer.feature.properties.comments || "";
    layer.feature.properties.id = L.stamp(layer);

    setupPopup(layer);
    updateTable();
});

// Event: When an object is edited (geometry changes)
map.on('pm:edit', () => updateTable());

// 3. Metadata & UI Updates
function setupPopup(layer) {
    const id = L.stamp(layer);
    const props = layer.feature.properties;

    const content = document.createElement('div');
    content.className = 'popup-form';
    content.innerHTML = `
        <label>Object Name:</label>
        <input type="text" id="edit-name-${id}" value="${props.name}">
        <label>Security Comments:</label>
        <textarea id="edit-comment-${id}" rows="3">${props.comments}</textarea>
        <div style="display: flex; gap: 5px;">
            <button onclick="saveData(${id})" style="background: #28a745; flex: 1;">Save</button>
            <button onclick="deleteObject(${id})" style="background: #dc3545; flex: 1;">Delete</button>
        </div>
    `;
    layer.bindPopup(content, { minWidth: 200 });
}

window.saveData = (id) => {
    const layer = drawnItems.getLayer(id);
    layer.feature.properties.name = document.getElementById(`edit-name-${id}`).value;
    layer.feature.properties.comments = document.getElementById(`edit-comment-${id}`).value;
    layer.closePopup();
    updateTable();
};

window.deleteObject = (id) => {
    if (confirm("Delete this map object and all associated metadata?")) {
        const layer = drawnItems.getLayer(id);
        if (layer) {
            drawnItems.removeLayer(layer);
            updateTable();
        }
    }
};

function updateTable() {
    const tbody = document.querySelector('#object-table tbody');
    tbody.innerHTML = '';

    drawnItems.eachLayer((layer) => {
        const id = L.stamp(layer);
        const props = layer.feature.properties;
        const type = layer instanceof L.Polygon ? 'Area' : layer instanceof L.Polyline ? 'Line' : 'Point';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${type}</strong></td>
            <td>${props.name}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-zoom" onclick="zoomToObject(${id})">Zoom</button>
                    <button class="btn-delete" onclick="deleteObject(${id})">Del</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.zoomToObject = (id) => {
    const layer = drawnItems.getLayer(id);
    if (layer instanceof L.Marker) {
        map.setView(layer.getLatLng(), 16);
    } else {
        map.fitBounds(layer.getBounds());
    }
    layer.openPopup();
};

// 4. Data Import / Export
window.exportGeoJSON = () => {
    const data = drawnItems.toGeoJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GIS_Export_${new Date().toISOString().slice(0,10)}.geojson`;
    a.click();
};

window.exportCSV = () => {
    let csv = "Type,Name,Comments,Coordinates\n";
    drawnItems.eachLayer((layer) => {
        const props = layer.feature.properties;
        const type = layer instanceof L.Polygon ? 'Area' : layer instanceof L.Polyline ? 'Line' : 'Point';
        const coords = JSON.stringify(layer.toGeoJSON().geometry.coordinates).replace(/,/g, '|');
        csv += `${type},"${props.name}","${props.comments}","${coords}"\n`;
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Inventory_Summary_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
};

window.importGeoJSON = (event) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            L.geoJSON(data, {
                onEachFeature: (feature, layer) => {
                    layer.feature = feature;
                    // Ensure properties exist
                    layer.feature.properties.name = feature.properties.name || "Imported Object";
                    layer.feature.properties.comments = feature.properties.comments || "";
                    drawnItems.addLayer(layer);
                    setupPopup(layer);
                }
            });
            updateTable();
        } catch (err) {
            alert("Error parsing GeoJSON file.");
        }
    };
    reader.readAsText(event.target.files[0]);
};
