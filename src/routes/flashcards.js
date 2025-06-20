const express = require('express');
const { generateFlashcardsFromText } = require('../../lib/generateFlashcards');
const { supabase } = require('../../lib/supabaseClient');
const { extractTextFromPDF } = require('../../lib/pdf');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { file_path, text } = req.body;

    let content = text;

    if (!content && file_path) {
      const { data, error } = await supabase.storage.from('documents').download(file_path);
      if (error) return res.status(400).json({ error: 'Failed to download document' });

      const buffer = await data.arrayBuffer();
      content = await extractTextFromPDF(Buffer.from(buffer));
    }

    if (!content || content.trim().length < 50) {
      return res.status(400).json({ error: 'Document text is too short or missing' });
    }

    const flashcards = await generateFlashcardsFromText(content);

    res.json({ flashcards });
  } catch (err) {
    console.error('Flashcards API error:', err);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

module.exports = router;
