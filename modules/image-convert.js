import { PDFDocument } from 'https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.esm.js';
import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.mjs';

// configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs';


export function convertFile(fileContent, inputMimeType, outputFormat) // MIME Type is the input format, a media type string like application/pdf
{
    // check for duplicate formats
    if (inputMimeType.startsWith(outputFormat)){
        return; // UI script handles the message
    }

    // is the input an image?
    if (inputMimeType.startsWith('image/')) {
        // what should the output format be?
        if (outputFormat === 'pdf') {
            return imageToPdf(fileContent, inputMimeType);
        } 
        else {
            const mimeType = `image/${outputFormat}`;
            return imageToImage(fileContent, mimeType);
        }
    }

    // is the input a PDF?
    else if (inputMimeType === 'application/pdf') {
        //what should the output format be?
        // check for duplicate formats
        if (outputFormat === 'pdf') {
            return;
        }
        else {
            return pdfToImage(fileContent, `image/${outputFormat}`);
        }
    }

    throw new Error(`Conversion from ${inputMimeType} is not supported.`);
}

async function imageToPdf(imageData, imageMimeType) {
    const pdfDoc = await PDFDocument.create();
    let embeddedImage;

    if (imageMimeType === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(imageData);
    } else if (['image/jpeg', 'image/jpg', 'image/webp', 'image.jfif'].includes(imageMimeType)) {
        embeddedImage = await pdfDoc.embedJpg(imageData);
    } else {
        throw new Error(`Unsupported image format for PDF conversion: ${imageMimeType}`);
    }

    const imageDimentsions = embeddedImage.scale(1);
    const page = pdfDoc.addPage([imageDimentsions.width, imageDimentsions.height]);

    //page.setSize(width, height);
    page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: imageDimentsions.width,
        height: imageDimentsions.height,
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
    const page = await pdf.getPage(1); // get the first page
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
    