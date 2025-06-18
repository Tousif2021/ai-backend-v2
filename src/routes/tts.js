// src/routes/tts.js
const fetch = require('node-fetch');

const express = require('express');

const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

router.post('/api/tts', async (req, res) => {
  const { text, voice = "Rachel" } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2"
      })
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      return res.status(400).json({ error: 'TTS API failed', details: errText });
    }

    res.set('Content-Type', 'audio/mpeg');
    ttsRes.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

module.exports = router;
