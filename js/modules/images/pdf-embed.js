import { PDFDocument, StandardFonts, rgb } from 'https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.esm.js';
import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.mjs';
import { imageToImage } from './canvas-convert.js';

// configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs';

export async function textToPdf(text) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;
    
    const lines = text.split(/\r?\n/);
    let page = pdfDoc.addPage();
    let { width, height } = page.getSize();
    let y = height - margin;

    for (const line of lines) {
        if (y < margin) {
            page = pdfDoc.addPage();
            y = height - margin;
        }
        
        page.drawText(line, {
            x: margin,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
        });
        
        y -= (fontSize + 4); 
    }

    return pdfDoc.save();
}

export async function pdfToText(pdfData) {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return new Blob([fullText], { type: 'text/plain' });
}

export async function imageToPdf(imageData, imageMimeType) {
    const pdfDoc = await PDFDocument.create();
    let embeddedImage;

    if (imageMimeType === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(imageData);
    } else if (['image/jpeg', 'image/jpg', 'image/webp', 'image.jfif'].includes(imageMimeType)) {
        embeddedImage = await pdfDoc.embedJpg(imageData);
    } else if (['image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'].includes(imageMimeType)) {
        const pngBlob = await imageToImage(imageData, 'image/png');
        const pngData = await pngBlob.arrayBuffer();
        embeddedImage = await pdfDoc.embedPng(pngData);
    } else {
        throw new Error(`Unsupported image format: ${imageMimeType}`);
    }

    const dims = embeddedImage.scale(1);
    const page = pdfDoc.addPage([dims.width, dims.height]);

    page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: dims.width,
        height: dims.height,
    });

    return pdfDoc.save();
}
