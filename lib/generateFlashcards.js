/**
 * Parses Gemini API response to extract flashcards.
 * @param {string} inputText - Text input to generate flashcards from.
 * @returns {Promise<Array<{question: string, answer: string}>>} - Array of flashcard objects.
 */
async function generateFlashcardsFromText(inputText) {
  const { genAI } = require('./gemini');  // import gemini instance here if needed, else pass as param

  const prompt = `
Create 5 flashcards from the text below. Each flashcard should be formatted exactly as:
Q: [question]
A: [answer]

Text:
"""${inputText}"""`;

  // Call Gemini API
  const model = genAI.model("gemini-1.5-flash");
  const response = await model.generateContent(prompt);

  // Extract the raw text from Gemini response
  const rawOutput = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Regex to parse flashcards in the format Q: ... A: ...
  const flashcards = [];
  const cardRegex = /Q:\s*(.+?)\s*A:\s*([\s\S]+?)(?=(?:Q:|$))/g;

  let match;
  while ((match = cardRegex.exec(rawOutput)) !== null) {
    flashcards.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  }

  return flashcards;
}

module.exports = {
  generateFlashcardsFromText,
};
