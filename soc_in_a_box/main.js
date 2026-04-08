/**
 * SOC in a Box - OS Shell
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
        console.log("SOC in a Box: Systems Nominal.");
    },

    startClock() {
        const update = () => {
            const now = new Date();
            
            // Local Time & Date
            const localTimeEl = document.getElementById('clock-local-time');
            const localDateEl = document.getElementById('clock-local-date');
            
            if (localTimeEl) localTimeEl.textContent = now.toLocaleTimeString([], { hour12: false });
            if (localDateEl) localDateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
            
            // UTC Time - Explicit component getters to prevent string split failures
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
        if (saved) this.userApps = JSON.parse(saved);
    },

    renderStartMenu() {
        const appList = document.getElementById('app-list');
        appList.innerHTML = '';
        const allApps = [...SYSTEM_APPS, ...this.userApps];

        allApps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'start-menu-item';
            item.innerHTML = `<span>${app.icon}</span> <span>${app.title}</span>`;
            item.onclick = () => { this.executeOpen(app); this.toggleStartMenu(); };
            appList.appendChild(item);
        });
    },

    executeOpen(app) {
        if (this.openApps[app.id]) {
            this.restoreApp(app.id);
            return;
        }

        const win = document.createElement('div');
        win.className = 'window';
        win.id = `win-${app.id}`;
        win.style.top = '60px'; win.style.left = '60px';
        win.style.zIndex = ++this.activeZIndex;

        let contentHtml = '';
        if (app.url === 'internal:notepad') {
            contentHtml = `<textarea class="internal-notepad" placeholder="Incident triage notes..."></textarea>`;
        } else {
            contentHtml = `<iframe src="${app.url}" sandbox="allow-scripts allow-forms allow-same-origin allow-downloads allow-popups allow-modals"></iframe>`;
        }

        win.innerHTML = `
            <div class="title-bar">
                <div class="title-text">${app.icon} ${app.title}</div>
                <div class="window-controls">
                    <button class="win-btn" onclick="event.stopPropagation(); Desktop.toggleMinimize('${app.id}')">_</button>
                    <button class="win-btn" onclick="event.stopPropagation(); Desktop.maximizeApp('${app.id}')">▢</button>
                    <button class="win-btn close" onclick="event.stopPropagation(); Desktop.closeApp('${app.id}')">✕</button>
                </div>
            </div>
            <div class="window-content">${contentHtml}</div>
            <div class="resizer"></div>
        `;

        document.getElementById('desktop').appendChild(win);
        this.openApps[app.id] = { el: win, title: app.title, icon: app.icon };
        
        this.makeDraggable(win);
        this.makeResizable(win);
        this.addToTaskbar(app.id);
        win.addEventListener('mousedown', () => this.bringToFront(win));
    },

    addToTaskbar(appId) {
        const app = this.openApps[appId];
        const btn = document.createElement('button');
        btn.className = 'taskbar-app';
        btn.id = `task-btn-${appId}`;
        btn.innerHTML = `${app.icon} ${app.title}`;
        btn.onclick = () => this.toggleMinimize(appId);
        document.getElementById('active-apps-bar').appendChild(btn);
    },

    toggleMinimize(appId) {
        const winEl = this.openApps[appId].el;
        if (winEl.classList.contains('minimized')) {
            winEl.classList.remove('minimized');
            this.bringToFront(winEl);
        } else {
            winEl.classList.add('minimized');
        }
    },

    maximizeApp(appId) {
        this.openApps[appId].el.classList.toggle('maximized');
    },

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
            if (winEl.classList.contains('maximized')) return;
            if (e.target.closest('.window-controls')) return;

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
        const url = prompt("URL (relative path or https://):");
        if (title && url) {
            const newApp = { id: `user-${Date.now()}`, title, url, icon: '🔗' };
            this.userApps.push(newApp);
            localStorage.setItem('soc_user_apps', JSON.stringify(this.userApps));
            this.renderStartMenu();
        }
    },

    toggleStartMenu() { document.getElementById('start-menu').classList.toggle('hidden'); },

    attachEventListeners() {
        document.getElementById('start-button').onclick = () => this.toggleStartMenu();
        document.getElementById('desktop').onclick = (e) => {
            if (e.target.id === 'desktop') document.getElementById('start-menu').classList.add('hidden');
        };
    }
};

Desktop.init();
