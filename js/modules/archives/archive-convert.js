import { loadScript } from '../core/utils.js';
import { SimpleTarBuilder } from './tar-builder.js';

// STATE
let libarchiveLoaded = false;

// INITIALIZATION
async function loadLibArchive() {
    if (!libarchiveLoaded) {
        const module = await import('https://cdn.jsdelivr.net/npm/libarchive.js@1.3.0/main.js');
        window.Archive = module.Archive;
        
        const workerResponse = await fetch('https://cdn.jsdelivr.net/npm/libarchive.js@1.3.0/dist/worker-bundle.js');
        const workerText = await workerResponse.text();
        const workerBlob = new Blob([workerText], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);
        
        window.Archive.init({ workerUrl });
        libarchiveLoaded = true;
    }
}

// CORE FUNCTIONS
export async function convertArchiveFile(file, outputFormat) {
    await loadLibArchive();
    
    // open the archive
    const archive = await window.Archive.open(file);
    const filesObj = await archive.extractFiles();
    
    if (outputFormat === 'zip') {
        if (!window.JSZip) throw new Error("JSZip is not available.");
        const zip = new window.JSZip();
        
        async function addFilesToZip(obj, currentPath) {
            for (const [key, value] of Object.entries(obj)) {
                const newPath = currentPath ? `${currentPath}/${key}` : key;
                if (value && typeof value.name === 'string' && typeof value.size === 'number') {
                    zip.file(newPath, value);
                } else if (typeof value === 'object' && value !== null) {
                    zip.folder(newPath);
                    await addFilesToZip(value, newPath);
                }
            }
        }
        
        await addFilesToZip(filesObj, '');
        return await zip.generateAsync({ type: 'blob' });
        
    } else if (outputFormat === 'tar') {
        const tarBuilder = new SimpleTarBuilder();
        
        async function addFilesToTar(obj, currentPath) {
            for (const [key, value] of Object.entries(obj)) {
                const newPath = currentPath ? `${currentPath}/${key}` : key;
                if (value && typeof value.name === 'string' && typeof value.size === 'number') {
                    const arrayBuffer = await value.arrayBuffer();
                    tarBuilder.addFile(newPath, new Uint8Array(arrayBuffer));
                } else if (typeof value === 'object' && value !== null) {
                    tarBuilder.addDirectory(newPath);
                    await addFilesToTar(value, newPath);
                }
            }
        }
        
        await addFilesToTar(filesObj, '');
        return tarBuilder.generateBlob();
        
    } else {
        throw new Error(`Archiving to ${outputFormat} is not currently supported.`);
    }
}
