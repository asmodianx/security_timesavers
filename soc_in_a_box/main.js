/**
 * SOC in a Box - Shell Logic
 */
const Desktop = {
    activeZIndex: 100,
    openApps: {},
    userApps: [],

    init() {
        this.loadUserApps();
        this.renderStartMenu();
        this.attachEventListeners();
        this.startClock(); 
        console.log("SOC in a Box: Ready.");
    },

    startClock() {
        const update = () => {
            const now = new Date();
            const localTimeEl = document.getElementById('clock-local-time');
            const localDateEl = document.getElementById('clock-local-date');
            if (localTimeEl) localTimeEl.textContent = now.toLocaleTimeString([], { hour12: false });
            if (localDateEl) localDateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
            
            const utcTimeEl = document.getElementById('clock-utc-time');
            if (utcTimeEl) {
                const h = String(now.getUTCHours()).padStart(2, '0');
                const m = String(now.getUTCMinutes()).padStart(2, '0');
                const s = String(now.getUTCSeconds()).padStart(2, '0');
                utcTimeEl.textContent = `${h}:${m}:${s}`;
            }
        };
        setInterval(update, 1000);
        update();
    },

    loadUserApps() {
        const saved = localStorage.getItem('soc_user_apps');
        if (saved) {
            try { this.userApps = JSON.parse(saved); } catch (e) { this.userApps = []; }
        }
    },

    renderStartMenu() {
        const appList = document.getElementById('app-list');
        if (!appList) return;
        appList.innerHTML = ''; 

        if (typeof SYSTEM_APPS !== 'undefined') {
            for (const [groupName, apps] of Object.entries(SYSTEM_APPS)) {
                this.createMenuSection(groupName, apps, appList);
            }
        }
        if (this.userApps.length > 0) {
            this.createMenuSection("Custom Tools", this.userApps, appList);
        }
    },

    createMenuSection(name, apps, container) {
        const header = document.createElement('div');
        header.className = 'menu-section-header';
        header.textContent = name;
        container.appendChild(header);

        apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'start-menu-item';
            const iconSpan = document.createElement('span');
            iconSpan.textContent = app.icon || '🔗';
            const titleSpan = document.createElement('span');
            titleSpan.textContent = app.title;
            item.append(iconSpan, titleSpan);
            item.onclick = (e) => { e.stopPropagation(); this.executeOpen(app); this.toggleStartMenu(); };
            container.appendChild(item);
        });
    },

    executeOpen(app) {
        if (this.openApps[app.id]) { this.restoreApp(app.id); return; }

        const win = document.createElement('div');
        win.className = 'window';
        win.id = `win-${app.id}`;
        win.style.top = '60px'; win.style.left = '60px';
        win.style.zIndex = ++this.activeZIndex;

        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';
        const titleText = document.createElement('div');
        titleText.className = 'title-text';
        titleText.textContent = `${app.icon || '🔗'} ${app.title}`;

        const controls = document.createElement('div');
        controls.className = 'window-controls';
        const minBtn = document.createElement('button'); minBtn.className = 'win-btn'; minBtn.textContent = '_';
        minBtn.onclick = (e) => { e.stopPropagation(); this.toggleMinimize(app.id); };
        const maxBtn = document.createElement('button'); maxBtn.className = 'win-btn'; maxBtn.textContent = '▢';
        maxBtn.onclick = (e) => { e.stopPropagation(); this.maximizeApp(app.id); };
        const closeBtn = document.createElement('button'); closeBtn.className = 'win-btn close'; closeBtn.textContent = '✕';
        closeBtn.onclick = (e) => { e.stopPropagation(); this.closeApp(app.id); };
        controls.append(minBtn, maxBtn, closeBtn);
        titleBar.append(titleText, controls);

        const contentArea = document.createElement('div');
        contentArea.className = 'window-content';

        if (app.url === 'internal:notepad') {
            this.buildNotepad(contentArea);
        } else {
            const ifr = document.createElement('iframe');
            ifr.src = app.url;
            ifr.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-downloads allow-popups allow-modals');
            contentArea.appendChild(ifr);
        }

        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        win.append(titleBar, contentArea, resizer);
        document.getElementById('desktop').appendChild(win);
        
        this.openApps[app.id] = { el: win, title: app.title, icon: app.icon };
        this.makeDraggable(win);
        this.makeResizable(win);
        this.addToTaskbar(app.id);
        win.addEventListener('mousedown', () => this.bringToFront(win));
    },

    // Build the Triage Notepad with Formatting Buttons
    buildNotepad(container) {
        const wrap = document.createElement('div');
        wrap.className = 'notepad-container';

        const toolbar = document.createElement('div');
        toolbar.className = 'notepad-toolbar';

        const editor = document.createElement('textarea');
        editor.className = 'internal-notepad';
        editor.placeholder = "Incident triage notes...";

        // Formatting Helpers
        const applyFormat = (prefix, suffix = "") => {
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const text = editor.value;
            const before = text.substring(0, start);
            const selected = text.substring(start, end);
            const after = text.substring(end);

            editor.value = before + prefix + selected + suffix + after;
            editor.focus();
            // Maintain selection or set cursor inside tags
            const newPos = start + prefix.length;
            editor.setSelectionRange(newPos, newPos + selected.length);
        };

        const applyLineFormat = (prefix) => {
            const start = editor.selectionStart;
            const text = editor.value;
            const lastNewLine = text.lastIndexOf("\n", start - 1);
            const lineStart = lastNewLine + 1;
            
            const before = text.substring(0, lineStart);
            const after = text.substring(lineStart);
            
            editor.value = before + prefix + after;
            editor.focus();
            editor.setSelectionRange(start + prefix.length, start + prefix.length);
        };

        // Create Toolbar Buttons
        const buttons = [
            { label: "B", title: "Bold", action: () => applyFormat("**", "**") },
            { label: "I", title: "Italic", action: () => applyFormat("*", "*") },
            { label: "H1", title: "Heading 1", action: () => applyLineFormat("# ") },
            { label: "H2", title: "Heading 2", action: () => applyLineFormat("## ") },
            { type: "separator" },
            { label: "• List", title: "Bullet List", action: () => applyLineFormat("* ") },
            { label: "1. List", title: "Numbered List", action: () => applyLineFormat("1. ") },
            { label: "Check", title: "Task List", action: () => applyLineFormat("- [ ] ") },
            { type: "separator" },
            { label: "Code", title: "Code Block", action: () => applyFormat("```\n", "\n```") },
            { label: "Save File", title: "Download Notes", class: "save-btn", action: () => {
                const blob = new Blob([editor.value], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `triage_notes_${new Date().getTime()}.md`;
                a.click();
                URL.revokeObjectURL(url);
            }}
        ];

        buttons.forEach(btn => {
            if (btn.type === "separator") {
                const sep = document.createElement('div');
                sep.className = 'separator';
                toolbar.appendChild(sep);
            } else {
                const b = document.createElement('button');
                b.textContent = btn.label;
                if (btn.class) b.className = btn.class;
                b.title = btn.title;
                b.onclick = btn.action;
                toolbar.appendChild(b);
            }
        });

        wrap.append(toolbar, editor);
        container.appendChild(wrap);
    },

    addToTaskbar(appId) {
        const app = this.openApps[appId];
        if (!app) return;
        const btn = document.createElement('button');
        btn.className = 'taskbar-app';
        btn.id = `task-btn-${appId}`;
        btn.textContent = `${app.icon || '🔗'} ${app.title}`;
        btn.onclick = (e) => { e.stopPropagation(); this.toggleMinimize(appId); };
        document.getElementById('active-apps-bar').appendChild(btn);
    },

    toggleMinimize(appId) {
        const winEl = this.openApps[appId].el;
        if (winEl.classList.contains('minimized')) {
            winEl.classList.remove('minimized');
            this.bringToFront(winEl);
        } else { winEl.classList.add('minimized'); }
    },

    maximizeApp(appId) { this.openApps[appId].el.classList.toggle('maximized'); },

    closeApp(appId) {
        if (this.openApps[appId]) {
            this.openApps[appId].el.remove();
            const taskBtn = document.getElementById(`task-btn-${appId}`);
            if (taskBtn) taskBtn.remove();
            delete this.openApps[appId];
        }
    },

    restoreApp(appId) {
        const winEl = this.openApps[appId].el;
        winEl.classList.remove('minimized');
        this.bringToFront(winEl);
    },

    bringToFront(winEl) { winEl.style.zIndex = ++this.activeZIndex; },

    makeDraggable(winEl) {
        const titleBar = winEl.querySelector('.title-bar');
        titleBar.onmousedown = (e) => {
            if (winEl.classList.contains('maximized') || e.target.closest('.window-controls')) return;
            winEl.classList.add('dragging');
            let startX = e.clientX, startY = e.clientY;
            let startTop = winEl.offsetTop, startLeft = winEl.offsetLeft;
            const move = (e) => {
                winEl.style.top = (startTop + (e.clientY - startY)) + "px";
                winEl.style.left = (startLeft + (e.clientX - startX)) + "px";
            };
            const stop = () => { 
                winEl.classList.remove('dragging');
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', stop);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        };
    },

    makeResizable(winEl) {
        const resizer = winEl.querySelector('.resizer');
        resizer.onmousedown = (e) => {
            e.stopPropagation(); e.preventDefault();
            winEl.classList.add('resizing');
            let startW = winEl.offsetWidth, startH = winEl.offsetHeight;
            let startX = e.clientX, startY = e.clientY;
            const move = (e) => {
                const w = startW + (e.clientX - startX);
                const h = startH + (e.clientY - startY);
                if (w > 350) winEl.style.width = w + 'px';
                if (h > 250) winEl.style.height = h + 'px';
            };
            const stop = () => {
                winEl.classList.remove('resizing');
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', stop);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        };
    },

    showAddAppDialog() {
        const title = prompt("Tool Name:");
        const url = prompt("URL:");
        const urlPattern = /^(https?:\/\/|\.\/|\.\.\/)/i;
        if (title && url && urlPattern.test(url)) {
            const newApp = { id: `user-${Date.now()}`, title, url, icon: '🔗' };
            this.userApps.push(newApp);
            localStorage.setItem('soc_user_apps', JSON.stringify(this.userApps));
            this.renderStartMenu();
        } else if (url) { alert("Invalid URL protocol."); }
    },

    toggleStartMenu() { document.getElementById('start-menu').classList.toggle('hidden'); },

    attachEventListeners() {
        const startBtn = document.getElementById('start-button');
        const startMenu = document.getElementById('start-menu');
        if (!startBtn || !startMenu) return;

        startBtn.onclick = (e) => { e.stopPropagation(); this.toggleStartMenu(); };
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && e.target !== startBtn) {
                startMenu.classList.add('hidden');
            }
        });
    }
};

Desktop.init();
