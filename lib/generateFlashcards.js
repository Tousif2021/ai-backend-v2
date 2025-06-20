const { callGeminiAPI } = require('./gemini');
console.log("callGeminiAPI is:", typeof callGeminiAPI);  // Should print: function


async function generateFlashcardsFromText(inputText) {
  const prompt = `
Create 5 flashcards from the text below. Each flashcard should be formatted exactly as:
Q: [question]
A: [answer]

Text:
"""${inputText}"""`;

  const response = await callGeminiAPI(prompt);

  // FIX: added .response here
  const rawOutput = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  console.log("Raw Gemini output:\n", rawOutput);

  const flashcards = [];
  const cardRegex = /Q:\s*(.+?)\s*A:\s*([\s\S]+?)(?=(?:Q:|$))/g;

  let match;
  while ((match = cardRegex.exec(rawOutput)) !== null) {
    console.log("Matched Q&A:", match[1].trim(), "|", match[2].trim());
    flashcards.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  }

  console.log("Parsed flashcards array length:", flashcards.length);

  return flashcards;
}

module.exports = {
  generateFlashcardsFromText,
};
