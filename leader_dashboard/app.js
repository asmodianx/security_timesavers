/**
 * Tactical Operations Logger (TOL)
 * Final Build: Full Editable Roster Cards & Deletion Logic
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'tol_offline_data';

    // ============================================================================
    // THE GLOBAL STATE ENGINE
    // ============================================================================
    const StateEngine = {
        data: {
            incidentName: "",
            operationalPeriod: "",
            commsPlan: "",
            personnel: [], 
            logs: [],      
            resources: [], 
            triage: { red: 0, yellow: 0, green: 0, black: 0 }
        },

        load: function() {
            const fileString = localStorage.getItem(STORAGE_KEY);
            if (fileString) {
                try {
                    const parsedData = JSON.parse(fileString);
                    this.data = { ...this.data, ...parsedData };
                    if (!Array.isArray(this.data.personnel)) this.data.personnel = [];
                    if (!Array.isArray(this.data.logs)) this.data.logs = [];
                    if (!Array.isArray(this.data.resources)) this.data.resources = [];
                } catch (error) {
                    console.error("[File I/O Error] Parse failed:", error);
                }
            }
        },

        save: function() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            } catch (error) {
                console.error("[File I/O Error] Save failed:", error);
            }
        },

        clearData: function() {
            this.data = {
                incidentName: "",
                operationalPeriod: "",
                commsPlan: "",
                personnel: [], 
                logs: [],      
                resources: [], 
                triage: { red: 0, yellow: 0, green: 0, black: 0 }
            };
            this.save();
        },

        updateInit: function(name, period, comms) {
            this.data.incidentName = name;
            this.data.operationalPeriod = period;
            this.data.commsPlan = comms;
            this.save();
        },

        addPersonnel: function(memberObj) {
            // [ARRAY OPERATION]: Appending a complete object built from manual fields
            this.data.personnel.push(memberObj);
            this.save();
        },

        setPersonnelStatus: function(index, newStatus) {
            const currentStatus = this.data.personnel[index].status;
            if (currentStatus !== newStatus) {
                this.data.personnel[index].status = newStatus;
                const p = this.data.personnel[index];
                this.addLog(`ROSTER: ${p.lastName} is now ${newStatus}`, "PERSONNEL");
                this.save();
            }
        },

        updatePersonnelField: function(index, field, value) {
            // [ARRAY OPERATION]: Access object by index bracket [] and dynamic property bracket []
            const currentVal = this.data.personnel[index][field];
            if (currentVal !== value) {
                this.data.personnel[index][field] = value;
                const p = this.data.personnel[index];
                const displayField = field.charAt(0).toUpperCase() + field.slice(1);
                
                // Silent save for edits to prevent log flooding, except for Team assignments
                if (field === 'team') {
                    this.addLog(`ROSTER: ${p.lastName} assigned to Team: ${value}`, "PERSONNEL");
                }
                this.save();
            }
        },

        removePersonnel: function(index) {
            // [ARRAY OPERATION]: Access object to log it, then splice to destroy it
            const p = this.data.personnel[index];
            this.addLog(`ROSTER DELETED: ${p.lastName}, ${p.firstName} removed from active roster.`, "PERSONNEL");
            
            // [ARRAY OPERATION]: Splice destroys the index and shrinks array length by 1
            this.data.personnel.splice(index, 1);
            this.save();
        },

        addLog: function(message, category = "NARRATIVE") {
            const entry = {
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" }),
                category: category,
                message: message
            };
            this.data.logs.push(entry);
            this.save();
        },

        updateTriage: function(color, amount) {
            this.data.triage[color] += amount;
            if (this.data.triage[color] < 0) this.data.triage[color] = 0; 
            this.addLog(`TRIAGE UPDATE - ${color.toUpperCase()}: ${this.data.triage[color]}`, "TRIAGE");
            this.save();
        },

        addResource: function(name, qty) {
            const entry = {
                id: Date.now().toString(),
                name: name,
                qty: qty,
                status: 'REQUESTED',
                timeRequested: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" })
            };
            this.data.resources.push(entry);
            this.addLog(`LOGISTICS REQ: ${qty}x ${name}`, "LOGISTICS");
            this.save();
        },

        updateResourceStatus: function(index, newStatus) {
            const currentStatus = this.data.resources[index].status;
            if (currentStatus !== newStatus) {
                const currentName = this.data.resources[index].name;
                this.data.resources[index].status = newStatus;
                let plainTextStatus = newStatus === 'RECEIVED' ? 'ON SCENE' : newStatus;
                this.addLog(`LOGISTICS UPDATE: ${currentName} is now ${plainTextStatus}`, "LOGISTICS");
                this.save();
            }
        }
    };

    // ============================================================================
    // APPLICATION BINDING
    // ============================================================================
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        registerServiceWorker();
        
        StateEngine.load(); 
        
        bindInitModule();
        bindPersonnelModule();
        bindLogModule();
        bindLogisticsModule();
        bindExportModule(); 
        
        renderAllUI();
    });

    function renderAllUI() {
        renderInitData();
        renderRosterUI();
        renderTriageUI();
        renderLogUI();
        renderLogisticsUI(); 
    }

    // --- Module 3.1: Incident Init ---
    function bindInitModule() {
        document.getElementById('btn-save-init').addEventListener('click', () => {
            StateEngine.updateInit(
                document.getElementById('inc-name').value,
                document.getElementById('inc-period').value,
                document.getElementById('inc-comms').value
            );
            const statusMsg = document.getElementById('init-status');
            statusMsg.textContent = "Incident data saved.";
            setTimeout(() => { statusMsg.textContent = ""; }, 3000);
        });
    }

    function renderInitData() {
        document.getElementById('inc-name').value = StateEngine.data.incidentName || "";
        document.getElementById('inc-period').value = StateEngine.data.operationalPeriod || "";
        document.getElementById('inc-comms').value = StateEngine.data.commsPlan || "";
    }

    // --- Module 3.2: Roster (Manual Entry & Fully Editable UI) ---
    function bindPersonnelModule() {
        
        document.getElementById('btn-camera-scan').addEventListener('click', () => {
            alert("FEATURE STUB: HTML5 Camera API / Barcode decoding will be implemented here in a future update.");
        });

        document.getElementById('btn-add-manual').addEventListener('click', () => {
            const lName = document.getElementById('manual-lname').value.trim();
            const fName = document.getElementById('manual-fname').value.trim();
            const rRole = document.getElementById('manual-role').value.trim() || "Responder";
            const tTeam = document.getElementById('manual-team').value.trim() || "Unassigned";

            if (lName && fName) {
                StateEngine.addPersonnel({
                    id: Date.now().toString(),
                    lastName: lName,
                    firstName: fName,
                    role: rRole,
                    team: tTeam,
                    status: "AVAILABLE",
                    checkInTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" })
                });
                
                StateEngine.addLog(`CHECK-IN: ${lName}, ${fName}`, "PERSONNEL");
                renderRosterUI();
                renderLogUI();
                
                document.getElementById('manual-lname').value = "";
                document.getElementById('manual-fname').value = "";
                document.getElementById('manual-role').value = "";
                document.getElementById('manual-team').value = "";
            } else { 
                alert("Please enter at least a First and Last Name."); 
            }
        });
    }

    function renderRosterUI() {
        const rosterList = document.getElementById('roster-list');
        document.getElementById('roster-count').textContent = StateEngine.data.personnel.length;
        rosterList.innerHTML = ""; 
        
        // Build Team Summary
        const teamSet = new Set();
        StateEngine.data.personnel.forEach(p => {
            if (p.team && p.team !== "Unassigned" && p.team.trim() !== "") teamSet.add(p.team);
        });
        const teamArray = Array.from(teamSet);
        const teamSummaryEl = document.getElementById('team-summary');
        if (teamSummaryEl) {
            if (teamArray.length > 0) {
                teamSummaryEl.textContent = "Active Teams: " + teamArray.join(", ");
                teamSummaryEl.style.display = "block";
            } else {
                teamSummaryEl.style.display = "none";
            }
        }

        StateEngine.data.personnel.forEach((member, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'roster-item';
            
            itemDiv.innerHTML = `
                <div class="roster-header-row">
                    <span class="res-meta">In: ${member.checkInTime}</span>
                    <button class="roster-del-btn" data-index="${index}" title="Remove Personnel">✖</button>
                </div>
                
                <div class="roster-edit-grid">
                    <div class="r-edit-group">
                        <label>Last Name</label>
                        <input type="text" class="r-edit-input" data-field="lastName" data-index="${index}" value="${member.lastName}">
                    </div>
                    <div class="r-edit-group">
                        <label>First Name</label>
                        <input type="text" class="r-edit-input" data-field="firstName" data-index="${index}" value="${member.firstName}">
                    </div>
                    <div class="r-edit-group">
                        <label>Role</label>
                        <input type="text" class="r-edit-input" data-field="role" data-index="${index}" value="${member.role}">
                    </div>
                    <div class="r-edit-group">
                        <label>Team</label>
                        <input type="text" class="r-edit-input" data-field="team" data-index="${index}" value="${member.team}">
                    </div>
                </div>

                <div class="roster-status-group">
                    <button class="roster-btn ${member.status === 'AVAILABLE' ? 'active-avl' : ''}" data-index="${index}" data-status="AVAILABLE">AVL</button>
                    <button class="roster-btn ${member.status === 'DEPLOYED' ? 'active-dep' : ''}" data-index="${index}" data-status="DEPLOYED">DEP</button>
                    <button class="roster-btn ${member.status === 'RESTING' ? 'active-rst' : ''}" data-index="${index}" data-status="RESTING">RST</button>
                    <button class="roster-btn ${member.status === 'DEMOBED' ? 'active-dmb' : ''}" data-index="${index}" data-status="DEMOBED">DMB</button>
                </div>
            `;
            rosterList.appendChild(itemDiv);
        });

        // Bind Status Toggles
        document.querySelectorAll('.roster-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                const newStatus = e.target.getAttribute('data-status');
                StateEngine.setPersonnelStatus(idx, newStatus);
                renderRosterUI(); 
                renderLogUI();
            });
        });

        // Bind Text Input Changes
        document.querySelectorAll('.r-edit-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                const field = e.target.getAttribute('data-field');
                const newVal = e.target.value.trim() || "Unknown";
                
                StateEngine.updatePersonnelField(idx, field, newVal);
                renderRosterUI(); // Required to update the Team Summary badge
                renderLogUI();
            });
        });

        // Bind Delete Protocol
        document.querySelectorAll('.roster-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                const p = StateEngine.data.personnel[idx];
                
                if (confirm(`WARNING: Are you sure you want to completely remove ${p.lastName}, ${p.firstName} from the active roster?`)) {
                    StateEngine.removePersonnel(idx);
                    renderRosterUI();
                    renderLogUI();
                }
            });
        });
    }

    // --- Module 3.3: Logs & Triage ---
    function bindLogModule() {
        document.querySelectorAll('.t-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                StateEngine.updateTriage(e.target.getAttribute('data-color'), parseInt(e.target.getAttribute('data-val'), 10));
                renderTriageUI();
                renderLogUI();
            });
        });
        const logInput = document.getElementById('log-input');
        document.querySelectorAll('.macro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                logInput.value = (logInput.value + " " + e.target.textContent).trim() + " ";
                logInput.focus();
            });
        });
        document.getElementById('btn-submit-log').addEventListener('click', submitManualLog);
        logInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitManualLog(); });
        function submitManualLog() {
            const val = logInput.value.trim();
            if (val) {
                StateEngine.addLog(val, "NARRATIVE");
                logInput.value = ""; renderLogUI();
            }
        }
    }

    function renderTriageUI() {
        document.getElementById('t-count-red').textContent = StateEngine.data.triage.red;
        document.getElementById('t-count-yellow').textContent = StateEngine.data.triage.yellow;
        document.getElementById('t-count-green').textContent = StateEngine.data.triage.green;
        document.getElementById('t-count-black').textContent = StateEngine.data.triage.black;
    }

    function renderLogUI() {
        const logFeed = document.getElementById('log-feed');
        logFeed.innerHTML = "";
        const reversedLogs = StateEngine.data.logs.slice().reverse();
        reversedLogs.forEach(log => {
            const logDiv = document.createElement('div');
            logDiv.className = 'log-item';
            if (log.category === "TRIAGE") logDiv.classList.add('log-cat-triage');
            if (log.category === "PERSONNEL") logDiv.classList.add('log-cat-personnel');
            if (log.category === "LOGISTICS") logDiv.classList.add('log-cat-logistics');
            logDiv.innerHTML = `
                <div class="log-meta"><span>${log.timestamp}</span><span>${log.category}</span></div>
                <div class="log-msg">${log.message}</div>
            `;
            logFeed.appendChild(logDiv);
        });
    }

    // --- Module 3.4: Logistics ---
    function bindLogisticsModule() {
        document.getElementById('btn-req-resource').addEventListener('click', () => {
            const inputName = document.getElementById('res-name');
            const inputQty = document.getElementById('res-qty');
            const name = inputName.value.trim();
            const qty = inputQty.value.trim() || "1";
            if (name) {
                StateEngine.addResource(name, qty);
                inputName.value = ""; inputQty.value = "";
                renderLogisticsUI(); renderLogUI(); 
            }
        });
    }

    function renderLogisticsUI() {
        const list = document.getElementById('resource-list');
        document.getElementById('resource-count').textContent = StateEngine.data.resources.length;
        list.innerHTML = "";
        StateEngine.data.resources.forEach((res, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'resource-item';
            itemDiv.innerHTML = `
                <div class="res-header">
                    <div class="res-name">${res.qty}x ${res.name}</div>
                    <div class="res-meta">Req: ${res.timeRequested}</div>
                </div>
                <div class="res-status-group">
                    <button class="res-status-btn ${res.status === 'REQUESTED' ? 'active-req' : ''}" data-index="${index}" data-status="REQUESTED">REQ</button>
                    <button class="res-status-btn ${res.status === 'ENROUTE' ? 'active-enr' : ''}" data-index="${index}" data-status="ENROUTE">EN ROUTE</button>
                    <button class="res-status-btn ${res.status === 'RECEIVED' ? 'active-rcv' : ''}" data-index="${index}" data-status="RECEIVED">ON SCENE</button>
                </div>
            `;
            list.appendChild(itemDiv);
        });
        document.querySelectorAll('.res-status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                const newStatus = e.target.getAttribute('data-status');
                StateEngine.updateResourceStatus(idx, newStatus);
                renderLogisticsUI(); renderLogUI();
            });
        });
    }

    // --- Phase 4 & 5: Export / Import Engine & Lifecycle ---
    function bindExportModule() {
        const btnGenMd = document.getElementById('btn-generate-md');
        const btnCopyMd = document.getElementById('btn-copy-md');
        const mdOutput = document.getElementById('export-md-output');
        const btnExportJson = document.getElementById('btn-export-json');
        
        const fileInput = document.getElementById('import-json-file');
        const btnImportTrigger = document.getElementById('btn-import-trigger');
        const btnClearData = document.getElementById('btn-clear-data');

        btnGenMd.addEventListener('click', () => { mdOutput.value = generateMarkdown(); });

        btnCopyMd.addEventListener('click', () => {
            if (mdOutput.value) {
                navigator.clipboard.writeText(mdOutput.value).then(() => {
                    btnCopyMd.textContent = "Copied!";
                    setTimeout(() => { btnCopyMd.textContent = "Copy to Clipboard"; }, 2000);
                });
            }
        });

        btnExportJson.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(StateEngine.data, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `TOL_Export_${Date.now()}.json`);
            dlAnchorElem.click();
        });

        btnImportTrigger.addEventListener('click', () => { fileInput.click(); });
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files;
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (!Array.isArray(importedData.personnel)) importedData.personnel = [];
                    if (!Array.isArray(importedData.logs)) importedData.logs = [];
                    if (!Array.isArray(importedData.resources)) importedData.resources = [];
                    if (!importedData.triage) importedData.triage = { red: 0, yellow: 0, green: 0, black: 0 };
                    
                    importedData.personnel.forEach(p => {
                        if (!p.team) p.team = "Unassigned";
                    });

                    StateEngine.data = importedData;
                    StateEngine.save();
                    
                    renderAllUI();
                    alert("JSON State Imported Successfully!");
                    
                } catch (error) {
                    alert("Error parsing JSON file. Is it corrupted?");
                    console.error("[File I/O Error] Import parse failed:", error);
                }
            };
            reader.readAsText(file);
            fileInput.value = ""; 
        });

        btnClearData.addEventListener('click', () => {
            const confirmed = confirm("WARNING: This will permanently delete all incident data, logs, and rosters from this device. Are you sure you want to end this incident?");
            if (confirmed) {
                StateEngine.clearData();
                mdOutput.value = ""; 
                renderAllUI();       
                alert("Device wiped. Ready for new incident.");
            }
        });
    }

    function generateMarkdown() {
        const d = StateEngine.data;
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" });
        
        let md = `## SITREP: ${d.incidentName || "UNNAMED INCIDENT"}\n`;
        md += `**Time:** ${now} | **Period:** ${d.operationalPeriod}\n`;
        md += `**Comms:** ${d.commsPlan}\n\n`;
        
        md += `### TRIAGE STATUS\n`;
        md += `- IMM (R): ${d.triage.red} | DLY (Y): ${d.triage.yellow}\n`;
        md += `- MIN (G): ${d.triage.green} | DEC (B): ${d.triage.black}\n\n`;

        if (d.personnel.length > 0) {
            const teamSet = new Set();
            d.personnel.forEach(p => {
                if (p.team && p.team !== "Unassigned" && p.team.trim() !== "") teamSet.add(p.team);
            });
            const teamArray = Array.from(teamSet);
            
            md += `### ROSTER (${d.personnel.length})\n`;
            if (teamArray.length > 0) {
                md += `**Active Teams:** ${teamArray.join(', ')}\n\n`;
            }
            
            d.personnel.forEach(p => {
                let statusFlag = "[AVL]";
                if (p.status === "DEPLOYED") statusFlag = "[DEP]";
                if (p.status === "RESTING") statusFlag = "[RST]";
                if (p.status === "DEMOBED") statusFlag = "[DMB]";
                md += `- ${statusFlag} ${p.lastName}, ${p.firstName} (${p.role}) - Team: ${p.team}\n`;
            });
            md += `\n`;
        }

        if (d.resources.length > 0) {
            md += `### LOGISTICS\n`;
            d.resources.forEach(r => { md += `- [${r.status}] ${r.qty}x ${r.name}\n`; });
            md += `\n`;
        }

        if (d.logs.length > 0) {
            md += `### TACTICAL LOG (LATEST 10)\n`;
            const recentLogs = d.logs.slice(-10);
            recentLogs.forEach(l => { md += `[${l.timestamp}] ${l.message}\n`; });
        }

        return md;
    }

    // --- Navigation UI Logic ---
    function initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                navButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                button.classList.add('active');
                const targetTabId = button.getAttribute('data-target');
                const activeTab = document.getElementById(targetTabId);
                if (activeTab) activeTab.classList.add('active');
            });
        });
    }

    // --- Service Worker & Contextual Error Logic ---
    function registerServiceWorker() {
        const isLocalFile = window.location.protocol === 'file:';
        if (isLocalFile) {
            console.warn('[SW App] Running from local file:// protocol. Offline caching disabled.');
            updateStatusIndicator('local');
            return;
        }
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(() => updateStatusIndicator('ready'))
                    .catch(() => updateStatusIndicator('error'));
            });
        } else {
            updateStatusIndicator('error');
        }
    }

    function updateStatusIndicator(state) {
        const topIndicator = document.getElementById('top-status-indicator');
        if (state === 'ready') {
            topIndicator.innerHTML = '<span class="status-dot" style="background-color: #4CAF50;"></span> Offline Ready';
        } else if (state === 'local') {
            topIndicator.innerHTML = '<span class="status-dot" style="background-color: #FFC107;"></span> Local File (No SW)';
        } else {
            topIndicator.innerHTML = '<span class="status-dot" style="background-color: #F44336;"></span> SW Error';
        }
    }
})();