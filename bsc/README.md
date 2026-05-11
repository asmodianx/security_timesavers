# Balanced Scorecard (BSC) Strategy Cascade Wizard

A standalone, local-first web utility for building, managing, and cascading Balanced Scorecards across an organization. 

This application is built entirely in vanilla HTML, CSS, and JavaScript. It requires **zero external dependencies** (no CDNs, no external libraries) and operates 100% locally in your web browser, ensuring complete privacy and security for your sensitive strategic data.

## 🌟 Key Features

* **Zero-Dependency Architecture:** Runs entirely offline. No server required, no data leaves your machine.
* **Hierarchical Cascading:** Import a "Master Scorecard" to serve as a persistent reference panel while you build aligned sub-department scorecards.
* **Interactive Strategy Map:** An integrated HTML5 canvas allows you to visually map cause-and-effect linkages between your strategic objectives using a simple drag-and-drop interface.
* **Dynamic Data Modeling:** Easily manage Organization Identity, Mission, Vision, Core Values, and high-level Strategic Themes.
* **Automated Data Entry:** Generate dynamic input grids to track "Current vs. Target" metrics for your defined operational periods.
* **JSON State Management:** Save your progress locally as a lightweight JSON file to resume editing later or distribute to other departments for cascading.
* **Dual Native PDF Export Engine:** Leverages your browser's native print capabilities to generate two distinct reports:
  * **Full Scorecard Master Plan:** A comprehensive document detailing the entire strategic charter, map, and baseline objectives.
  * **Dated Status Update:** A streamlined executive summary focusing on current period progress, recent notes, and current metric performance.

---

## 🚀 Getting Started

Because this is a standalone utility, there is no installation or compilation required.

1. Download or save the application file (e.g., `bsc_wizard.html`) to your local machine.
2. Double-click the file to open it in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari).
3. Begin building your scorecard immediately.

---

## 📖 Instructions for Use

The application is structured as a 4-step wizard. Use the "Next Step" and "Previous Step" buttons in the top right to navigate.

### Step 1: Data Management & Foundation
* **Resume Work:** Click **Load Scorecard to Edit** to upload a previously saved `.json` scorecard. This will populate all fields and the strategy map.
* **Build Hierarchy:** Click **Import Parent for Context** to load a higher-level scorecard. This will display the parent's mission, strategies, and goals in the left sidebar to help you align your current scorecard.
* **Foundation:** Define your Organization Name, Mission, and Vision.
* **Core Values & Strategies:** Use the dynamic lists to add your organization's core values and high-level strategic themes (including what "success" looks like for each).

### Step 2: Strategic Objectives
* Define your specific objectives across the four standard BSC perspectives: **Financial**, **Customer / Stakeholder**, **Internal Process**, and **Learning & Growth**.
* For each objective, establish the **Metric** you will use to measure it and the intended **Target**.
* Click "+ Add Objective" to add as many as needed per perspective.

### Step 3: Strategy Map Links
* The application automatically generates visual nodes for every objective you defined in Step 2.
* **To create a linkage:** Click and hold on a lower-level objective, then drag your mouse to a higher-level objective and release. An arrow will automatically be drawn, representing the cause-and-effect relationship.
* If you make a mistake, click **Clear Linkages** to reset the map.

### Step 4: Operational Status & Export
* **Progress Reporting:** Enter the current `Operational Period` (e.g., "Q3 2026") and write an executive summary in the `Progress Notes`.
* **Current Metric Values:** The system will dynamically list all your objectives. Enter the **Current Value** for each metric to track progress against your targets.
* **Export Options:**
  1. **Export JSON Data:** Saves your entire scorecard as a local `.json` file. **Always do this to save your work!**
  2. **Print Full Scorecard:** Opens your browser's print dialog to generate a comprehensive PDF of your strategic plan.
  3. **Print Dated Status Update:** Opens your browser's print dialog to generate an executive progress report focusing on current metrics and recent updates.

---

## 🖨️ Pro-Tips for PDF Exporting

To ensure your exported PDFs look perfect, please check the following settings in your browser's **Print Dialog** before saving:

1. **Destination:** Set to "Save as PDF".
2. **Layout:** Set to "Portrait".
3. **Paper Size:** Set to "Letter" (8.5 x 11").
4. **Margins:** Set to "Default".
5. **Background Graphics:** Ensure this box is **CHECKED**. This is critical for rendering the colored backgrounds on table headers and alternating strategy map rows.
