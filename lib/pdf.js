const pdfParse = require('pdf-parse');

async function extractTextFromPDF(dataBuffer) {
  try {
    // Handle both file paths (strings) and Buffer objects
    let buffer;
    if (typeof dataBuffer === 'string') {
      // If it's a file path, read the file
      const fs = require('fs');
      buffer = fs.readFileSync(dataBuffer);
    } else {
      // If it's already a Buffer, use it directly
      buffer = dataBuffer;
    }
    
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    console.error('PDF extraction error:', err);
    throw new Error('Failed to extract PDF text: ' + err.message);
  }
}

module.exports = { extractTextFromPDF };
