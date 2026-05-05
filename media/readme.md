# Web Media Player

A simple, standalone, browser-based media player application. It uses your browser's native capabilities to decode and play local video and audio files without needing an internet connection, a server, or any third-party plugins.

## Features

* **Standalone & Zero Install:** It's just a single HTML file. No installation or setup required.
* **Local Playback:** Plays media files directly from your device safely using the browser's File API.
* **Format Support:** Supports any codec your browser natively supports (e.g., MP4, WebM, OGG for video; MP3, WAV, AAC for audio).
* **Custom UI:** Features a sleek dark theme inspired by classic media players.
* **Controls:** Play, Pause, Stop, Progress Scrubber (seek), and Volume adjustment.

## How to Use

1.  **Save the Player:** Save the provided HTML code as a file named `player.html`.
2.  **Open in Browser:** Double-click the `player.html` file to open it in your preferred modern web browser (Chrome, Firefox, Edge, Safari, etc.).
3.  **Load Media:** Click the **"Open File"** button in the top right corner of the application.
4.  **Select File:** Choose a video or audio file from your computer's local storage. The file will begin playing automatically.
5.  **Control Playback:** Use the provided buttons to play, pause, or stop the media. Drag the progress bar to seek through the file, and adjust the volume slider as needed.

## Technical Details

This application leverages the HTML5 `<video>` element, which natively handles both audio and video playback. The JavaScript logic intercepts the file selection, prevents any server uploads, and uses `URL.createObjectURL()` to create a temporary, local blob URL. This allows the browser to stream the media directly into the player element purely on the client side.
