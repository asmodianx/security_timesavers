/**
 * STIX 2.1 Object Library
 * Includes all 18 standard SDOs and 2 SROs with core attributes.
 */
const STIX_TEMPLATES = {
    // --- STIX Domain Objects (SDOs) ---
    "attack-pattern": {
        type: "attack-pattern",
        name: "New Attack Pattern",
        description: "",
        kill_chain_phases: [],
        color: "#ff5252"
    },
    "campaign": {
        type: "campaign",
        name: "New Campaign",
        description: "",
        aliases: [],
        first_seen: new Date().toISOString(),
        last_seen: "",
        objective: "",
        color: "#d32f2f"
    },
    "course-of-action": {
        type: "course-of-action",
        name: "New Course of Action",
        description: "",
        color: "#4caf50"
    },
    "grouping": {
        type: "grouping",
        name: "New Grouping",
        description: "",
        context: "unspecified",
        object_refs: [],
        color: "#9e9e9e"
    },
    "identity": {
        type: "identity",
        name: "New Identity",
        description: "",
        identity_class: "unknown", // e.g., individual, organization, class, system
        contact_information: "",
        color: "#448aff"
    },
    "indicator": {
        type: "indicator",
        name: "New Indicator",
        description: "",
        indicator_types: ["unknown"],
        pattern: "[file:hashes.'SHA-256' = '...']",
        pattern_type: "stix",
        valid_from: new Date().toISOString(),
        color: "#ffc107"
    },
    "infrastructure": {
        type: "infrastructure",
        name: "New Infrastructure",
        description: "",
        infrastructure_types: ["unknown"],
        first_seen: new Date().toISOString(),
        color: "#00e676"
    },
    "intrusion-set": {
        type: "intrusion-set",
        name: "New Intrusion Set",
        description: "",
        aliases: [],
        goals: [],
        resource_level: "unknown",
        color: "#f44336"
    },
    "location": {
        type: "location",
        name: "New Location",
        description: "",
        latitude: null,
        longitude: null,
        region: "",
        country: "",
        color: "#8bc34a"
    },
    "malware": {
        type: "malware",
        name: "New Malware",
        description: "",
        malware_types: ["unknown"],
        is_family: false,
        aliases: [],
        color: "#ffab40"
    },
    "malware-analysis": {
        type: "malware-analysis",
        product: "Analysis Tool",
        version: "",
        result: "unknown",
        color: "#ff9800"
    },
    "note": {
        type: "note",
        abstract: "",
        content: "New Note Content",
        object_refs: [],
        color: "#fff176"
    },
    "observed-data": {
        type: "observed-data",
        first_observed: new Date().toISOString(),
        last_observed: new Date().toISOString(),
        number_observed: 1,
        object_refs: [],
        color: "#00bcd4"
    },
    "opinion": {
        type: "opinion",
        explanation: "",
        opinion: "neutral", // e.g., strongly-disagree, disagree, neutral, agree, strongly-agree
        object_refs: [],
        color: "#ffeb3b"
    },
    "report": {
        type: "report",
        name: "New Threat Report",
        description: "",
        report_types: ["threat-report"],
        published: new Date().toISOString(),
        object_refs: [],
        color: "#3f51b5"
    },
    "threat-actor": {
        type: "threat-actor",
        name: "New Threat Actor",
        description: "",
        threat_actor_types: ["unknown"],
        aliases: [],
        goals: [],
        sophistication: "unknown",
        resource_level: "unknown",
        primary_motivation: "unknown",
        color: "#e040fb"
    },
    "tool": {
        type: "tool",
        name: "New Tool",
        description: "",
        tool_types: ["unknown"],
        tool_version: "",
        color: "#795548"
    },
    "vulnerability": {
        type: "vulnerability",
        name: "CVE-0000-0000",
        description: "",
        color: "#ff5722"
    },

    // --- STIX Relationship Objects (SROs) ---
    "relationship": {
        type: "relationship",
        relationship_type: "related-to",
        description: "",
        color: "#888888"
    },
    "sighting": {
        type: "sighting",
        description: "",
        count: 1,
        first_seen: new Date().toISOString(),
        last_seen: "",
        color: "#607d8b"
    }
};
