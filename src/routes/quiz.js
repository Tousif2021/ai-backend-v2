console.log('### quiz.js loaded from', __filename);

const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../../lib/generateQuiz');

// Health check for this route
router.get('/ping', (req, res) => {
  res.json({ status: 'quiz route is alive' });
});

// POST /api/quiz/generate
router.post('/generate', async (req, res) => {
  try {
    const { content } = req.body;

    // Validate
    if (!content || typeof content !== 'string' || content.trim().length < 50) {
      return res.status(400).json({
        error: 'Document content is too short or missing. Need at least 50 characters.',
      });
    }

    // Call your AI logic (should return an array of questions)
    const quiz = await generateQuiz(content);

    if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
      return res.status(500).json({
        error: 'Quiz generation failed or returned no questions.',
      });
    }

    // Success
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Failed to generate quiz.',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

module.exports = router;
