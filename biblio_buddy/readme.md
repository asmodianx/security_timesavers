# Citation Database Utility

A lightweight, standalone web application for managing and formatting bibliography sources. Built entirely with vanilla HTML, CSS, and JavaScript, this tool requires no server or installation—just open it in your browser and start organizing your citations!

## Features

* **Multiple Citation Styles:** Automatically format sources into APA (7th Ed), MLA (9th Ed), Harvard, and IEEE standards.
* **Dynamic Forms:** Automatically adjusts required input fields based on the type of source (Book, Journal Article, Website).
* **One-Click Copy:** Easily copy both the full bibliography entry and the in-text citation to your clipboard.
* **Local Storage:** Automatically saves your sources to your browser's local storage so you don't lose your work between sessions.
* **Import/Export JSON:** Export your entire database as a JSON file for backup or sharing, and import it back anytime.
* **No Dependencies:** 100% vanilla code in a single file. No NPM, no Node.js, no external libraries.

## Getting Started

Since this is a standalone utility, there is no complex installation process.

1. Save the HTML code into a single file named `bibliography_db.html`.
2. Double-click the file to open it in any modern web browser (Chrome, Firefox, Safari, Edge).

## How to Use

### 1. Adding a Source
* On the left panel, select your preferred **Default View Style** (APA, MLA, Harvard, IEEE).
* Choose the **Source Type** (Book, Journal Article, Website). The form will dynamically update to show the required fields for that type.
* Fill in the fields (Author, Title, Year, etc.).
* Click **Save Source to Database**.

### 2. Viewing and Copying Citations
* Your saved sources will appear in the right panel.
* To use a citation in your paper, click **Copy Bibliography** to copy the full formatted text.
* Click **Copy In-Text** to grab the inline citation (e.g., `(Smith, 2023)` or `[1]`).
* You can delete a source by clicking the red **Delete** button.

### 3. Backing Up and Sharing Data
* **Export:** Click **Export JSON** at the top right to download your current database as a `.json` file.
* **Import:** Click **Import JSON** to load a previously exported `.json` file.

## Tech Stack

* **HTML5:** Semantic structure.
* **CSS3:** Custom styling with CSS variables, flexbox, and CSS Grid for a clean, responsive UI.
* **JavaScript (ES6):** DOM manipulation, JSON parsing, Clipboard API, and `localStorage` integration.

