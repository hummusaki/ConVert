import { imageToImage, textToImage, pdfToImage } from './canvas-convert.js';
import { textToPdf, pdfToText, imageToPdf } from './pdf-embed.js';

export async function convertImageFile(fileContent, inputMimeType, outputFormat) {
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
