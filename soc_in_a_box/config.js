/**
 * SOC in a Box - Grouped Application Registry
 */
const SYSTEM_APPS = {
    "Incident Response": [
        { 
            id: 'fema-ics', 
            title: 'FEMA ICS Forms', 
            url: './tools/ics-forms/index.html', 
            icon: '📝'
        }
    ],
    "Threat Intelligence": [
        { 
            id: 'stix-viz', 
            title: 'STIX Visualizer', 
            url: './tools/stix-viz/index.html', 
            icon: '🕸️'
        }
    ],
    "Utilities": [
        { 
            id: 'notepad', 
            title: 'Notepad', 
            url: 'internal:notepad', 
            icon: '🗒️'
        }
    ]
};
