# Security Timesavers

## Disclaimer and License
This is AI-generated code and is therefore considered public domain. While these scripts have been reviewed, as a best practice, you should review all code you intend to use. This project is provided "as is" with no warranty or any other promise.

## Project Intent
**Security Timesavers** is a collection of AI-generated tools designed to be completely offline and highly portable. Most modern devices have a web browser, and the vast majority of browsers can run these tools natively.

### The Problem
Traditional scripting environments (PowerShell, Python, or Bash) are often:
* **Prone to Environment Issues:** They frequently require complex development setups.
* **Version Specific:** Tools can be extremely sensitive to the specific version of the language or libraries installed.
* **Supply Chain Risks:** Reliance on external includes can introduce supply chain vulnerabilities.

### The Solution
This project is an earnest attempt to create a set of security tools that "just work." By using standalone HTML and vanilla JavaScript, these utilities avoid the need for complex dependencies and external libraries.

## Usage of most tools here:
No installation or environment configuration is necessary. To use any tool:
1. Download or clone the repository.
2. Locate the desired `.html` file.
3. Open the file in your preferred web browser.

## Tool descriptions
Here is the updated list of folders and tools within the **Security Timesavers** repository, including descriptions for the most recent additions.

---

### **Incident Response & Digital Forensics**
* **DeepBlueJS**
    * **Description:** A browser-based implementation of DeepBlueCLI. It allows for the rapid analysis of Windows Event Logs (EVTX) converted to JSON, identifying suspicious patterns natively in the browser.
* **email**
    * **Description:** A standalone email header analyzer that parses metadata, routing history, and authentication results (SPF/DKIM/DMARC) for phishing investigations.
* **logsculpt**
    * **Description:** A log normalization and sculpting utility designed to clean and format raw log data into structured, readable tables without external processing.
* **fileioc**
    * **Description:** A dedicated utility for extracting Indicators of Compromise (IOCs), such as IP addresses and file hashes, from unstructured text or forensic notes.
* **nist_ir**
    * **Description:** A suite of incident response forms and documentation templates strictly aligned with NIST SP 800-61 Rev. 2 standards.

### **Threat Intelligence & Mapping**
* **attack**
    * **Description:** An offline-capable visualizer for the MITRE ATT&CK framework, allowing users to map adversary techniques and visualize coverage.
* **cti_assistant**
    * **Description:** A Cyber Threat Intelligence assistant designed to help ingest, organize, and manage threat data for faster analysis.
* **cyber_killchain_planner (Killchain Correlation Planner)**
    * **Description:** A strategic planning tool used to correlate security alerts and threats against the cyber kill chain to identify defensive gaps.
* **stix_palette**
    * **Description:** A specialized editor or styling tool used to define and visualize STIX-based threat intelligence objects and their relationships.

### **Network & Data Visualization**
* **network_map**
    * **Description:** A visual mapping tool used to create architecture diagrams and network topology maps within the browser.
* **datamap_sculpt**
    * **Description:** A "datamap sculptor" utility for visualizing data flows, asset relationships, and data classification maps.
* **ip_enrichment**
    * **Description:** A utility for performing IP data enrichment. While the interface is local, it utilizes DNS queries to pull external context for specific IP addresses.

### **Emergency & Exercise Management**
* **fema_ics**
    * **Description:** A renderer that converts raw incident data into standardized FEMA Incident Command System (ICS) forms.
* **fema_tabletop**
    * **Description:** A management tool for running Tabletop Exercises (TTX), providing a central interface for scenario injects and timeline tracking.

### **Compliance, Audit & Supply Chain**
* **jvat (Joint Vendor Assessment Tool)**
    * **Description:** A vendor security assessment form tailored for the specific needs of higher education environments.
* **audit_buddy**
    * **Description:** A technical auditing assistant designed to track compliance evidence against specific control frameworks.
* **sbom**
    * **Description:** A Software Bill of Materials (SBOM) analyzer that parses CycloneDX or SPDX files to identify third-party library risks.

### **SOC Operations & Management**
* **soc_in_a_box**
    * **Description:** A unified interface or dashboard designed to act as a central hub for various standalone SOC utilities and window management.
* **sentinelflow**
    * **Description:** A workflow visualization and automation utility designed to streamline security operations center processes.
* **project_buddy**
    * **Description:** A project management wizard specifically designed to handle the nuances of technical security projects and deliverables.
* **prompt_buddy**
    * **Description:** A utility for organizing, testing, and managing LLM prompts to ensure consistent results for security engineering tasks.
