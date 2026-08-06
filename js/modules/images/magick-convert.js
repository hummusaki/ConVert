import { loadScript } from '../core/utils.js';

// STATE
let magickInitialized = false;

// CORE FUNCTIONS
export async function convertMagickFile(fileContent, inputMimeType, outputFormat) {
    if (!magickInitialized) {
        // Load the Magick ES module dynamically to avoid blocking main thread on initial load
        const MagickModule = await import('https://cdn.jsdelivr.net/npm/@imagemagick/magick-wasm@0.0.30/dist/index.js');
        const wasmUrl = 'https://cdn.jsdelivr.net/npm/@imagemagick/magick-wasm@0.0.30/dist/magick.wasm';
        
        // initializeImageMagick needs the wasm bytes or URL
        const wasmBytes = await fetch(wasmUrl).then(res => res.arrayBuffer());
        await MagickModule.initializeImageMagick(new Uint8Array(wasmBytes));
        window.ImageMagick = MagickModule.ImageMagick;
        window.MagickFormat = MagickModule.MagickFormat;
        magickInitialized = true;
    }

    return new Promise((resolve, reject) => {
        try {
            const inputData = new Uint8Array(fileContent);
            
            // Map our output format to MagickFormat
            let targetFormat;
            switch(outputFormat.toLowerCase()) {
                case 'png': targetFormat = window.MagickFormat.Png; break;
                case 'jpg':
                case 'jpeg': targetFormat = window.MagickFormat.Jpeg; break;
                case 'webp': targetFormat = window.MagickFormat.WebP; break;
                default: targetFormat = window.MagickFormat.Png; break;
            }

            window.ImageMagick.read(inputData, (image) => {
                image.write(targetFormat, (data) => {
                    const blob = new Blob([data], { type: `image/${outputFormat}` });
                    resolve(blob);
                });
            });
        } catch (err) {
            reject(err);
        }
    });
}
