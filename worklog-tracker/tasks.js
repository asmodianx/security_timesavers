/**
 * WorkLog Tracker - tasks.js
 * Built-in task definitions for O*NET 15-1212.00 (Analyst) and 15-1299.05 (Engineer)
 * plus generic work-day tasks.
 *
 * category:
 *   "general"  → grey/slate   — workday lifecycle tasks
 *   "analyst"  → blue         — O*NET 15-1212.00 tasks
 *   "engineer" → teal/green   — O*NET 15-1299.05 tasks
 *   "custom"   → purple/amber — user-defined tasks
 *
 * ticketable: true  → user can flag for ticket creation (API stub)
 */

const BUILTIN_TASKS = [

  // ── General / Workday Lifecycle ─────────────────────────────────────────────
  { id: "gen_clockin",      label: "Clock In / Start of Day",      category: "general", icon: "🟢", ticketable: false },
  { id: "gen_clockout",     label: "Clock Out / End of Day",       category: "general", icon: "🔴", ticketable: false },
  { id: "gen_break",        label: "Break",                        category: "general", icon: "☕", ticketable: false },
  { id: "gen_lunch",        label: "Lunch Break",                  category: "general", icon: "🥗", ticketable: false },
  { id: "gen_meeting",      label: "Meeting",                      category: "general", icon: "📅", ticketable: false },
  { id: "gen_admin",        label: "Administrative / Admin Time",  category: "general", icon: "📋", ticketable: false },
  { id: "gen_taskswitch",   label: "Transitioning to New Task",    category: "general", icon: "🔄", ticketable: false },
  { id: "gen_email",        label: "Email / Communications",       category: "general", icon: "📧", ticketable: false },
  { id: "gen_standup",      label: "Stand-up / Scrum",             category: "general", icon: "🗣️", ticketable: false },
  { id: "gen_documentation",label: "Documentation / Writing",      category: "general", icon: "📝", ticketable: true  },
  { id: "gen_training",     label: "Training / Professional Dev",  category: "general", icon: "📚", ticketable: false },
  { id: "gen_onboarding",   label: "Onboarding / Mentoring",       category: "general", icon: "🧑‍🏫", ticketable: false },
  { id: "gen_triage",       label: "Queue / Ticket Triage",        category: "general", icon: "📥", ticketable: true  },
  { id: "gen_planning",     label: "Project Planning",             category: "general", icon: "🗺️", ticketable: false },
  { id: "gen_idle",         label: "Bench / Idle Time",            category: "general", icon: "🪑", ticketable: false },

  // ── Analyst Tasks — O*NET 15-1212.00 ────────────────────────────────────────
  { id: "an_riskassess",    label: "Risk Assessment / System Testing",                        category: "analyst", icon: "⚖️",  ticketable: true  },
  { id: "an_vulnmgmt",      label: "Vulnerability Management & Scan Review",                  category: "analyst", icon: "🔍",  ticketable: true  },
  { id: "an_incidentresp",  label: "Incident Response / Security Breach Response",            category: "analyst", icon: "🚨",  ticketable: true  },
  { id: "an_siemalert",     label: "SIEM Alert Triage & Investigation",                       category: "analyst", icon: "📡",  ticketable: true  },
  { id: "an_phishing",      label: "Phishing Analysis / Email Threat Investigation",          category: "analyst", icon: "🎣",  ticketable: true  },
  { id: "an_firewall",      label: "Firewall / Encryption Configuration",                     category: "analyst", icon: "🛡️",  ticketable: true  },
  { id: "an_accessmgmt",    label: "Access Management / Modify Security Files",               category: "analyst", icon: "🔑",  ticketable: true  },
  { id: "an_virusmon",      label: "Virus / Malware Monitoring & AV Updates",                 category: "analyst", icon: "🦠",  ticketable: true  },
  { id: "an_policyreview",  label: "Policy / Procedure Review & Violations",                  category: "analyst", icon: "📜",  ticketable: true  },
  { id: "an_userawareness", label: "Security Awareness Training / User Education",            category: "analyst", icon: "🎓",  ticketable: false },
  { id: "an_dataprotect",   label: "Data Protection Plan / Safeguard Development",            category: "analyst", icon: "🗄️",  ticketable: true  },
  { id: "an_threatintel",   label: "Threat Intelligence / CTI Analysis",                      category: "analyst", icon: "🕵️",  ticketable: true  },
  { id: "an_compliance",    label: "Compliance Review (FERPA/HIPAA/PCI/NIST)",               category: "analyst", icon: "✅",  ticketable: true  },
  { id: "an_loganalysis",   label: "Log Analysis / Network Traffic Review",                   category: "analyst", icon: "📊",  ticketable: true  },
  { id: "an_coordination",  label: "Vendor / Stakeholder Coordination",                       category: "analyst", icon: "🤝",  ticketable: false },
  { id: "an_forensics",     label: "Digital Forensics / Evidence Collection",                 category: "analyst", icon: "🔬",  ticketable: true  },
  { id: "an_reporting",     label: "Security Report Writing & Metrics",                       category: "analyst", icon: "📈",  ticketable: true  },
  { id: "an_endpointmon",   label: "Endpoint Detection & Response (EDR)",                     category: "analyst", icon: "💻",  ticketable: true  },
  { id: "an_cloudreview",   label: "Cloud Security Configuration Review",                     category: "analyst", icon: "☁️",  ticketable: true  },
  { id: "an_iamreview",     label: "Identity & Access Management Review",                     category: "analyst", icon: "🪪",  ticketable: true  },

  // ── Engineer Tasks — O*NET 15-1299.05 ───────────────────────────────────────
  { id: "en_pentest",       label: "Penetration Testing / Security Weakness ID",              category: "engineer", icon: "🔓", ticketable: true  },
  { id: "en_vulnassess",    label: "Vulnerability Assessment / Scanning (Nessus/Qualys)",     category: "engineer", icon: "🧪", ticketable: true  },
  { id: "en_secarch",       label: "Security Architecture Design",                            category: "engineer", icon: "🏗️", ticketable: true  },
  { id: "en_policydev",     label: "Policy / Standards / Best Practice Development",          category: "engineer", icon: "📐", ticketable: true  },
  { id: "en_tooldev",       label: "Security Tool Development / Scripting",                   category: "engineer", icon: "⚙️", ticketable: true  },
  { id: "en_firewallbuild", label: "Firewall / Encryption Software Build & Upgrade",          category: "engineer", icon: "🔒", ticketable: true  },
  { id: "en_monitorcoord",  label: "Network / System Monitoring Coordination",                category: "engineer", icon: "🖥️", ticketable: true  },
  { id: "en_breachinvest",  label: "Breach Investigation & Forensic Analysis",                category: "engineer", icon: "🔎", ticketable: true  },
  { id: "en_recoveryplan",  label: "Incident Response / Recovery Strategy Development",       category: "engineer", icon: "🔧", ticketable: true  },
  { id: "en_controlassess", label: "Security Control Assessment / Performance Indicators",    category: "engineer", icon: "📏", ticketable: true  },
  { id: "en_riskident",     label: "Risk Identification & Mitigation Solutions",              category: "engineer", icon: "🎯", ticketable: true  },
  { id: "en_softwareinstall",label: "Security Software Installation & Configuration",         category: "engineer", icon: "💾", ticketable: true  },
  { id: "en_techsupport",   label: "Technical Support for Security Products",                 category: "engineer", icon: "🛠️", ticketable: true  },
  { id: "en_hardeningos",   label: "OS / System Hardening",                                   category: "engineer", icon: "🧱", ticketable: true  },
  { id: "en_detection",     label: "Detection Engineering / SIEM Rule Development",           category: "engineer", icon: "🎛️", ticketable: true  },
  { id: "en_doccoord",      label: "Security Documentation / Emergency Policy Coordination",  category: "engineer", icon: "🗂️", ticketable: true  },
  { id: "en_mgmtreport",    label: "Management Recommendations & Security Briefings",         category: "engineer", icon: "📣", ticketable: false },
  { id: "en_siemdeploy",    label: "SIEM Deployment / Log Source Onboarding",                 category: "engineer", icon: "📡", ticketable: true  },
  { id: "en_rbac",          label: "RBAC / IAM Group & Permission Management",                category: "engineer", icon: "🔐", ticketable: true  },
  { id: "en_threatmodel",   label: "Threat Modeling",                                         category: "engineer", icon: "🗺️", ticketable: true  }
];

if (typeof window !== "undefined") {
  window.BUILTIN_TASKS = BUILTIN_TASKS;
}
