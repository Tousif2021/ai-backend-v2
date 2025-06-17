console.log("#########################");
console.log("RUNNING THIS SUMMARIZE.JS:", __filename);
console.log("#########################");

const express = require('express');
const pdf = require('pdf-parse');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const router = express.Router();

console.log("summarize.js loaded");

// Health check GET
router.get('/test', (req, res) => {
  res.json({ msg: "Summarize GET is working!" });
});

// Summarization POST
router.post('/', async (req, res) => {
  console.log(">>> /api/summarize POST HIT <<<");
  try {
    // Import genAI here to ensure environment variables are loaded
    const genAI = require('../../lib/gemini');
    
    const { documentUrl } = req.body;
    if (!documentUrl) {
      console.log("No documentUrl provided.");
      return res.status(400).json({ error: 'No documentUrl provided' });
    }
    console.log("Document URL received:", documentUrl);

    // Download document as buffer
    const response = await fetch(documentUrl);
    console.log("Document fetch status:", response.status);
    if (!response.ok) {
      throw new Error(`File download failed with status: ${response.status}`);
    }
    const fileBuffer = await response.buffer();
    console.log("Document file buffer size:", fileBuffer.length);

    let text = '';
    
    // Check if it's a PDF by looking at the URL or content type
    const contentType = response.headers.get('content-type') || '';
    const isPDF = contentType.includes('pdf') || documentUrl.toLowerCase().includes('.pdf');
    
    if (isPDF) {
      // Parse PDF text
      console.log("Processing as PDF...");
      const data = await pdf(fileBuffer);
      text = data.text || '';
    } else {
      // For other document types (TXT, DOCX, etc.), try to read as text
      console.log("Processing as text document...");
      try {
        // Try to read as plain text first
        text = fileBuffer.toString('utf8');
        
        // If it looks like binary data, it might be a DOCX or other format
        if (text.includes('\x00') || text.includes('PK')) {
          console.log("Document appears to be binary format (possibly DOCX)");
          // For now, we'll return an error for unsupported formats
          // In a production app, you'd want to add proper DOCX parsing
          throw new Error('Document format not supported. Please upload PDF or plain text files.');
        }
      } catch (parseError) {
        console.error("Error parsing document:", parseError);
        throw new Error('Could not parse document. Please ensure it\'s a valid PDF or text file.');
      }
    }
    
    console.log("Extracted text length:", text.length);
    
    if (!text.trim()) {
      throw new Error('No text could be extracted from the document');
    }
    
    // Limit text size for API
    text = text.substring(0, 15000);

    // Summarize with Gemini (1.5 model!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Summarize the following document for a student in less than 200 words. Use simple, clear language:\n\n${text}`;

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    console.log("Received summary from Gemini");

    res.json({ summary });
  } catch (err) {
    console.error("Summarize error:", err);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to summarize document.';
    if (err.message.includes('API key')) {
      errorMessage = 'AI service configuration error. Please check server setup.';
    } else if (err.message.includes('download failed')) {
      errorMessage = 'Could not download the document. Please check the file URL.';
    } else if (err.message.includes('No text')) {
      errorMessage = 'Could not extract text from the document. The file might be corrupted or image-based.';
    } else if (err.message.includes('format not supported')) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;