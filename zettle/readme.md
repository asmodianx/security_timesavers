# Zettelkasten

A minimalist, privacy-first, single-file Zettelkasten note-taking tool. Built entirely with HTML, CSS, and JavaScript. 

There are no databases to set up, no servers to run, and no dependencies to install. Your notes live entirely within your browser's local storage, ensuring complete privacy and offline availability.

## Features

* **Zero Setup:** Just open the `.html` file in any modern web browser.
* **Privacy First:** All data is stored locally in your browser's `localStorage`. Nothing is ever sent to a server.
* **Bi-directional Linking:** Use `[[ID]]` syntax to seamlessly link concepts together. The tool automatically finds and displays "Linked Mentions" (backlinks) at the bottom of referenced notes.
* **Markdown Support:** Write using standard Markdown syntax (`# Headers`, `**bold**`, `*italic*`, `` `code` ``).
* **Live Preview:** A dual-pane interface allows you to write on the left and immediately see the formatted result on the right.
* **Future-Proof Data:** * Export your entire vault as a single `.json` backup.
  * Export individual notes as standard `.md` files complete with YAML frontmatter.
  * Import previous JSON backups or external `.md` files seamlessly.

---

## Getting Started

1. Save the provided code as an `.html` file (for example, `zettelkasten.html`).
2. Double-click the file to open it in Chrome, Firefox, Safari, Edge, or any modern browser.
3. Start writing!

---

## How to Use

### 1. Creating a Note (A "Zettel")
Click the **"+ New Zettel"** button. The system will automatically generate a unique 14-digit ID based on the current timestamp (e.g., `20231024153022`). This ensures every note has a permanent, unique identifier.

### 2. Linking Notes
The core of the Zettelkasten method is connecting ideas. To link to another note, wrap its ID in double brackets: `[[ID]]`. 
* *Example:* "This concept builds upon the ideas discussed in `[]`."
* These links become clickable in the preview pane. Clicking one will instantly load the referenced note.

### 3. Backlinks (Linked Mentions)
When you are viewing a note, the system scans your entire vault. If any other notes link to the current one, they will automatically appear at the bottom of the preview pane under **"Linked Mentions"**. This allows you to traverse your web of thoughts in both directions.

### 4. Searching
Use the search bar in the sidebar to instantly filter your note list by Title or ID. 

---

## Data Management & Backups

Because this tool uses your browser's `localStorage`, **your notes will be lost if you clear your browser's site data or cache**. To keep your data safe, make frequent use of the export tools.

### Exporting
* **Export All JSON:** Downloads a complete backup of your entire vault in a single file. Highly recommended before clearing browser history or moving to a new device.
* **Export .md:** Downloads the currently active note as a standard Markdown file. It automatically injects YAML frontmatter (ID, Title, Date) making it fully compatible with other Markdown tools like Obsidian, Logseq, or Jekyll.

### Importing
* Click **Import** and select either a `.json` backup file or a `.md` file.
* **JSON:** Will merge the backup with your existing notes.
* **Markdown:** Will import the text file as a new Zettel. If the file has a timestamp ID in the filename or a YAML header, the tool will attempt to preserve it. Otherwise, it will generate a fresh ID.

---

## Technical Details

* **Language:** HTML5, CSS3, ES6 JavaScript.
* **Dependencies:** None. No React, Vue, jQuery, or external Markdown parsers. The parsing is handled by lightweight, custom regular expressions optimized for this specific use case.
* **Storage Limit:** Dictated by your browser's `localStorage` quota (typically around 5MB, which equates to roughly 1 to 5 million characters of plain text).
