console.log("#########################");
console.log("RUNNING THIS FLASHCARDS.JS:", __filename);
console.log("#########################");

const express = require('express');
const pdf = require('pdf-parse');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const router = express.Router();

const { generateFlashcardsFromText } = require('../../lib/generateFlashcards');

console.log("flashcards.js loaded");

// Health check GET
router.get('/test', (req, res) => {
  res.json({ msg: "Flashcards GET is working!" });
});

router.post('/', async (req, res) => {
  console.log(">>> /api/flashcards POST HIT <<<");
  console.log("Request body:", req.body);

  try {
    const { file_path } = req.body;
    if (!file_path) {
      console.log("No file_path provided.");
      return res.status(400).json({ error: 'No file_path provided' });
    }
    console.log("File path received:", file_path);

    // Initialize Supabase client with service role key (keep this secure)
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the PDF file buffer from Supabase storage
    const { data, error } = await supabase.storage
      .from('documents')
      .download(file_path);

    if (error) {
      console.error("Supabase download error:", error);
      throw new Error(`Failed to download file from storage: ${error.message}`);
    }

    const fileBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    console.log("Document file buffer size:", buffer.length);

    // Check if file is PDF by extension
    if (!file_path.toLowerCase().endsWith('.pdf')) {
      throw new Error("Only PDF files are supported for flashcard generation.");
    }

    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    if (!text || !text.trim()) {
      throw new Error('No text extracted from PDF.');
    }
    console.log("Extracted text length:", text.length);

    // Limit text length to avoid token limit issues
    const limitedText = text.substring(0, 15000);

    // Generate flashcards from text using your AI model
    const flashcards = await generateFlashcardsFromText(limitedText);

    console.log("Generated flashcards count:", flashcards.length);

    res.json({ flashcards });
  } catch (err) {
    console.error("Flashcards generation error:", err);
    res.status(500).json({
      error: 'Failed to generate flashcards',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
