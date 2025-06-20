const pdfParse = require('pdf-parse');
const fs = require('fs');
const fetch = require('node-fetch');  // make sure to `npm install node-fetch` in your backend

async function extractTextFromPDF(filePathOrUrl) {
  try {
    let dataBuffer;

    if (filePathOrUrl.startsWith('http')) {
      // Fetch the file from URL
      const res = await fetch(filePathOrUrl);
      if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
      dataBuffer = await res.arrayBuffer();
      dataBuffer = Buffer.from(dataBuffer);
    } else {
      // Local file path
      dataBuffer = fs.readFileSync(filePathOrUrl);
    }

    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (err) {
    throw new Error('Failed to extract PDF text: ' + err.message);
  }
}

module.exports = { extractTextFromPDF };
