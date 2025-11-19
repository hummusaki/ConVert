import { PDFDocument, StandardFonts, rgb } from 'https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.esm.js';
import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.mjs';

// configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs';

export async function convertFile(fileContent, inputMimeType, outputFormat) 
{
    if (inputMimeType.startsWith(outputFormat)) return; 

    // __ INPUT: IMAGE __
    if (inputMimeType.startsWith('image/')) {
        if (outputFormat === 'pdf') {
            return imageToPdf(fileContent, inputMimeType);
        } else {
            const mimeType = `image/${outputFormat}`;
            return imageToImage(fileContent, mimeType);
        }
    }

    // __ INPUT: PDF __
    else if (inputMimeType === 'application/pdf') {
        if (outputFormat === 'pdf') return;
        
        if (outputFormat === 'txt') {
            return pdfToText(fileContent);
        } else {
            return pdfToImage(fileContent, `image/${outputFormat}`);
        }
    }

    // __ INPUT: TEXT __
    else if (inputMimeType === 'text/plain') {
        if (outputFormat === 'pdf') {
            return textToPdf(fileContent);
        } else if (['png', 'jpg', 'jpeg', 'webp'].includes(outputFormat)) {
            return textToImage(fileContent, `image/${outputFormat}`);
        }
    }

    throw new Error(`Conversion from ${inputMimeType} is not supported.`);
}

// --- TEXT CONVERTERS ---

async function textToPdf(text) {
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

function textToImage(text, outputMimeType) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const fontSize = 16;
        const lineHeight = 20;
        const padding = 20;
        const lines = text.split(/\r?\n/);
        
        let maxWidth = 0;
        ctx.font = `${fontSize}px sans-serif`;
        lines.forEach(line => {
            const w = ctx.measureText(line).width;
            if (w > maxWidth) maxWidth = w;
        });

        canvas.width = maxWidth + (padding * 2);
        canvas.height = (lines.length * lineHeight) + (padding * 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#000000';
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textBaseline = 'top';
        
        lines.forEach((line, index) => {
            ctx.fillText(line, padding, padding + (index * lineHeight));
        });

        canvas.toBlob(resolve, outputMimeType);
    });
}

// --- PDF CONVERTERS ---

async function pdfToText(pdfData) {
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

async function imageToPdf(imageData, imageMimeType) {
    const pdfDoc = await PDFDocument.create();
    let embeddedImage;

    if (imageMimeType === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(imageData);
    } else if (['image/jpeg', 'image/jpg', 'image/webp', 'image.jfif'].includes(imageMimeType)) {
        embeddedImage = await pdfDoc.embedJpg(imageData);
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

function imageToImage(imageData, outputMimeType) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([imageData]);
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(resolve, outputMimeType, 0.95);
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
    });
}

async function pdfToImage(pdfData, outputFormat) {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const pageCount = pdf.numPages;

    // __ SINGLE PAGE __
    if (pageCount === 1) {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        await page.render({ canvasContext: context, viewport }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(resolve, outputFormat, 0.95);
        });
    }

    // __ MULTI-PAGE (feeds a ZIP) __
    if (!window.JSZip) {
        throw new Error("JSZip library not loaded. Cannot zip multiple pages.");
    }

    const zip = new JSZip();
    const ext = outputFormat.split('/')[1];

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        await page.render({ canvasContext: context, viewport }).promise;

        // convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, outputFormat, 0.95));
        
        // add blob to zip with filename
        zip.file(`page_${i}.${ext}`, blob);
    }

    return zip.generateAsync({ type: "blob" });
}