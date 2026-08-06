import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.mjs';

// configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs';

export function imageToImage(imageData, outputMimeType) {
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

export function textToImage(text, outputMimeType) {
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

export async function pdfToImage(pdfData, outputFormat) {
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

    const zip = new window.JSZip();
    const ext = outputFormat.split('/')[1];

    for (let i = 1; i <= pageCount; i += 5) {
        const batch = [];
        for (let j = 0; j < 5 && (i + j) <= pageCount; j++) {
            const pageNum = i + j;
            
            const promise = pdf.getPage(pageNum).then(async (page) => {
                const viewport = page.getViewport({ scale: 2.0 });
                
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d');

                await page.render({ canvasContext: context, viewport }).promise;

                // convert canvas to blob
                const blob = await new Promise(resolve => canvas.toBlob(resolve, outputFormat, 0.95));
                
                // add blob to zip with filename
                zip.file(`page_${pageNum}.${ext}`, blob);
            });
            
            batch.push(promise);
        }
        await Promise.all(batch);
    }

    return zip.generateAsync({ type: "blob" });
}
