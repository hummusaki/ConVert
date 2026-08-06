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

## Features & Architecture
- **Completely Client-Side**: All conversions happen directly in the browser via WebAssembly (WASM) and Web Workers. No files are uploaded to a server!
- **Domain-Specific Modules**: Codebase is modularized into `archives`, `documents`, `images`, and `media` to keep converters decoupled for performance.
- **Robust End-to-End Testing**: Includes Playwright tests that evaluate the behavior of all format converters directly in a browser environment to ensure high-fidelity outputs.
- **Powered by WebAssembly & Modern Libraries**: 
  - `ffmpeg.wasm` for video and audio transcoding
  - `libarchive.js` for extraction of ZIP, RAR, 7Z, and TAR archives
  - `magick.wasm` (ImageMagick) for raw images and vector conversions
  - `pdf-lib` & `pdf.js` for PDF generation and parsing
  - `mammoth.js` & `SheetJS` for document processing (DOCX, XLSX)
  - `webaudio-tinysynth` for MIDI audio rendering
  - `JSZip` & `html2pdf.js` for packaging and document conversion

## Supported file types

### 🖼️ Images
- **PNG**: Convert to JPG, WEBP, PDF, ICO
- **JPEG**: Convert to PNG, WEBP, PDF, ICO
- **WEBP**: Convert to PNG, JPG, PDF, ICO
- **BMP**: Convert to PNG, JPG, WEBP, PDF
- **GIF**: Convert to PNG, JPG, WEBP, PDF, MP4
- **ICO**: Convert to PNG, JPG, WEBP
- **PDF**: Convert to PNG, JPG, WEBP, TXT

#### Advanced & Raw Image Formats
- **SVG**: Convert to PNG, JPG, WEBP
- **EPS**: Convert to PNG, JPG, WEBP
- **TIFF**: Convert to PNG, JPG, WEBP
- **Raw Images** (CR2, DNG, NEF): Convert to PNG, JPG, WEBP

### 📄 Documents & Text
- **DOCX**: Convert to PDF, HTML
- **XLSX**: Convert to CSV, PDF, HTML
- **CSV**: Convert to PDF, HTML
- **TXT**: Convert to PDF, PNG, JPG

### 🗄️ Archives
- **ZIP**: Convert to TAR
- **RAR**: Convert to ZIP, TAR
- **7Z**: Convert to ZIP, TAR
- **TAR**: Convert to ZIP
- **GZ**: Convert to ZIP, TAR

### 🎵 Audio
- **MP3**: Convert to WAV, FLAC, OGG, AAC, M4A
- **WAV**: Convert to MP3, FLAC, OGG, AAC, M4A
- **FLAC**: Convert to MP3, WAV, OGG, AAC, M4A
- **OGG**: Convert to MP3, WAV, FLAC, AAC
- **M4A**: Convert to MP3, WAV, FLAC, OGG
- **AIFF**: Convert to MP3, WAV, FLAC, OGG, M4A
- **WMA**: Convert to MP3, WAV, FLAC, OGG, M4A
- **MIDI**: Convert to MP3, WAV, FLAC, OGG, M4A, AAC

### 🎬 Video
- **MP4**: Convert to MP3, GIF, AVI, MOV, MKV, WEBM, FLAC, WAV
- **MOV**: Convert to MP4, MP3, GIF, AVI, MKV, WEBM
- **WEBM**: Convert to MP4, MP3, GIF, AVI, MKV, MOV
- **AVI**: Convert to MP4, MP3, GIF, WEBM, MOV, MKV
- **MKV**: Convert to MP4, MP3, GIF, AVI, MOV, WEBM
- **WMV**: Convert to MP4, MP3, GIF, AVI, MOV, MKV, WEBM
- **M4V**: Convert to MP4, MP3, GIF, AVI, MOV, MKV, WEBM

