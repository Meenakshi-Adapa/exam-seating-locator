const Tesseract = require('tesseract.js');

/**
 * Clean OCR mistakes commonly found in roll numbers.
 * @param {string} text
 * @returns {string} 
 */
function cleanOcrMistakes(text) {
    // Common mistranslations from numbers to letters or vice versa based on context
    return text
        .replace(/O/g, '0')   // Oh to Zero
        .replace(/I/g, '1')   // Eye to One
        .replace(/l/g, '1')   // el to One
        .replace(/B/g, '8')   // B to Eight
        .replace(/S/g, '5')   // S to Five
        .replace(/Z/g, '2');  // Z to Two
}

/**
 * Extracts 10 character alphanumeric roll numbers from a raw string
 * @param {string} rawText 
 * @returns {string[]} Array of valid roll numbers
 */
function extractRollNumbers(rawText) {
    const words = rawText.split(/\s+/);
    const rollNumbers = new Set();
    const pattern = /^[0-9A-Z]{10}$/;

    words.forEach(word => {
        // Basic cleanup per word
        let text = word.toUpperCase().replace(/[^0-9A-Z]/g, '');

        // We clean mistakes
        text = cleanOcrMistakes(text);

        // After cleaning, try to find 10 char sequences. Wait, OCR might clump things.
        // For exams, usually roll numbers are separated by spaces or newlines.
        // So if the length exactly 10 and matches pattern:
        if (text.length === 10 && pattern.test(text)) {
            rollNumbers.add(text);
        } else if (text.length > 10) {
            // Possible clumps like '22481A05K122481A05K2'
            const matches = text.match(/[0-9A-Z]{10}/g);
            if (matches) {
                matches.forEach(m => rollNumbers.add(m));
            }
        }
    });

    return Array.from(rollNumbers);
}

/**
 * Process image to extract roll numbers
 * @param {string} imageUrl Path or URL to the image (Cloudinary URL or local path)
 * @returns {Promise<string[]>} List of roll numbers
 */
async function processImage(imageUrl) {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imageUrl,
            'eng',
            {
                logger: m => console.log(m) // Logging progress
            }
        );

        console.log("----- Raw OCR Extracted Text -----");
        console.log(text);

        return extractRollNumbers(text);
    } catch (error) {
        console.error("OCR Service Error: ", error);
        throw error;
    }
}

module.exports = {
    processImage,
    cleanOcrMistakes,
    extractRollNumbers
};
