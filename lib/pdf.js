const pdfParse = require('pdf-parse');

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    throw new Error('Failed to extract PDF text: ' + err.message);
  }
}

module.exports = { extractTextFromPDF };
