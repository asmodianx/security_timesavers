/* Edit this file to provide the default, automatically loaded conference schedule.
   Data must remain valid JavaScript. The application treats all values as untrusted input. */
window.CON_SCROLLER_CONFIG = Object.freeze({
  version: 1,
  name: "Conference Name",
  theme: "light",
  pixelsPerMinute: 3,
  followNow: false,
  summaryIntervalSeconds: 8,
  logo: "",
  categories: {
    talk: { label: "Talk", color: "#3b82f6" },
    workshop: { label: "Workshop", color: "#10b981" },
    village: { label: "Village", color: "#f59e0b" },
    social: { label: "Social", color: "#8b5cf6" }
  },
  events: [
    /* Example:
    { id:"example-1", date:"2026-09-12", start:"09:00", end:"10:00",
      name:"Opening Session", location:"Main Hall", category:"talk",
      track:"Main Track", description:"Welcome and orientation." }
    */
  ]
});
