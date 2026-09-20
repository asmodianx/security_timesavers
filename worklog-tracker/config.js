/**
 * WorkLog Tracker - config.js
 * Pre-load custom tasks, favorites, and ticket system API configurations.
 * Edit this file to customize defaults before loading the app.
 *
 * OWASP Note: This file is loaded as a script; do NOT store credentials or
 * sensitive tokens here in production. Use environment-level secrets instead.
 */

const WORKLOG_CONFIG = {
  // ── App Identity ────────────────────────────────────────────────────────────
  appTitle: "InfoSec WorkLog Tracker",
  orgName:  "",                  // e.g. "KU ITSO" — shown in header & reports
  analystName: "",               // pre-fill analyst name field on load

  // ── Work Day Settings ───────────────────────────────────────────────────────
  workdayHours: 8,               // hours in a standard workday (for calculations)
  workdayStart: "08:00",         // default clock-in time (HH:MM 24h)

  // ── Pre-loaded Custom Tasks ─────────────────────────────────────────────────
  // category options: "general" | "analyst" | "engineer" | "custom"
  // color is optional; if omitted the category default is used
  customTasks: [
    { id: "custom_rd",        label: "R&D / Research",          category: "custom", icon: "🔬" },
    { id: "custom_bench",     label: "Bench Time",              category: "custom", icon: "🪑" },
    { id: "custom_multitask", label: "Multitasking",            category: "custom", icon: "🔀" },
    { id: "custom_training",  label: "Training / CBT",          category: "custom", icon: "📚" },
    { id: "custom_oncall",    label: "On-Call Coverage",        category: "custom", icon: "📟" }
  ],

  // ── Pre-loaded Favorites (by task id) ──────────────────────────────────────
  // Use built-in task IDs from tasks.js or custom task IDs defined above.
  defaultFavorites: [
    "gen_clockin",
    "gen_clockout",
    "gen_meeting",
    "gen_lunch",
    "custom_bench"
  ],

  // ── Ticket System API Configuration (stub — not enabled in v1) ─────────────
  // Set enabled: true and fill fields when integrating a ticket system.
  ticketSystem: {
    enabled: false,
    provider: "",          // "servicenow" | "jira" | "freshdesk" | "generic"
    baseUrl:  "",          // https://your-instance.service-now.com
    apiPath:  "",          // /api/now/table/incident
    // Token injected at runtime — do NOT hardcode secrets here
    authType: "bearer",    // "bearer" | "basic" | "apikey"
    defaultFields: {
      category: "Information Security",
      priority:  "3"
    }
  }
};

// Expose globally (consumed by app.js on DOMContentLoaded)
if (typeof window !== "undefined") {
  window.WORKLOG_CONFIG = WORKLOG_CONFIG;
}
