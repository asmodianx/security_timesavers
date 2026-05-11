# EMGT 821: SSDP Manual & Project Wizard

## Overview
The **SSDP Manual & Project Wizard** is a lightweight, interactive web utility designed to assist EMGT 821 students in completing their SMTP System Development Project (SSDP). It serves two primary functions:
1. **Quick Reference:** Provides an easily navigable version of the course manual and procedural steps.
2. **Plan Update (PU) Builder:** Streamlines the generation of formatted "Working Notes" by automatically applying the required EMGT 821 task notation (`mTpp-xx[brief task name: key informant(s) : brief task explanation: coded task contribution]`).

## Features
* **Integrated Course Manual:** Access Sections 1–6, key background information, and stage-by-stage excerpts directly from the sidebar.
* **Contextual Help System:** Click the `?` icons throughout the PU builder to pull up relevant course brief excerpts for the specific SMTP stage you are working on.
* **Automated Task Notation:** Enter your task parameters into simple form fields, and the tool will compile them into the strict syntax required for your Master SSDP Worksheet (MSSDPW).
* **One-Click Export:** Generate your finalized Plan Update text and instantly copy it to your clipboard or download it as a `.txt` file.

## How to Use the Utility

### 1. Navigating the Interface
Open the `index.html` file in any modern web browser. Use the left-hand navigation sidebar to switch between reading the Course Manual and building your Plan Updates (PUs).

### 2. Generating Plan Update 1
1. Click **Update 1: Site Info** in the sidebar.
2. Fill out your specific Business Unit details (Name, Organizational Structure, and Goods/Services Produced).
3. Click **Generate PU 1 Output** to create the formatted baseline text.
4. Copy the text or save it to a `.txt` file to paste into your Word-format MSSDPW.

### 3. Building Working Notes (Updates 2 - 10)
For each subsequent Plan Update corresponding to an SMTP stage:
1. Click the respective Update button in the sidebar (e.g., **Update 2: Stage 1**).
2. **General Section:** Verify the *Reporting Date* and enter a brief *Narrative Summary* of your progress.
3. **Task Definition Builder:** For every task you need to define, fill in the following fields:
    * **Task Number (xx):** The current task's two-digit ID (auto-increments).
    * **Predecessor (pp):** The two-digit ID of the preceding task (use `00` if none).
    * **Brief Task Name:** A short identifying phrase.
    * **Key Informants:** Abbreviations for personnel involved (e.g., `CO-IT`). Enter `n/a` if none.
    * **Task Explanation:** A basic description of the work to be done.
    * **Coded Contribution:** Select the system aspects this task addresses: **F**unction, **I**nputs, **O**utputs, **S**equence, **P**hysical Catalysts, or **H**uman Agents.
4. Click **Add Task to Update** to append it to your current working notes list.
5. Once all tasks for the stage are added, click **Finalize Plan Update X**. 
6. Copy the compiled output and paste it into your master document.

## Note on Revision Control
The original assignment brief specifies a strict color-coding and strike-through mechanism to track revisions across modules in your MSSDPW. 

*Note: While this utility efficiently generates new, properly formatted working notes for each stage, it does not manage the historical color-coding of past revisions. You will still need to apply any required color highlights or strikethroughs manually within your final Word document if strict revision control is enforced by your instructor.*
