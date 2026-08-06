import { loadScript } from '../core/utils.js';

let mammothLoaded = false;

export async function loadMammoth() {
    if (!mammothLoaded) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
        mammothLoaded = true;
    }
}

export async function parseDocx(fileContent) {
    await loadMammoth();
    const result = await window.mammoth.convertToHtml({ arrayBuffer: fileContent });
    return `<div style="padding: 20px; font-family: sans-serif;">${result.value}</div>`;
}
