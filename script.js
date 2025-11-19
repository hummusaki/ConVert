/*
TODO: 
- Grey out the format select / file select / convert fields while a conversion is happening
- Fix the position and z-index of decor items on desktop/mobile (they should always be under top ribbon)
*/

import { triggerDownload, toggleContrast, setInitialContrast } from './modules/utils.js';
import { convertFile as convertImageFile } from './modules/image-convert.js';
import { transcode } from './modules/media-convert.js'; 
import { loadFFmpeg } from './modules/client.js'; 

// CONFIG
const SUPPORTED_FORMATS = {
    // __ IMAGES __
    'image/png': ['JPG', 'WEBP', 'PDF', 'ICO'],
    'image/jpeg': ['PNG', 'WEBP', 'PDF', 'ICO'],
    'image/webp': ['PNG', 'JPG', 'PDF', 'ICO'],
    'image/bmp': ['PNG', 'JPG', 'WEBP', 'PDF'],
    'application/pdf': ['PNG', 'JPG', 'WEBP'],
    
    // __ AUDIO __
    'audio/mpeg': ['WAV', 'FLAC', 'OGG', 'AAC', 'M4A'], // MP3
    'audio/wav': ['MP3', 'FLAC', 'OGG', 'AAC', 'M4A'],
    'audio/x-wav': ['MP3', 'FLAC', 'OGG', 'AAC', 'M4A'],
    'audio/flac': ['MP3', 'WAV', 'OGG', 'AAC', 'M4A'],
    'audio/x-flac': ['MP3', 'WAV', 'OGG', 'AAC', 'M4A'],
    'audio/ogg': ['MP3', 'WAV', 'FLAC', 'AAC'],
    'audio/x-m4a': ['MP3', 'WAV', 'FLAC', 'OGG'],
    'audio/mp4': ['MP3', 'WAV', 'FLAC', 'OGG'], // M4A can come as audio/mp4

    // __ VIDEO __
    'video/mp4': ['MP3', 'GIF', 'AVI', 'MOV', 'MKV', 'WEBM', 'FLAC', 'WAV'],
    'video/quicktime': ['MP4', 'MP3', 'GIF', 'AVI', 'MKV', 'WEBM'], // MOV
    'video/webm': ['MP4', 'MP3', 'GIF', 'AVI', 'MKV', 'MOV'],
    'video/x-msvideo': ['MP4', 'MP3', 'GIF', 'WEBM', 'MOV', 'MKV'], // AVI
    'video/x-matroska': ['MP4', 'MP3', 'GIF', 'AVI', 'MOV', 'WEBM'], // MKV
    
    'default': [] 
};

// STATE
let currentFile = null;
let convertedResult = null; 
let ffmpegInstance = null;

// DOM
const fileInput = document.getElementById('file-input');
const formatSelect = document.getElementById('format-select');
const sidebar = document.getElementById('options-sidebar');
const fileInfoText = document.getElementById('file-info-text');
const statusText = document.getElementById('status-text');
const convertBtn = document.getElementById('run-convert-btn');
const downloadBtn = document.getElementById('download-btn');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    setInitialContrast();
    document.getElementById('theme-toggle').addEventListener('click', toggleContrast);
    
    fileInput.addEventListener('change', handleFileSelect);
    formatSelect.addEventListener('change', () => convertBtn.disabled = false);
    convertBtn.addEventListener('click', handleConvertClick);
    downloadBtn.addEventListener('click', handleDownloadClick);
});

// CORE FUNCTIONS
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    currentFile = file;
    convertedResult = null;
    downloadBtn.classList.add('disabled');
    statusText.textContent = '';

    // UI text
    fileInfoText.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;

    // determine formats
    // browsers can report MIME types differently
    const typeKey = SUPPORTED_FORMATS[file.type] ? file.type : 'default';
    let options = SUPPORTED_FORMATS[typeKey];
    
    // fallback if exact MIME match fails, try to guess by prefix or extension
    if (!options || options.length === 0) {
        if (file.type.startsWith('image/')) options = ['PNG', 'JPG', 'PDF'];
        else if (file.type.startsWith('video/')) options = ['MP4', 'MP3', 'GIF', 'AVI'];
        else if (file.type.startsWith('audio/')) options = ['MP3', 'WAV', 'FLAC'];
        else if (file.name.endsWith('.flac')) options = ['MP3', 'WAV', 'OGG', 'AAC']; // FLAC fallback
        else if (file.name.endsWith('.mkv')) options = ['MP4', 'AVI', 'MP3']; // MKV fallback
    }

    // populate dropdown
    formatSelect.innerHTML = '<option value="" disabled selected>Select format</option>';
    if (options) {
        options.forEach(fmt => {
            const opt = document.createElement('option');
            opt.value = fmt.toLowerCase();
            opt.textContent = fmt;
            formatSelect.appendChild(opt);
        });
    }

    // open sidebar
    sidebar.classList.add('active');
    convertBtn.disabled = true; 

    // load FFmpeg for media (Audio OR Video)
    if (file.type.startsWith('video/') || file.type.startsWith('audio/') || 
        file.name.endsWith('.flac') || file.name.endsWith('.mkv') || file.name.endsWith('.avi')) {
        
        if (!ffmpegInstance) {
            statusText.textContent = "Initializing engine...";
            try {
                ffmpegInstance = await loadFFmpeg({ textContent: '' }); 
                statusText.textContent = "Engine ready.";
                
                ffmpegInstance.on('progress', ({ progress }) => {
                    statusText.textContent = `Converting: ${(progress * 100).toFixed(0)}%`;
                });
            } catch (e) {
                console.error(e);
                statusText.textContent = "Engine failed to load.";
            }
        }
    }
}

async function handleConvertClick() {
    if (!currentFile) return;

    const inputType = currentFile.type;
    const outputFormat = formatSelect.value;
    
    convertBtn.disabled = true;
    statusText.textContent = "Processing...";

    try {
        // __ IMAGE / PDF __
        if ((inputType.startsWith('image/') || inputType === 'application/pdf') && !inputType.includes('flac')) {
            const fileBuffer = await currentFile.arrayBuffer();
            const resultData = await convertImageFile(fileBuffer, inputType, outputFormat);

            if (resultData) {
                const newName = replaceExtension(currentFile.name, outputFormat);
                convertedResult = { data: resultData, fileName: newName };
                finishConversion();
            } else {
                throw new Error("Conversion returned no data");
            }
        } 
        // __ AUDIO / VIDEO __
        else {
            if (!ffmpegInstance) throw new Error("FFmpeg engine not loaded");

            const outputName = `output.${outputFormat}`;
            // FFmpeg command: -i input output
            const args = ['-i', currentFile.name, outputName];

            await transcode(ffmpegInstance, currentFile, args, outputName, {});

            const data = await ffmpegInstance.readFile(outputName);
            const newName = replaceExtension(currentFile.name, outputFormat);
            convertedResult = { data: data, fileName: newName };
            finishConversion();
        }
    } catch (error) {
        console.error(error);
        statusText.textContent = "Error: " + error.message;
        convertBtn.disabled = false;
    }
}

function finishConversion() {
    statusText.textContent = "Done!";
    downloadBtn.classList.remove('disabled');
    convertBtn.disabled = false;
}

function handleDownloadClick() {
    if (convertedResult) {
        triggerDownload(convertedResult.data, convertedResult.fileName);
    }
}

function replaceExtension(filename, newExt) {
    return filename.substring(0, filename.lastIndexOf('.')) + '.' + newExt;
}