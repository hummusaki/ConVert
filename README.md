<p align="center">
  <a href="https://gabmort.me/">
    <img src="https://gabmort.me/assets/m2.png" width="75"/>
  </a>
</p>
<h1 align="center">ConVert</h1>
<h3 align="center">https://convert.gabmort.me/</h2>
<h3 align="center">Full frontend file conversion</h3>
<p align="center">
  <a href="https://convert.gabmort.me/">
    <img src="https://skillicons.dev/icons?i=figma,wasm,js,html,css" />
  </a>
</p>

## Supported file types

### 🖼️ Images
- **PNG** (image/png): Convert to JPG, WEBP, PDF, ICO
- **JPEG** (image/jpeg): Convert to PNG, WEBP, PDF, ICO
- **WEBP** (image/webp): Convert to PNG, JPG, PDF, ICO
- **BMP** (image/bmp): Convert to PNG, JPG, WEBP, PDF
- **GIF** (image/gif): Convert to PNG, JPG, WEBP, PDF, MP4
- **ICO** (image/x-icon, image/vnd.microsoft.icon): Convert to PNG, JPG, WEBP
- **PDF** (application/pdf): Convert to PNG, JPG, WEBP, TXT

*(Advanced & Raw Image Formats)*
- **SVG** (image/svg+xml): Convert to PNG, JPG, WEBP
- **EPS** (application/postscript): Convert to PNG, JPG, WEBP
- **TIFF** (image/tiff): Convert to PNG, JPG, WEBP
- **Raw Images** (CR2, DNG, NEF): Convert to PNG, JPG, WEBP

### 📄 Documents & Text
- **DOCX** (application/vnd.openxmlformats-officedocument.wordprocessingml.document): Convert to PDF, HTML
- **XLSX** (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet): Convert to CSV, PDF, HTML
- **CSV** (text/csv): Convert to PDF, HTML
- **TXT** (text/plain): Convert to PDF, PNG, JPG

### 🗄️ Archives
- **ZIP** (application/zip): Convert to TAR
- **RAR** (application/x-rar-compressed): Convert to ZIP, TAR
- **7Z** (application/x-7z-compressed): Convert to ZIP, TAR
- **TAR** (application/x-tar): Convert to ZIP
- **GZ** (application/gzip): Convert to ZIP, TAR

### 🎵 Audio
- **MP3** (audio/mpeg): Convert to WAV, FLAC, OGG, AAC, M4A
- **WAV** (audio/wav, audio/x-wav): Convert to MP3, FLAC, OGG, AAC, M4A
- **FLAC** (audio/flac, audio/x-flac): Convert to MP3, WAV, OGG, AAC, M4A
- **OGG** (audio/ogg): Convert to MP3, WAV, FLAC, AAC
- **M4A** (audio/x-m4a, audio/mp4): Convert to MP3, WAV, FLAC, OGG
- **AIFF** (audio/x-aiff): Convert to MP3, WAV, FLAC, OGG, M4A
- **WMA** (audio/x-ms-wma): Convert to MP3, WAV, FLAC, OGG, M4A
- **MIDI** (audio/midi, audio/x-midi): Convert to MP3, WAV, FLAC, OGG, M4A, AAC

### 🎬 Video
- **MP4** (video/mp4): Convert to MP3, GIF, AVI, MOV, MKV, WEBM, FLAC, WAV
- **MOV** (video/quicktime): Convert to MP4, MP3, GIF, AVI, MKV, WEBM
- **WEBM** (video/webm): Convert to MP4, MP3, GIF, AVI, MKV, MOV
- **AVI** (video/x-msvideo): Convert to MP4, MP3, GIF, WEBM, MOV, MKV
- **MKV** (video/x-matroska): Convert to MP4, MP3, GIF, AVI, MOV, WEBM
- **WMV** (video/x-ms-wmv): Convert to MP4, MP3, GIF, AVI, MOV, MKV, WEBM
- **M4V** (video/x-m4v): Convert to MP4, MP3, GIF, AVI, MOV, MKV, WEBM

---

## 🚀 Features & Architecture
- **Completely Client-Side**: All conversions happen directly in the browser via WebAssembly (WASM) and Web Workers. No files are uploaded to a server!
- **Domain-Specific Modules**: Codebase is modularized into `archives`, `documents`, `images`, and `media` to keep converters decoupled.
- **Robust End-to-End Testing**: Includes Playwright tests that evaluate the behavior of all format converters directly in a browser environment to ensure high-fidelity outputs.
