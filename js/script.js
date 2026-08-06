import { triggerDownload, toggleContrast, setInitialContrast } from './modules/core/utils.js';
import { convertImageFile } from './modules/images/image-convert.js';
import { transcode } from './modules/media/ffmpeg-transcode.js';
import { loadFFmpeg } from './modules/core/client.js';
import { convertDocumentFile } from './modules/documents/document-convert.js';
import { convertMagickFile } from './modules/images/magick-convert.js';
import { convertArchiveFile } from './modules/archives/archive-convert.js';
import { convertMidiFile } from './modules/media/midi-convert.js';

// CONFIG
const NATIVE_CONVERT_FORMATS = ['PNG', 'JPG', 'WEBP', 'PDF', 'ICO', 'TXT', 'HTML', 'CSV', 'ZIP'];
const SUPPORTED_FORMATS = {
    // __ IMAGES __
    'image/png': ['JPG', 'WEBP', 'PDF', 'ICO'],
    'image/jpeg': ['PNG', 'WEBP', 'PDF', 'ICO'],
    'image/webp': ['PNG', 'JPG', 'PDF', 'ICO'],
    'image/bmp': ['PNG', 'JPG', 'WEBP', 'PDF'],
    'image/gif': ['PNG', 'JPG', 'WEBP', 'PDF', 'MP4'],
    'image/x-icon': ['PNG', 'JPG', 'WEBP'],
    'image/vnd.microsoft.icon': ['PNG', 'JPG', 'WEBP'],
    'image/svg+xml': ['PNG', 'JPG', 'WEBP'],
    'application/postscript': ['PNG', 'JPG', 'WEBP'], // EPS
    'image/tiff': ['PNG', 'JPG', 'WEBP'],
    'image/x-canon-cr2': ['PNG', 'JPG', 'WEBP'],
    'image/x-adobe-dng': ['PNG', 'JPG', 'WEBP'],
    'image/x-nikon-nef': ['PNG', 'JPG', 'WEBP'],
    'application/pdf': ['PNG', 'JPG', 'WEBP', 'TXT'],

    // __ TEXT & DOCS __
    'text/plain': ['PDF', 'PNG', 'JPG'],
    'text/csv': ['PDF', 'HTML'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['PDF', 'HTML'], // DOCX
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['CSV', 'PDF', 'HTML'], // XLSX

    // __ AUDIO __
    'audio/mpeg': ['WAV', 'FLAC', 'OGG', 'AAC', 'M4A'],
    'audio/wav': ['MP3', 'FLAC', 'OGG', 'AAC', 'M4A'],
    'audio/x-wav': ['MP3', 'FLAC', 'OGG', 'AAC', 'M4A'],
    'audio/flac': ['MP3', 'WAV', 'OGG', 'AAC', 'M4A'],
    'audio/x-flac': ['MP3', 'WAV', 'OGG', 'AAC', 'M4A'],
    'audio/ogg': ['MP3', 'WAV', 'FLAC', 'AAC'],
    'audio/x-m4a': ['MP3', 'WAV', 'FLAC', 'OGG'],
    'audio/mp4': ['MP3', 'WAV', 'FLAC', 'OGG'],
    'audio/x-aiff': ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A'],
    'audio/x-ms-wma': ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A'],
    'audio/midi': ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A', 'AAC'],
    'audio/x-midi': ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A', 'AAC'],

    // __ VIDEO __
    'video/mp4': ['MP3', 'GIF', 'AVI', 'MOV', 'MKV', 'WEBM', 'FLAC', 'WAV'],
    'video/quicktime': ['MP4', 'MP3', 'GIF', 'AVI', 'MKV', 'WEBM'],
    'video/webm': ['MP4', 'MP3', 'GIF', 'AVI', 'MKV', 'MOV'],
    'video/x-msvideo': ['MP4', 'MP3', 'GIF', 'WEBM', 'MOV', 'MKV'],
    'video/x-matroska': ['MP4', 'MP3', 'GIF', 'AVI', 'MOV', 'WEBM'],
    'video/x-ms-wmv': ['MP4', 'MP3', 'GIF', 'AVI', 'MOV', 'MKV', 'WEBM'],
    'video/x-m4v': ['MP4', 'MP3', 'GIF', 'AVI', 'MOV', 'MKV', 'WEBM'],

    // __ ARCHIVES __
    'application/zip': ['TAR'],
    'application/x-rar-compressed': ['ZIP', 'TAR'],
    'application/x-7z-compressed': ['ZIP', 'TAR'],
    'application/x-tar': ['ZIP'],
    'application/gzip': ['ZIP', 'TAR'],

    'default': []
};

const FALLBACK_EXTENSIONS = {
    'flac': ['MP3', 'WAV', 'OGG', 'AAC'],
    'wma':  ['MP3', 'WAV', 'OGG', 'AAC'],
    'aiff': ['MP3', 'WAV', 'OGG', 'AAC'],
    'mkv':  ['MP4', 'AVI', 'MP3'],
    'wmv':  ['MP4', 'AVI', 'MP3'],
    'm4v':  ['MP4', 'AVI', 'MP3'],
    'gif':  ['PNG', 'JPG', 'MP4'],
    'ico':  ['PNG', 'JPG'],
    'txt':  ['PDF', 'PNG', 'JPG'],
    'docx': ['PDF', 'HTML'],
    'xlsx': ['CSV', 'PDF', 'HTML'],
    'csv':  ['PDF', 'HTML'],
    'svg':  ['PNG', 'JPG', 'WEBP'],
    'eps':  ['PNG', 'JPG', 'WEBP'],
    'tiff': ['PNG', 'JPG', 'WEBP'],
    'cr2':  ['PNG', 'JPG', 'WEBP'],
    'dng':  ['PNG', 'JPG', 'WEBP'],
    'nef':  ['PNG', 'JPG', 'WEBP'],
    'rar':  ['ZIP', 'TAR'],
    '7z':   ['ZIP', 'TAR'],
    'tar':  ['ZIP'],
    'gz':   ['ZIP', 'TAR'],
    'midi': ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A', 'AAC'],
    'mid':  ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A', 'AAC'],
};

// STATE
let currentFile = null;
let convertedResult = null;
let ffmpegInstance = null;
let ffmpegLoadingPromise = null;

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

    // preload FFmpeg silently
    ffmpegLoadingPromise = loadFFmpeg({ textContent: '' })
        .then(instance => {
            ffmpegInstance = instance;
            ffmpegInstance.on('progress', ({ progress }) => {
                if (statusText.textContent.startsWith("Converting")) {
                    statusText.textContent = `Converting: ${(progress * 100).toFixed(0)}%`;
                } else {
                    // update only if it's currently converting, otherwise it might overwrite "Processing..."
                    statusText.textContent = `Converting: ${(progress * 100).toFixed(0)}%`;
                }
            });
        })
        .catch(e => console.error("FFmpeg preload failed", e));
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
    const typeKey = SUPPORTED_FORMATS[file.type] ? file.type : 'default';
    let options = SUPPORTED_FORMATS[typeKey];

    // fallback logic
    if (!options || options.length === 0) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (FALLBACK_EXTENSIONS[ext]) {
            options = FALLBACK_EXTENSIONS[ext];
        } else if (file.type.startsWith('image/')) {
            options = ['PNG', 'JPG', 'PDF'];
        } else if (file.type.startsWith('video/')) {
            options = ['MP4', 'MP3', 'GIF', 'AVI'];
        } else if (file.type.startsWith('audio/')) {
            options = ['MP3', 'WAV', 'FLAC'];
        }
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

    // load FFmpeg if any of the target formats require it
    const needsFfmpeg = options.some(fmt => !NATIVE_CONVERT_FORMATS.includes(fmt));

    if (needsFfmpeg) {

        if (!ffmpegInstance) {
            statusText.textContent = "Initializing engine...";
            try {
                await ffmpegLoadingPromise;
                if (ffmpegInstance) {
                    statusText.textContent = "Engine ready.";
                } else {
                    throw new Error("FFmpeg failed to initialize during preload");
                }
            } catch (e) {
                console.error(e);
                statusText.textContent = "Engine failed to load.";
            }
        } else {
            statusText.textContent = "Engine ready.";
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
        const ext = currentFile.name.split('.').pop().toLowerCase();
        const videoOutputFormats = ['mp4', 'webm', 'avi', 'mov', 'mkv'];
        let resultData = null;
        let finalExtension = outputFormat;

        if (['docx', 'xlsx', 'csv'].includes(ext)) {
            const fileData = await currentFile.arrayBuffer();
            resultData = await convertDocumentFile(fileData, inputType, outputFormat, currentFile.name);
        }
        else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            resultData = await convertArchiveFile(currentFile, outputFormat);
        }
        else if (['eps', 'tiff', 'cr2', 'dng', 'nef'].includes(ext)) {
            const fileData = await currentFile.arrayBuffer();
            resultData = await convertMagickFile(fileData, inputType, outputFormat);
        }
        else if (['midi', 'mid'].includes(ext)) {
            const fileData = await currentFile.arrayBuffer();
            const wavBlob = await convertMidiFile(fileData);
            
            if (outputFormat === 'wav') {
                resultData = wavBlob;
            } else {
                if (!ffmpegInstance) throw new Error("FFmpeg engine not loaded");
                const tempFile = new File([wavBlob], "temp.wav", { type: 'audio/wav' });
                const outputName = `output.${outputFormat}`;
                let args = ['-i', tempFile.name, outputName];
                
                await transcode(ffmpegInstance, tempFile, args, outputName, {});
                
                const data = await ffmpegInstance.readFile(outputName);
                resultData = new Blob([data]);
            }
        }
        else if ((inputType.startsWith('image/') || inputType === 'application/pdf' || inputType === 'text/plain')
            && !inputType.includes('flac') && !videoOutputFormats.includes(outputFormat)) {
            let fileData;
            if (inputType === 'text/plain') fileData = await currentFile.text();
            else fileData = await currentFile.arrayBuffer();
            
            resultData = await convertImageFile(fileData, inputType, outputFormat);
            if (resultData && resultData.type === 'application/zip') {
                finalExtension = 'zip';
            }
        }
        else {
            // __ AUDIO / VIDEO __
            if (!ffmpegInstance) throw new Error("FFmpeg engine not loaded");

            const outputName = `output.${outputFormat}`;
            let args = ['-i', currentFile.name];

            if (videoOutputFormats.includes(outputFormat)) {
                args.push('-preset', 'ultrafast');
            }
            args.push(outputName);

            await transcode(ffmpegInstance, currentFile, args, outputName, {});

            const data = await ffmpegInstance.readFile(outputName);
            resultData = new Blob([data]);
        }

        if (resultData) {
            const newName = replaceExtension(currentFile.name, finalExtension);
            convertedResult = { data: resultData, fileName: newName };
            finishConversion();
        } else {
            throw new Error("Conversion returned no data");
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