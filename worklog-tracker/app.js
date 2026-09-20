/**
 * WorkLog Tracker - app.js
 * OWASP Best Practices Applied:
 *   - All DOM text set via textContent (no innerHTML with user data)
 *   - DOMPurify-style escaping for any displayed user strings
 *   - No eval(), no inline event handlers
 *   - Input validation on all user fields
 *   - JSON import validated before applying to state
 *   - CSP-compatible (no inline scripts in HTML)
 */

"use strict";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sanitize a string for safe DOM text insertion.
 * Strips tags; used as a belt-and-suspenders guard since we use textContent.
 */
function sanitizeText(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[<>"'`]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;"
  }[c]));
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function pad2(n) { return String(n).padStart(2, "0"); }

function nowTimeStr() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function nowDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fmtMinutes(mins) {
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  return h > 0 ? `${h}h ${pad2(m)}m` : `${m}m`;
}

function generateId() {
  return "entry_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
}

// ── Time Math Helpers ─────────────────────────────────────────────────────────

/** Convert "HH:MM" to total minutes since midnight */
function timeToMins(timeStr) {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/** Convert total minutes since midnight back to "HH:MM" */
function minsToTime(mins) {
  const clamped = Math.max(0, Math.min(mins, 23 * 60 + 59));
  return `${pad2(Math.floor(clamped / 60))}:${pad2(clamped % 60)}`;
}

/** Get the effective end time in minutes for an entry (start + duration, or just start if no duration) */
function entryEndMins(entry) {
  const start = timeToMins(entry.time);
  return entry.duration > 0 ? start + entry.duration : start;
}

// ── Punch Reconciliation ──────────────────────────────────────────────────────

/**
 * After any state mutation, recalculate Clock In / Clock Out times so they
 * always bracket all logged task entries:
 *
 *  - If a task starts BEFORE clock-in  → move clock-in earlier to match
 *  - If a task ends   AFTER  clock-out → move clock-out later  to cover it
 *  - Clock In/Out duration is auto-set to the span between the two punches
 *
 * Only fires when at least one punch entry exists.
 */
function reconcilePunches() {
  const clockInEntry  = STATE.entries.find(e => e.taskId === "gen_clockin");
  const clockOutEntry = STATE.entries.find(e => e.taskId === "gen_clockout");

  // Non-punch entries only
  const taskEntries = STATE.entries.filter(
    e => e.taskId !== "gen_clockin" && e.taskId !== "gen_clockout"
  );

  if (!clockInEntry && !clockOutEntry) return; // nothing to do

  // Determine the earliest task start and latest task end across all non-punch entries
  let earliestStart = Infinity;
  let latestEnd     = -Infinity;

  taskEntries.forEach(e => {
    const start = timeToMins(e.time);
    const end   = entryEndMins(e);
    if (start < earliestStart) earliestStart = start;
    if (end   > latestEnd)     latestEnd     = end;
  });

  let changed = false;

  if (clockInEntry) {
    let ciMins = timeToMins(clockInEntry.time);

    // Slide clock-in earlier if a task starts before it
    if (earliestStart !== Infinity && earliestStart < ciMins) {
      const oldTime = clockInEntry.time;
      clockInEntry.time = minsToTime(earliestStart);
      if (clockInEntry.time !== oldTime) {
        clockInEntry._punchNote = `Auto-adjusted from ${oldTime} to cover earlier task`;
        changed = true;
      }
      ciMins = earliestStart;
    }

    // Auto-compute Clock In duration = span to Clock Out (if both exist)
    if (clockOutEntry) {
      let coMins = timeToMins(clockOutEntry.time);

      // Slide clock-out later if a task ends after it
      if (latestEnd !== -Infinity && latestEnd > coMins) {
        const oldTime = clockOutEntry.time;
        clockOutEntry.time = minsToTime(latestEnd);
        if (clockOutEntry.time !== oldTime) {
          clockOutEntry._punchNote = `Auto-adjusted from ${oldTime} to cover later task`;
          changed = true;
        }
        coMins = latestEnd;
      }

      // Set duration on both punches to reflect the full work span
      const span = Math.max(0, coMins - ciMins);
      clockInEntry.duration  = span;
      clockOutEntry.duration = span;
    }
  } else if (clockOutEntry) {
    // Only clock-out exists — slide it later if needed
    let coMins = timeToMins(clockOutEntry.time);
    if (latestEnd !== -Infinity && latestEnd > coMins) {
      const oldTime = clockOutEntry.time;
      clockOutEntry.time = minsToTime(latestEnd);
      if (clockOutEntry.time !== oldTime) {
        clockOutEntry._punchNote = `Auto-adjusted from ${oldTime} to cover later task`;
        changed = true;
      }
    }
  }

  // Re-sort after any time adjustments
  if (changed) {
    STATE.entries.sort((a, b) => a.time.localeCompare(b.time));
  }
}

/** True if this entry is a clock punch (in or out) */
function isPunchEntry(entry) {
  return entry.taskId === "gen_clockin" || entry.taskId === "gen_clockout";
}

// ── State ────────────────────────────────────────────────────────────────────

const STATE = {
  entries: [],          // { id, taskId, label, category, icon, time, duration, note, needsTicket, ticketable, timestamp }
  favorites: new Set(),
  customTasks: [],
  analystName: "",
  date: nowDateStr(),
};

// ── Config Loader ─────────────────────────────────────────────────────────────

function applyConfig() {
  const cfg = window.WORKLOG_CONFIG || {};
  if (cfg.analystName) STATE.analystName = cfg.analystName;
  if (cfg.defaultFavorites && Array.isArray(cfg.defaultFavorites)) {
    cfg.defaultFavorites.forEach(id => STATE.favorites.add(id));
  }
  if (cfg.customTasks && Array.isArray(cfg.customTasks)) {
    cfg.customTasks.forEach(t => {
      if (t.id && t.label && t.category) {
        STATE.customTasks.push({
          id: sanitizeText(t.id),
          label: sanitizeText(t.label),
          category: t.category === "custom" ? "custom" : "custom",
          icon: sanitizeText(t.icon || "🔧"),
          ticketable: !!t.ticketable
        });
      }
    });
  }
  if (cfg.appTitle) {
    document.title = sanitizeText(cfg.appTitle);
    const h = document.getElementById("appTitle");
    if (h) h.textContent = sanitizeText(cfg.appTitle);
  }
  if (cfg.orgName) {
    const el = document.getElementById("orgName");
    if (el) el.textContent = sanitizeText(cfg.orgName);
  }
  if (cfg.analystName) {
    const el = document.getElementById("analystNameInput");
    if (el) el.value = sanitizeText(cfg.analystName);
  }
}

// ── Task Catalog ──────────────────────────────────────────────────────────────

function getAllTasks() {
  const builtins = window.BUILTIN_TASKS || [];
  return [...builtins, ...STATE.customTasks];
}

function getTaskById(id) {
  return getAllTasks().find(t => t.id === id) || null;
}

// ── Category Metadata ─────────────────────────────────────────────────────────

const CATEGORIES = {
  general:  { label: "General / Workday",    colorClass: "cat-general"  },
  analyst:  { label: "Analyst (15-1212.00)", colorClass: "cat-analyst"  },
  engineer: { label: "Engineer (15-1299.05)",colorClass: "cat-engineer" },
  custom:   { label: "Custom",               colorClass: "cat-custom"   }
};

// ── Render Task List ──────────────────────────────────────────────────────────

function renderTaskList() {
  const container = document.getElementById("taskListContainer");
  if (!container) return;
  container.innerHTML = "";

  const searchVal = (document.getElementById("taskSearch")?.value || "").toLowerCase().trim();
  const filterCat = document.getElementById("filterCategory")?.value || "all";

  const allTasks = getAllTasks();

  // Sort: favorites first, then by category order, then alphabetical
  const catOrder = { general: 0, analyst: 1, engineer: 2, custom: 3 };
  const sorted = [...allTasks].sort((a, b) => {
    const aFav = STATE.favorites.has(a.id) ? 0 : 1;
    const bFav = STATE.favorites.has(b.id) ? 0 : 1;
    if (aFav !== bFav) return aFav - bFav;
    const cDiff = (catOrder[a.category] || 9) - (catOrder[b.category] || 9);
    if (cDiff !== 0) return cDiff;
    return a.label.localeCompare(b.label);
  });

  let lastSection = null;
  let visibleCount = 0;

  sorted.forEach(task => {
    if (filterCat !== "all" && task.category !== filterCat) return;
    if (searchVal && !task.label.toLowerCase().includes(searchVal)) return;

    const isFav = STATE.favorites.has(task.id);
    const section = isFav ? "⭐ Favorites" : (CATEGORIES[task.category]?.label || task.category);

    if (section !== lastSection) {
      const hdr = document.createElement("div");
      hdr.className = "task-section-header";
      if (isFav) {
        hdr.classList.add("section-favorites");
      } else {
        hdr.classList.add(`section-${task.category}`);
      }
      hdr.textContent = section;
      container.appendChild(hdr);
      lastSection = section;
    }

    const btn = document.createElement("button");
    btn.className = `task-btn cat-${task.category}${isFav ? " is-favorite" : ""}`;
    btn.dataset.taskId = task.id;
    btn.type = "button";
    btn.setAttribute("aria-label", `Log task: ${task.label}`);

    const iconSpan = document.createElement("span");
    iconSpan.className = "task-icon";
    iconSpan.textContent = task.icon || "•";

    const labelSpan = document.createElement("span");
    labelSpan.className = "task-label";
    labelSpan.textContent = task.label;

    const favBtn = document.createElement("button");
    favBtn.className = "fav-toggle";
    favBtn.type = "button";
    favBtn.title = isFav ? "Remove from favorites" : "Add to favorites";
    favBtn.setAttribute("aria-label", isFav ? "Remove from favorites" : "Add to favorites");
    favBtn.textContent = isFav ? "★" : "☆";
    favBtn.dataset.taskId = task.id;
    favBtn.addEventListener("click", handleFavToggle);

    btn.appendChild(iconSpan);
    btn.appendChild(labelSpan);
    btn.appendChild(favBtn);
    btn.addEventListener("click", handleTaskClick);

    container.appendChild(btn);
    visibleCount++;
  });

  if (visibleCount === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-msg";
    empty.textContent = "No tasks match your search or filter.";
    container.appendChild(empty);
  }
}

// ── Handle Task Click ─────────────────────────────────────────────────────────

function handleTaskClick(e) {
  // Ignore if the fav toggle was clicked
  if (e.target.classList.contains("fav-toggle")) return;

  const taskId = e.currentTarget.dataset.taskId;
  const task = getTaskById(taskId);
  if (!task) return;

  openLogModal(task);
}

function handleFavToggle(e) {
  e.stopPropagation();
  const taskId = e.currentTarget.dataset.taskId;
  if (STATE.favorites.has(taskId)) {
    STATE.favorites.delete(taskId);
  } else {
    STATE.favorites.add(taskId);
  }
  renderTaskList();
}

// ── Log Modal ─────────────────────────────────────────────────────────────────

let _pendingTask = null;

function openLogModal(task, editIdx) {
  // Preserve _editIdx if passed explicitly; openLogModal always resets state cleanly
  _pendingTask = (typeof editIdx === "number")
    ? { ...task, _editIdx: editIdx }
    : { ...task };

  const isPunch = task.id === "gen_clockin" || task.id === "gen_clockout";

  document.getElementById("modalTaskLabel").textContent = `${task.icon || ""} ${task.label}`;
  document.getElementById("modalCategory").textContent = CATEGORIES[task.category]?.label || task.category;
  document.getElementById("modalCategory").className = `modal-cat-badge cat-${task.category}`;
  document.getElementById("logTime").value = nowTimeStr();
  document.getElementById("logDuration").value = 0;
  document.getElementById("logDurationDisplay").textContent = "0m (open-ended)";
  document.getElementById("logNote").value = "";

  // Hide duration slider for punch entries — duration is auto-calculated
  const durationField = document.getElementById("durationField");
  if (durationField) durationField.style.display = isPunch ? "none" : "";

  // Show punch info banner if this is a clock punch
  const punchInfo = document.getElementById("punchInfoBanner");
  if (punchInfo) {
    punchInfo.style.display = isPunch ? "block" : "none";
    if (isPunch) {
      punchInfo.textContent = task.id === "gen_clockin"
        ? "⏱️ Duration is auto-calculated from Clock In to Clock Out. It will adjust if tasks fall outside this range."
        : "⏱️ Duration is auto-calculated from Clock In to Clock Out. It will adjust if tasks extend beyond this time.";
    }
  }

  const ticketRow = document.getElementById("ticketFlagRow");
  if (task.ticketable) {
    ticketRow.style.display = "flex";
    document.getElementById("logNeedsTicket").checked = false;
  } else {
    ticketRow.style.display = "none";
  }

  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("logTime").focus();
}

function closeLogModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.getElementById("modalConfirmBtn").textContent = "Log Entry";
  _pendingTask = null;
}

// ── Duration Slider ───────────────────────────────────────────────────────────

function initDurationSlider() {
  const slider = document.getElementById("logDuration");
  const display = document.getElementById("logDurationDisplay");
  if (!slider || !display) return;

  // Max = workday hours * 60
  const maxMins = ((window.WORKLOG_CONFIG?.workdayHours) || 8) * 60;
  slider.max = maxMins;

  slider.addEventListener("input", () => {
    const val = parseInt(slider.value, 10);
    display.textContent = val === 0 ? "0m (open-ended)" : fmtMinutes(val);
  });
}

// ── Render Log ────────────────────────────────────────────────────────────────

function renderLog() {
  const tbody = document.getElementById("logTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (STATE.entries.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.className = "empty-msg";
    td.textContent = "No entries yet. Click a task to log it.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  // Find punch entries for the work-time banner
  const clockInEntry  = STATE.entries.find(e => e.taskId === "gen_clockin");
  const clockOutEntry = STATE.entries.find(e => e.taskId === "gen_clockout");
  const workSpanMins  = (clockInEntry && clockOutEntry)
    ? Math.max(0, timeToMins(clockOutEntry.time) - timeToMins(clockInEntry.time))
    : null;

  STATE.entries.forEach((entry, idx) => {
    const isPunch = isPunchEntry(entry);
    const tr = document.createElement("tr");
    tr.className = `log-row cat-row-${entry.category}${isPunch ? " punch-row" : ""}`;
    tr.dataset.entryId = entry.id;

    // Time cell — show adjustment indicator if punch was auto-moved
    const timeTd = document.createElement("td");
    timeTd.className = isPunch ? "punch-time-cell" : "";
    const timeSpan = document.createElement("span");
    timeSpan.textContent = entry.time;
    timeTd.appendChild(timeSpan);
    if (isPunch && entry._punchNote) {
      const adj = document.createElement("span");
      adj.className = "punch-adj-badge";
      adj.textContent = "⟳ adjusted";
      adj.title = entry._punchNote;
      timeTd.appendChild(adj);
    }
    tr.appendChild(timeTd);

    // Task label cell
    const labelTd = document.createElement("td");
    const labelText = document.createTextNode(`${entry.icon} ${entry.label}`);
    labelTd.appendChild(labelText);
    if (isPunch && entry.duration > 0) {
      const span = document.createElement("span");
      span.className = "punch-worktime";
      span.textContent = ` — Work time: ${fmtMinutes(entry.duration)}`;
      labelTd.appendChild(span);
    }
    tr.appendChild(labelTd);

    // Category, Duration, Notes, Ticket cells
    const catTd = document.createElement("td");
    const catBadge = document.createElement("span");
    catBadge.className = `cat-badge cat-${entry.category}`;
    catBadge.textContent = CATEGORIES[entry.category]?.label || entry.category;
    catTd.appendChild(catBadge);
    tr.appendChild(catTd);

    const durTd = document.createElement("td");
    if (isPunch && entry.duration > 0) {
      // For punch entries show the auto-computed span, visually distinct
      durTd.textContent = fmtMinutes(entry.duration);
      durTd.className = "punch-dur-cell";
    } else {
      durTd.textContent = entry.duration > 0 ? fmtMinutes(entry.duration) : "—";
    }
    tr.appendChild(durTd);

    const noteTd = document.createElement("td");
    noteTd.textContent = entry.note || "—";
    noteTd.className = "note-cell";
    tr.appendChild(noteTd);

    const tickTd = document.createElement("td");
    tickTd.textContent = entry.needsTicket ? "🎫 Needs Ticket" : "—";
    if (entry.needsTicket) tickTd.className = "ticket-flag";
    tr.appendChild(tickTd);

    // Actions cell
    const actionTd = document.createElement("td");
    actionTd.className = "action-cell";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon";
    editBtn.type = "button";
    editBtn.title = "Edit entry";
    editBtn.setAttribute("aria-label", "Edit entry");
    editBtn.textContent = "✏️";
    editBtn.dataset.idx = idx;
    editBtn.addEventListener("click", handleEditEntry);

    const delBtn = document.createElement("button");
    delBtn.className = "btn-icon btn-delete";
    delBtn.type = "button";
    delBtn.title = "Delete entry";
    delBtn.setAttribute("aria-label", "Delete entry");
    delBtn.textContent = "🗑️";
    delBtn.dataset.idx = idx;
    delBtn.addEventListener("click", handleDeleteEntry);

    actionTd.appendChild(editBtn);
    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);

    // After the Clock Out row, insert the total work time banner
    if (entry.taskId === "gen_clockout" && workSpanMins !== null) {
      const bannerTr = document.createElement("tr");
      bannerTr.className = "work-time-banner";
      const bannerTd = document.createElement("td");
      bannerTd.colSpan = 7;
      bannerTd.textContent = `🕐 Total Work Time: ${fmtMinutes(workSpanMins)}  (${clockInEntry.time} → ${clockOutEntry.time})`;
      bannerTr.appendChild(bannerTd);
      tbody.appendChild(bannerTr);
    }
  });
}

// ── Edit / Delete Entry ───────────────────────────────────────────────────────

function handleDeleteEntry(e) {
  const idx = parseInt(e.currentTarget.dataset.idx, 10);
  if (isNaN(idx) || idx < 0 || idx >= STATE.entries.length) return;
  if (!confirm(`Delete entry: "${STATE.entries[idx].label}"?`)) return;
  STATE.entries.splice(idx, 1);
  reconcilePunches();
  renderLog();
  updateSummary();
  showToast("Entry deleted.", "info");
}

function handleEditEntry(e) {
  const idx = parseInt(e.currentTarget.dataset.idx, 10);
  if (isNaN(idx) || idx < 0 || idx >= STATE.entries.length) return;
  const entry = STATE.entries[idx];
  const task = getTaskById(entry.taskId) || {
    id: entry.taskId,
    label: entry.label,
    category: entry.category,
    icon: entry.icon,
    ticketable: entry.ticketable
  };

  // Pass idx into openLogModal so _pendingTask._editIdx is set AFTER the reset
  openLogModal(task, idx);

  // Pre-fill modal fields with the existing entry values (after modal is open)
  document.getElementById("logTime").value = entry.time;
  document.getElementById("logDuration").value = entry.duration;
  document.getElementById("logDurationDisplay").textContent = entry.duration > 0 ? fmtMinutes(entry.duration) : "0m (open-ended)";
  document.getElementById("logNote").value = entry.note || "";
  if (task.ticketable) document.getElementById("logNeedsTicket").checked = entry.needsTicket;

  document.getElementById("modalConfirmBtn").textContent = "Update Entry";
}

function confirmLogEntryActual() {
  if (!_pendingTask) return;
  const isEdit = typeof _pendingTask._editIdx === "number";

  const timeVal = document.getElementById("logTime").value;
  if (!timeVal || !/^\d{2}:\d{2}$/.test(timeVal)) {
    showToast("Please enter a valid time (HH:MM).", "error");
    return;
  }
  const duration = parseInt(document.getElementById("logDuration").value, 10) || 0;
  const note = document.getElementById("logNote").value.trim().substring(0, 500);
  const needsTicket = _pendingTask.ticketable
    ? document.getElementById("logNeedsTicket").checked
    : false;

  const entry = {
    id: isEdit ? STATE.entries[_pendingTask._editIdx].id : generateId(),
    taskId: _pendingTask.id,
    label: _pendingTask.label,
    category: _pendingTask.category,
    icon: _pendingTask.icon || "",
    time: timeVal,
    duration: duration,
    note: note,
    needsTicket: needsTicket,
    ticketable: _pendingTask.ticketable || false,
    timestamp: isEdit ? STATE.entries[_pendingTask._editIdx].timestamp : Date.now()
  };

  // Capture values before closeLogModal nulls _pendingTask
  const toastLabel = _pendingTask.label;
  const editIdx    = _pendingTask._editIdx;

  if (isEdit) {
    STATE.entries[editIdx] = entry;
  } else {
    STATE.entries.push(entry);
  }

  STATE.entries.sort((a, b) => a.time.localeCompare(b.time));
  reconcilePunches();

  closeLogModal();  // resets _pendingTask to null — must be after we're done with it
  renderLog();
  updateSummary();
  showToast(isEdit ? `Updated: ${toastLabel}` : `Logged: ${toastLabel}`, "success");
}

// ── Summary Panel ─────────────────────────────────────────────────────────────

function updateSummary() {
  const wdMins = ((window.WORKLOG_CONFIG?.workdayHours) || 8) * 60;

  // Punch entries
  const clockInEntry  = STATE.entries.find(e => e.taskId === "gen_clockin");
  const clockOutEntry = STATE.entries.find(e => e.taskId === "gen_clockout");

  // Work time = punch span (if both exist)
  const workTimeMins = (clockInEntry && clockOutEntry)
    ? Math.max(0, timeToMins(clockOutEntry.time) - timeToMins(clockInEntry.time))
    : null;

  // Total explicitly-logged task time (exclude punch entries — their duration is the span, not additive)
  const totalLogged = STATE.entries
    .filter(e => !isPunchEntry(e))
    .reduce((s, e) => s + (e.duration || 0), 0);

  // Per-category (exclude punches from breakdown)
  const catTotals = {};
  Object.keys(CATEGORIES).forEach(c => catTotals[c] = { count: 0, mins: 0 });

  STATE.entries.forEach(e => {
    if (isPunchEntry(e)) return; // don't double-count punch duration
    if (!catTotals[e.category]) catTotals[e.category] = { count: 0, mins: 0 };
    catTotals[e.category].count++;
    catTotals[e.category].mins += e.duration || 0;
  });

  const ticketCount = STATE.entries.filter(e => e.needsTicket).length;
  const entryCount  = STATE.entries.length;

  // Render summary cards
  document.getElementById("sumEntries").textContent = entryCount;
  document.getElementById("sumLogged").textContent  = fmtMinutes(totalLogged);

  // Work time card — shows punch span if available, otherwise remaining-from-config
  const workTimeEl = document.getElementById("sumWorkTime");
  const workTimeLbl = document.getElementById("sumWorkTimeLabel");
  if (workTimeMins !== null) {
    if (workTimeEl)  workTimeEl.textContent  = fmtMinutes(workTimeMins);
    if (workTimeLbl) workTimeLbl.textContent = `Work Time (${clockInEntry.time}–${clockOutEntry.time})`;
    document.getElementById("sumRemaining").textContent = fmtMinutes(Math.max(0, workTimeMins - totalLogged));
    document.getElementById("sumRemainingLabel").textContent = "Unlogged Work Time";
  } else if (clockInEntry && !clockOutEntry) {
    // Only clocked in — show elapsed since punch-in
    const elapsed = timeToMins(nowTimeStr()) - timeToMins(clockInEntry.time);
    if (workTimeEl)  workTimeEl.textContent  = fmtMinutes(Math.max(0, elapsed));
    if (workTimeLbl) workTimeLbl.textContent = `Elapsed (since ${clockInEntry.time})`;
    document.getElementById("sumRemaining").textContent = fmtMinutes(Math.max(0, wdMins - totalLogged));
    document.getElementById("sumRemainingLabel").textContent = "Remaining (vs config)";
  } else {
    if (workTimeEl)  workTimeEl.textContent  = "—";
    if (workTimeLbl) workTimeLbl.textContent = "Work Time";
    document.getElementById("sumRemaining").textContent = fmtMinutes(Math.max(0, wdMins - totalLogged));
    document.getElementById("sumRemainingLabel").textContent = "Remaining (vs config)";
  }

  // Category breakdown
  const breakdown = document.getElementById("catBreakdown");
  if (!breakdown) return;
  breakdown.innerHTML = "";

  Object.entries(catTotals).forEach(([cat, data]) => {
    if (data.count === 0) return;
    const row = document.createElement("div");
    row.className = `cat-summary-row cat-${cat}`;

    const lbl = document.createElement("span");
    lbl.className = "cat-sum-label";
    lbl.textContent = CATEGORIES[cat]?.label || cat;

    const cnt = document.createElement("span");
    cnt.className = "cat-sum-count";
    cnt.textContent = `${data.count} entries`;

    const time = document.createElement("span");
    time.className = "cat-sum-time";
    time.textContent = data.mins > 0 ? fmtMinutes(data.mins) : "—";

    const pct = totalLogged > 0 && data.mins > 0
      ? Math.round((data.mins / totalLogged) * 100)
      : 0;

    const bar = document.createElement("div");
    bar.className = `cat-bar cat-bar-${cat}`;
    bar.style.width = `${pct}%`;
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuenow", pct);
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");

    const barWrap = document.createElement("div");
    barWrap.className = "cat-bar-wrap";
    barWrap.appendChild(bar);

    row.appendChild(lbl);
    row.appendChild(cnt);
    row.appendChild(time);
    row.appendChild(barWrap);
    breakdown.appendChild(row);
  });
}

// ── Custom Task Manager ───────────────────────────────────────────────────────

function addCustomTask() {
  const labelEl = document.getElementById("customTaskLabel");
  const iconEl  = document.getElementById("customTaskIcon");

  const label = (labelEl?.value || "").trim().substring(0, 100);
  const icon  = (iconEl?.value  || "").trim().substring(0, 8);

  if (!label) {
    showToast("Please enter a task name.", "error");
    return;
  }

  // Check for duplicates
  const exists = getAllTasks().some(t => t.label.toLowerCase() === label.toLowerCase());
  if (exists) {
    showToast("A task with that name already exists.", "error");
    return;
  }

  const id = "user_" + Date.now();
  STATE.customTasks.push({
    id,
    label,
    category: "custom",
    icon: icon || "🔧",
    ticketable: document.getElementById("customTaskTicketable")?.checked || false
  });

  if (labelEl) labelEl.value = "";
  if (iconEl)  iconEl.value  = "";
  if (document.getElementById("customTaskTicketable")) {
    document.getElementById("customTaskTicketable").checked = false;
  }

  renderTaskList();
  renderCustomTaskList();
  showToast(`Custom task "${label}" added.`, "success");
}

function removeCustomTask(id) {
  const idx = STATE.customTasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  const label = STATE.customTasks[idx].label;
  if (!confirm(`Remove custom task "${label}"?`)) return;
  STATE.customTasks.splice(idx, 1);
  STATE.favorites.delete(id);
  // Also remove from log entries
  STATE.entries = STATE.entries.filter(e => e.taskId !== id);
  renderTaskList();
  renderLog();
  updateSummary();
  renderCustomTaskList();
  showToast(`Custom task "${label}" removed.`, "info");
}

function renderCustomTaskList() {
  const container = document.getElementById("customTaskList");
  if (!container) return;
  container.innerHTML = "";

  const allCustom = STATE.customTasks;
  if (allCustom.length === 0) {
    const p = document.createElement("p");
    p.style.fontStyle = "italic";
    p.style.color = "var(--text-muted)";
    p.style.fontSize = ".83rem";
    p.textContent = "No custom tasks yet. Add one above or pre-load via config.js.";
    container.appendChild(p);
    return;
  }

  allCustom.forEach(task => {
    const row = document.createElement("div");
    row.className = "cat-summary-row cat-custom";
    row.style.marginBottom = "6px";

    const icon = document.createElement("span");
    icon.style.fontSize = "1.1rem";
    icon.textContent = task.icon || "🔧";

    const label = document.createElement("span");
    label.className = "cat-sum-label";
    label.textContent = task.label;

    const badges = document.createElement("span");
    badges.style.display = "flex";
    badges.style.gap = "6px";
    badges.style.alignItems = "center";

    if (task.ticketable) {
      const t = document.createElement("span");
      t.className = "cat-badge cat-custom";
      t.style.fontSize = ".65rem";
      t.textContent = "ticketable";
      badges.appendChild(t);
    }

    const isFav = STATE.favorites.has(task.id);
    if (isFav) {
      const f = document.createElement("span");
      f.textContent = "⭐";
      f.title = "Favorited";
      badges.appendChild(f);
    }

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger";
    delBtn.style.padding = "3px 10px";
    delBtn.style.fontSize = ".75rem";
    delBtn.type = "button";
    delBtn.textContent = "🗑️ Remove";
    delBtn.dataset.taskId = task.id;
    delBtn.addEventListener("click", (e) => removeCustomTask(e.currentTarget.dataset.taskId));

    row.appendChild(icon);
    row.appendChild(label);
    row.appendChild(badges);
    row.appendChild(delBtn);
    container.appendChild(row);
  });
}

// ── Import / Export ───────────────────────────────────────────────────────────

function exportState() {
  const data = {
    _version: "1.0",
    _app: "WorkLog Tracker",
    date: STATE.date,
    analystName: document.getElementById("analystNameInput")?.value || STATE.analystName,
    entries: STATE.entries,
    favorites: [...STATE.favorites],
    customTasks: STATE.customTasks
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `worklog_${STATE.date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("State exported.", "success");
}

function importState() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { // 2MB max
      showToast("File too large (max 2MB).", "error");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", (ev) => {
      try {
        const raw = ev.target.result;
        // Basic validation
        const data = JSON.parse(raw);
        if (!data._app || data._app !== "WorkLog Tracker") {
          showToast("Invalid WorkLog file.", "error");
          return;
        }
        // Validate entries structure
        if (!Array.isArray(data.entries)) throw new Error("Invalid entries");

        STATE.entries = data.entries.filter(e =>
          e && typeof e.id === "string" &&
          typeof e.label === "string" &&
          typeof e.time === "string" &&
          /^\d{2}:\d{2}$/.test(e.time)
        ).map(e => ({
          id: String(e.id).substring(0, 64),
          taskId: String(e.taskId || "").substring(0, 64),
          label: String(e.label).substring(0, 200),
          category: ["general","analyst","engineer","custom"].includes(e.category) ? e.category : "custom",
          icon: String(e.icon || "").substring(0, 8),
          time: e.time,
          duration: Math.max(0, Math.min(parseInt(e.duration, 10) || 0, 480)),
          note: String(e.note || "").substring(0, 500),
          needsTicket: !!e.needsTicket,
          ticketable: !!e.ticketable,
          timestamp: typeof e.timestamp === "number" ? e.timestamp : Date.now()
        }));

        STATE.favorites = new Set(
          Array.isArray(data.favorites) ? data.favorites.filter(f => typeof f === "string") : []
        );

        STATE.customTasks = Array.isArray(data.customTasks)
          ? data.customTasks.filter(t => t && t.id && t.label).map(t => ({
              id: String(t.id).substring(0, 64),
              label: String(t.label).substring(0, 200),
              category: "custom",
              icon: String(t.icon || "🔧").substring(0, 8),
              ticketable: !!t.ticketable
            }))
          : [];

        if (data.date) STATE.date = String(data.date).substring(0, 10);

        const nameInput = document.getElementById("analystNameInput");
        if (nameInput && data.analystName) nameInput.value = String(data.analystName).substring(0, 100);

        reconcilePunches();
        renderTaskList();
        renderLog();
        updateSummary();
        showToast("State imported successfully.", "success");
      } catch (err) {
        showToast("Failed to parse import file. Ensure it is a valid WorkLog JSON.", "error");
      }
    });
    reader.readAsText(file);
  });
  input.click();
}

// ── PDF / Print Report ────────────────────────────────────────────────────────

function generateReport() {
  const wdMins = ((window.WORKLOG_CONFIG?.workdayHours) || 8) * 60;
  const analystName = document.getElementById("analystNameInput")?.value || STATE.analystName || "—";
  const orgName = window.WORKLOG_CONFIG?.orgName || document.getElementById("orgName")?.textContent || "";
  const reportDate = STATE.date;

  // Punch data
  const clockInEntry  = STATE.entries.find(e => e.taskId === "gen_clockin");
  const clockOutEntry = STATE.entries.find(e => e.taskId === "gen_clockout");
  const workTimeMins  = (clockInEntry && clockOutEntry)
    ? Math.max(0, timeToMins(clockOutEntry.time) - timeToMins(clockInEntry.time))
    : null;

  // Totals — exclude punch entries from task time total
  const totalLogged = STATE.entries
    .filter(e => !isPunchEntry(e))
    .reduce((s, e) => s + (e.duration || 0), 0);

  const catTotals = {};
  Object.keys(CATEGORIES).forEach(c => catTotals[c] = { count: 0, mins: 0 });
  STATE.entries.forEach(e => {
    if (isPunchEntry(e)) return;
    if (!catTotals[e.category]) catTotals[e.category] = { count: 0, mins: 0 };
    catTotals[e.category].count++;
    catTotals[e.category].mins += e.duration || 0;
  });

  const ticketItems = STATE.entries.filter(e => e.needsTicket);

  // Build printable HTML
  const win = window.open("", "_blank");
  if (!win) {
    showToast("Pop-up blocked. Please allow pop-ups for print.", "error");
    return;
  }

  const rowsHtml = STATE.entries.map(e => `
    <tr>
      <td>${escapeHtml(e.time)}</td>
      <td>${escapeHtml(e.icon)} ${escapeHtml(e.label)}</td>
      <td class="cat-${escapeHtml(e.category)}">${escapeHtml(CATEGORIES[e.category]?.label || e.category)}</td>
      <td>${e.duration > 0 ? escapeHtml(fmtMinutes(e.duration)) : "—"}</td>
      <td>${escapeHtml(e.note || "—")}</td>
      <td>${e.needsTicket ? "🎫 Yes" : "—"}</td>
    </tr>
  `).join("");

  const catRowsHtml = Object.entries(catTotals)
    .filter(([, d]) => d.count > 0)
    .map(([cat, d]) => {
      const pct = totalLogged > 0 && d.mins > 0 ? Math.round((d.mins / totalLogged) * 100) : 0;
      return `
        <tr>
          <td>${escapeHtml(CATEGORIES[cat]?.label || cat)}</td>
          <td>${d.count}</td>
          <td>${d.mins > 0 ? escapeHtml(fmtMinutes(d.mins)) : "—"}</td>
          <td>${pct}%</td>
        </tr>
      `;
    }).join("");

  const ticketHtml = ticketItems.length > 0
    ? ticketItems.map(e => `<li>${escapeHtml(e.time)} — ${escapeHtml(e.icon)} ${escapeHtml(e.label)}${e.note ? ` <em>(${escapeHtml(e.note)})</em>` : ""}</li>`).join("")
    : "<li>None</li>";

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WorkLog Report — ${escapeHtml(reportDate)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #222; padding: 24px; }
    h1 { font-size: 18pt; color: #1a3a5c; margin-bottom: 4px; }
    h2 { font-size: 13pt; color: #1a3a5c; margin: 18px 0 8px; border-bottom: 2px solid #1a3a5c; padding-bottom: 4px; }
    .meta { font-size: 10pt; color: #555; margin-bottom: 16px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .sum-card { border: 1px solid #ccc; border-radius: 6px; padding: 10px; text-align: center; }
    .sum-card .val { font-size: 16pt; font-weight: bold; color: #1a3a5c; }
    .sum-card .lbl { font-size: 9pt; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10pt; }
    th { background: #1a3a5c; color: #fff; padding: 6px 8px; text-align: left; }
    td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; }
    tr:nth-child(even) { background: #f7f7f7; }
    .ticket-list { padding-left: 20px; }
    .ticket-list li { margin-bottom: 4px; }
    .footer { margin-top: 24px; font-size: 9pt; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
    @media print {
      body { padding: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>InfoSec WorkLog Report</h1>
  <div class="meta">
    ${orgName ? `<strong>Organization:</strong> ${escapeHtml(orgName)} &nbsp;|&nbsp;` : ""}
    <strong>Analyst:</strong> ${escapeHtml(analystName)} &nbsp;|&nbsp;
    <strong>Date:</strong> ${escapeHtml(reportDate)} &nbsp;|&nbsp;
    <strong>Generated:</strong> ${new Date().toLocaleString()}
  </div>

  <h2>Summary</h2>
  <div class="summary-grid">
    <div class="sum-card"><div class="val">${STATE.entries.length}</div><div class="lbl">Total Entries</div></div>
    ${workTimeMins !== null
      ? `<div class="sum-card" style="border-color:#16a34a"><div class="val" style="color:#16a34a">${escapeHtml(fmtMinutes(workTimeMins))}</div><div class="lbl">Work Time (${escapeHtml(clockInEntry.time)}–${escapeHtml(clockOutEntry.time)})</div></div>`
      : `<div class="sum-card"><div class="val">—</div><div class="lbl">Work Time (no punches)</div></div>`
    }
    <div class="sum-card"><div class="val">${escapeHtml(fmtMinutes(totalLogged))}</div><div class="lbl">Task Time Logged</div></div>
    <div class="sum-card"><div class="val">${workTimeMins !== null ? escapeHtml(fmtMinutes(Math.max(0, workTimeMins - totalLogged))) : escapeHtml(fmtMinutes(Math.max(0, wdMins - totalLogged)))}</div><div class="lbl">${workTimeMins !== null ? "Unlogged Work Time" : `Remaining (of ${window.WORKLOG_CONFIG?.workdayHours || 8}h)`}</div></div>
    <div class="sum-card"><div class="val">${ticketItems.length}</div><div class="lbl">Items Needing Tickets</div></div>
  </div>

  <h2>Category Breakdown</h2>
  <table>
    <thead><tr><th>Category</th><th>Entries</th><th>Time</th><th>% of Logged</th></tr></thead>
    <tbody>${catRowsHtml}</tbody>
  </table>

  <h2>Work Log Entries</h2>
  <table>
    <thead><tr><th>Time</th><th>Task</th><th>Category</th><th>Duration</th><th>Notes</th><th>Ticket?</th></tr></thead>
    <tbody>${rowsHtml || '<tr><td colspan="6">No entries.</td></tr>'}</tbody>
  </table>

  <h2>Items Flagged for Tickets</h2>
  <ul class="ticket-list">${ticketHtml}</ul>

  <div class="footer">
    WorkLog Tracker | O*NET 15-1212.00 &amp; 15-1299.05 | Generated ${new Date().toLocaleString()}
  </div>

  <script>
    window.onload = function() { window.print(); };
  <\/script>
</body>
</html>`);
  win.document.close();
}

// ── Toast Notifications ───────────────────────────────────────────────────────

function showToast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = sanitizeText(msg);

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("toast-show"), 10);
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => container.removeChild(toast), 300);
  }, 3200);
}

// ── Clock ─────────────────────────────────────────────────────────────────────

function startClock() {
  const el = document.getElementById("liveClock");
  if (!el) return;
  const tick = () => {
    const d = new Date();
    el.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);
}

// ── Tab Navigation ────────────────────────────────────────────────────────────

function initTabs() {
  const tabs = document.querySelectorAll("[data-tab]");
  const panels = document.querySelectorAll("[data-panel]");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      panels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = document.querySelector(`[data-panel="${target}"]`);
      if (panel) panel.classList.add("active");
    });
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initTabs();
  initDurationSlider();
  startClock();
  renderTaskList();
  renderLog();
  updateSummary();
  renderCustomTaskList();

  // Set date display
  const dateEl = document.getElementById("reportDate");
  if (dateEl) dateEl.textContent = STATE.date;

  // Modal buttons
  document.getElementById("modalConfirmBtn")?.addEventListener("click", confirmLogEntryActual);
  document.getElementById("modalCancelBtn")?.addEventListener("click", closeLogModal);
  document.getElementById("modalOverlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeLogModal();
  });

  // ESC closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLogModal();
  });

  // Toolbar
  document.getElementById("btnExport")?.addEventListener("click", exportState);
  document.getElementById("btnImport")?.addEventListener("click", importState);
  document.getElementById("btnReport")?.addEventListener("click", generateReport);

  // Task search / filter
  document.getElementById("taskSearch")?.addEventListener("input", renderTaskList);
  document.getElementById("filterCategory")?.addEventListener("change", renderTaskList);

  // Add custom task
  document.getElementById("btnAddCustom")?.addEventListener("click", addCustomTask);
  document.getElementById("customTaskLabel")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addCustomTask();
  });

  // Analyst name change
  document.getElementById("analystNameInput")?.addEventListener("change", (e) => {
    STATE.analystName = e.target.value.trim().substring(0, 100);
  });
});
