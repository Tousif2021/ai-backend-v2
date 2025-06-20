const express = require('express');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
const genAI = require('../../lib/gemini'); // your gemini.js exports instance directly

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function generateFlashcardsFromText(text) {
  const prompt = `
Create 5 flashcards from the text below. Each flashcard should be formatted exactly as:
Q: [question]
A: [answer]

Text:
"""${text}"""`;

  const model = genAI.model("gemini-1.5-flash");
  const response = await model.generateContent(prompt);

  const rawOutput = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const flashcards = [];
  const cardRegex = /Q:\s*(.+?)\s*A:\s*([\s\S]+?)(?=(?:Q:|$))/g;

  let match;
  while ((match = cardRegex.exec(rawOutput)) !== null) {
    flashcards.push({
      question: match[1].trim(),
      answer: match[2].trim(),
    });
  }
  return flashcards;
}

router.post('/', async (req, res) => {
  try {
    const { file_path } = req.body;
    if (!file_path) return res.status(400).json({ error: 'file_path is required' });

    const { data, error } = await supabase.storage.from('documents').download(file_path);
    if (error) throw new Error('Failed to download file from storage');

    const buffer = await data.arrayBuffer();
    const pdfData = await pdfParse(Buffer.from(buffer));
    const text = pdfData.text;

    if (!text || !text.trim()) return res.status(400).json({ error: 'No text extracted from PDF' });

    const limitedText = text.substring(0, 15000);

    const flashcards = await generateFlashcardsFromText(limitedText);

    res.json({ flashcards });
  } catch (err) {
    console.error('Flashcards API error:', err);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

module.exports = router;
