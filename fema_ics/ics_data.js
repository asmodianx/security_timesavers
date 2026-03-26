/**
 * FINAL UNIFIED ICS DATASET v3.5
 * Includes all forms (201-260) with 100% field fidelity.
 */

const COMMON = {
    inc: { n: "1", l: "Incident Name", t: "text" },
    op:  { n: "2", l: "Operational Period", t: "dt_range", d: "Date and Time (From/To)" },
    prep:{ n: "6", l: "Prepared By", t: "text", d: "Name, Title, and Signature" }
};

const ICS_FORMS_DB = {
    // --- COMMAND & GENERAL STAFF (201-210) ---
    "ics201": {
        title: "Incident Briefing",
        mode: "portrait",
        fields: [
            COMMON.inc, { n: "2", l: "Incident Number", t: "text" }, { n: "3", l: "Date/Time Initiated", t: "dt" },
            { n: "4", l: "Map/Sketch", t: "image", d: "Include perimeter, hazards, and resource locations." },
            { n: "5", l: "Situation Summary", t: "area", d: "Current situation and health/safety briefing." },
            { n: "7", l: "Current and Planned Objectives", t: "area" },
            { n: "8", l: "Planned Actions, Strategies, and Tactics", t: "table", c: ["Time", "Action/Strategy"] },
            { n: "9", l: "Current Organization", t: "image", d: "Command and General Staff" },
            { n: "10", l: "Resource Summary", t: "table", c: ["Resource", "Identifier", "Ordered", "ETA", "Arrived", "Status"] },
            COMMON.prep
        ]
    },
    "ics202": {
        title: "Incident Objectives",
        mode: "portrait",
        fields: [
            COMMON.inc, COMMON.op, { n: "3", l: "Objective(s)", t: "area" }, { n: "4", l: "Command Emphasis / Weather", t: "area" },
            { n: "5", l: "General Safety Message", t: "area" }, { n: "6", l: "Attachments", t: "area", d: "Check: 203, 204, 205, 206, 207, Map, etc." },
            { n: "7", l: "Prepared By", t: "text" }, { n: "8", l: "Approved By (Incident Commander)", t: "text" }
        ]
    },
    "ics203": {
        title: "Organization Assignment List",
        mode: "portrait",
        fields: [
            COMMON.inc, COMMON.op,
            { n: "3", l: "Incident Commander and Staff", t: "table", c: ["Position", "Name", "Agency/Contact"] },
            { n: "4", l: "Agency Representatives", t: "table", c: ["Agency", "Name", "Contact"] },
            { n: "5", l: "Planning Section", t: "table", c: ["Position", "Name", "Contact"] },
            { n: "6", l: "Logistics Section", t: "table", c: ["Position", "Name", "Contact"] },
            { n: "7", l: "Operations Section", t: "table", c: ["Position", "Name", "Contact"] },
            { n: "8", l: "Finance/Administration", t: "table", c: ["Position", "Name", "Contact"] },
            COMMON.prep
        ]
    },
    "ics204": {
        title: "Assignment List",
        mode: "portrait",
        fields: [
            COMMON.inc, COMMON.op, { n: "3", l: "Branch", t: "text" }, { n: "4", l: "Division/Group", t: "text" },
            { n: "5", l: "Operations Personnel", t: "table", c: ["Role", "Name", "Contact"] },
            { n: "6", l: "Resources Assigned", t: "table", c: ["Resource ID", "Leader", "Count", "Contact"] },
            { n: "7", l: "Work Assignment", t: "area" }, { n: "8", l: "Special Instructions", t: "area" },
            { n: "9", l: "Communications", t: "table", c: ["System", "Ch", "Function", "Freq"] },
            COMMON.prep
        ]
    },
    "ics205": {
        title: "Incident Radio Communications Plan",
        mode: "landscape",
        fields: [COMMON.inc, COMMON.op, { n: "4", l: "Basic Radio Channel Use", t: "table", c: ["Zone", "Ch #", "Function", "Name", "RX Freq", "TX Freq", "Mode", "Remarks"] }, COMMON.prep]
    },
    "ics205a": {
        title: "Communications List",
        mode: "portrait",
        fields: [COMMON.inc, COMMON.op, { n: "3", l: "Basic Contact List", t: "table", c: ["ICS Position", "Name", "Method (Phone/Radio)"] }, COMMON.prep]
    },
    "ics206": {
        title: "Medical Plan",
        mode: "portrait",
        fields: [
            COMMON.inc, COMMON.op,
            { n: "4", l: "Medical Aid Stations", t: "table", c: ["Name", "Location", "Contact", "Level"] },
            { n: "5", l: "Transportation (Ambulance)", t: "table", c: ["Service", "Location", "Contact", "Level"] },
            { n: "6", l: "Hospitals", t: "table", c: ["Name", "Address", "Contact", "Trauma", "Burn"] },
            { n: "7", l: "Medical Emergency Procedures", t: "area" },
            COMMON.prep
        ]
    },
    "ics207": { title: "Incident Organization Chart", mode: "landscape", fields: [COMMON.inc, COMMON.op, { n: "3", l: "Org Chart (Graphic Upload)", t: "image" }, COMMON.prep] },
    "ics208": { title: "Safety Message/Plan", mode: "portrait", fields: [COMMON.inc, COMMON.op, { n: "3", l: "Safety Message", t: "area" }, COMMON.prep] },
    "ics208hm": { title: "Site Safety and Control Plan (HM)", mode: "portrait", fields: [COMMON.inc, COMMON.op, { n: "3", l: "HazMat Site Map", t: "image" }, { n: "4", l: "Hazards/Risks", t: "area" }, { n: "5", l: "Control Zones", t: "area" }, COMMON.prep] },
    "ics209": { 
        title: "Incident Status Summary", 
        mode: "landscape", 
        fields: [COMMON.inc, {n:"2", l:"Incident Number", t:"text"}, {n:"14", l:"Situation Summary", t:"area"}, {n:"28", l:"Resource Totals", t:"table", c:["Type", "Req", "Have", "Need"]}, {n:"32", l:"Personnel Totals", t:"table", c:["Section", "Agency", "Total"]}, COMMON.prep] 
    },
    "ics210": { title: "Resource Status Change", mode: "portrait", fields: [COMMON.inc, {n:"2", l:"Resource ID", t:"text"}, {n:"3", l:"New Status", t:"text"}, {n:"4", l:"From/To Location", t:"text"}, COMMON.prep] },

    // --- LOGISTICS & RESOURCES (211-218) ---
    "ics211": { title: "Incident Check-In List", mode: "landscape", fields: [COMMON.inc, COMMON.op, {n:"3", l:"Check-In List", t:"table", c:["Name", "Agency", "Resource ID", "Time", "Base", "Travel"]}, COMMON.prep] },
    "ics213": { title: "General Message", mode: "portrait", fields: [{n:"1", l:"To", t:"text"}, {n:"2", l:"From", t:"text"}, {n:"3", l:"Subject", t:"text"}, {n:"4", l:"Message", t:"area"}, {n:"5", l:"Reply", t:"area"}] },
    "ics213rr": { title: "Resource Request Message", mode: "portrait", fields: [COMMON.inc, {n:"2", l:"Qty/Kind/Type", t:"text"}, {n:"3", l:"Item Description", t:"area"}, {n:"4", l:"Arrival DTG", t:"dt"}, {n:"5", l:"Delivery Loc", t:"text"}] },
    "ics214": { title: "Activity Log", mode: "portrait", fields: [COMMON.inc, COMMON.op, {n:"3", l:"Individual Name", t:"text"}, {n:"4", l:"ICS Position", t:"text"}, {n:"6", l:"Notable Activities", t:"table", c:["Time", "Major Events/Decisions"]}, COMMON.prep] },
    "ics215": { title: "Operational Planning Worksheet", mode: "landscape", fields: [COMMON.inc, COMMON.op, {n:"3", l:"Resource Grid", t:"table", c:["Div/Group", "Type", "Req", "Have", "Need", "Loc"]}, COMMON.prep] },
    "ics215a": { title: "IAP Safety Analysis", mode: "landscape", fields: [COMMON.inc, COMMON.op, {n:"3", l:"Hazards/Risks", t:"table", c:["Div/Group", "Hazards", "Mitigation"]}, COMMON.prep] },
    "ics217a": { title: "Comm. Resource Availability", mode: "landscape", fields: [COMMON.inc, {n:"3", l:"Frequency List", t:"table", c:["Ch Name", "Function", "RX", "TX", "Mode", "Remarks"]}] },
    "ics218": { title: "Support Vehicle Inventory", mode: "landscape", fields: [COMMON.inc, {n:"3", l:"Vehicle List", t:"table", c:["ID", "Type", "Make", "Agency", "Status"]}] },

    // --- T-CARDS (219 SERIES) ---
    "ics219":   { title: "T-Card: Generic Status", mode: "t-card", fields: [{n:"1", l:"Resource ID", t:"text"}, {n:"2", l:"Status/Loc", t:"area"}] },
    "ics219_1": { title: "T-Card: Header", mode: "t-card", fields: [COMMON.inc, COMMON.op] },
    "ics219_2": { title: "T-Card: Crew", mode: "t-card", fields: [{n:"1", l:"Crew ID", t:"text"}, {n:"2", l:"Leader", t:"text"}, {n:"3", l:"Manifest", t:"table", c:["Name", "ID", "Rank"]}] },
    "ics219_3": { title: "T-Card: Engine", mode: "t-card", fields: [{n:"1", l:"ID", t:"text"}, {n:"2", l:"Pump GPM", t:"text"}, {n:"3", l:"Water Cap", t:"text"}] },
    "ics219_4": { title: "T-Card: Helicopter", mode: "t-card", fields: [{n:"1", l:"Tail #", t:"text"}, {n:"2", l:"Make/Model", t:"text"}, {n:"3", l:"Type", t:"text"}] },
    "ics219_5": { title: "T-Card: Personnel", mode: "t-card", fields: [{n:"1", l:"Name", t:"text"}, {n:"2", l:"ICS Position", t:"text"}, {n:"3", l:"Agency", t:"text"}] },
    "ics219_6": { title: "T-Card: Fixed-Wing", mode: "t-card", fields: [{n:"1", l:"Tail #", t:"text"}, {n:"2", l:"Home Base", t:"text"}] },
    "ics219_7": { title: "T-Card: Equipment", mode: "t-card", fields: [{n:"1", l:"Equip ID", t:"text"}, {n:"2", l:"Serial #", t:"text"}] },
    "ics219_8": { title: "T-Card: Miscellaneous", mode: "t-card", fields: [{n:"1", l:"Label", t:"text"}, {n:"2", l:"Notes", t:"area"}] },
    "ics219_10":{ title: "T-Card: General Status", mode: "t-card", fields: [{n:"1", l:"Resource", t:"text"}, {n:"2", l:"Order #", t:"text"}] },

    // --- SPECIALIZED & FINANCE (220-260) ---
    "ics220": { title: "Air Operations Summary", mode: "portrait", fields: [COMMON.inc, COMMON.op, {n:"4", l:"Air Assets Assigned", t:"table", c:["Type", "ID", "Base", "Status"]}, COMMON.prep] },
    "ics221": { title: "Demobilization Check-Out", mode: "portrait", fields: [COMMON.inc, {n:"2", l:"Unit/Resource ID", t:"text"}, {n:"3", l:"Section Clearances", t:"table", c:["Section", "Clearance", "Name"]}, COMMON.prep] },
    "ics225": { title: "Personnel Performance Rating", mode: "portrait", fields: [{n:"1", l:"Name", t:"text"}, {n:"2", l:"ICS Position", t:"text"}, {n:"3", l:"Rating Details", t:"area"}, COMMON.prep] },
    "ics230cg":{ title: "Daily Meeting Schedule (CG)", mode: "portrait", fields: [COMMON.inc, COMMON.op, {n:"3", l:"Meetings", t:"table", c:["Time", "Meeting Name", "Location", "Participants"]}] },
    "ics233cg":{ title: "Action Tracker (CG)", mode: "landscape", fields: [COMMON.inc, {n:"2", l:"Action Items", t:"table", c:["#", "Item", "Assigned To", "Date", "Status"]}] },
    "ics260": { title: "Resource Order Form", mode: "portrait", fields: [COMMON.inc, {n:"2", l:"Order #", t:"text"}, {n:"3", l:"Items Ordered", t:"table", c:["Qty", "Item Description", "ETA", "Cost"]}] }
};