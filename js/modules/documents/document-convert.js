import { loadScript } from '../core/utils.js';
import { parseDocx } from './word-parser.js';
import { parseSpreadsheet } from './spreadsheet-parser.js';

// STATE
let html2pdfLoaded = false;

// INITIALIZATION
async function loadHtml2Pdf() {
    if (!html2pdfLoaded) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
        html2pdfLoaded = true;
    }
}

// CORE FUNCTIONS
export async function convertDocumentFile(fileContent, inputMimeType, outputFormat, fileName) {
    let htmlContent = '';

    // __ INPUT: DOCX __
    if (inputMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        htmlContent = await parseDocx(fileContent);
    } 
    // __ INPUT: XLSX / CSV __
    else if (
        inputMimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        inputMimeType === 'text/csv'
    ) {
        const result = await parseSpreadsheet(fileContent, outputFormat);
        if (result instanceof Blob) {
            return result; // CSV output
        }
        htmlContent = result; // HTML output
    } else {
        throw new Error(`Unsupported document format: ${inputMimeType}`);
    }

    // __ OUTPUT FORMAT ROUTING __
    if (outputFormat === 'html') {
        return new Blob([htmlContent], { type: 'text/html' });
    } else if (outputFormat === 'pdf') {
        await loadHtml2Pdf();
        
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.width = '800px'; 
        
        const opt = {
            margin:       0.5,
            filename:     'output.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const pdfBlob = await window.html2pdf().set(opt).from(container).output('blob');
        return pdfBlob;
    }

    throw new Error(`Unsupported document output format: ${outputFormat}`);
}
