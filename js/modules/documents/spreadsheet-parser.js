import { loadScript } from '../core/utils.js';

let xlsxLoaded = false;

export async function loadXlsx() {
    if (!xlsxLoaded) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        xlsxLoaded = true;
    }
}

export async function parseSpreadsheet(fileContent, outputFormat) {
    await loadXlsx();
    const workbook = window.XLSX.read(fileContent, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (outputFormat === 'csv') {
        const csvOutput = window.XLSX.utils.sheet_to_csv(worksheet);
        return new Blob([csvOutput], { type: 'text/csv' });
    } else {
        // output HTML for PDF conversion
        const htmlOutput = window.XLSX.utils.sheet_to_html(worksheet);
        return `<div style="padding: 20px; font-family: sans-serif; overflow-x: auto;">${htmlOutput}</div>`;
    }
}
