const express = require('express');
const { generateFlashcardsFromText } = require('../../lib/generateFlashcards');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const flashcards = await generateFlashcardsFromText(text);
    res.json({ flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate flashcards" });
  }
});

module.exports = router;
