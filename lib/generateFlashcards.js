const { callGeminiAPI } = require('./gemini');

async function generateFlashcardsFromText(inputText) {
  try {
    const prompt = `
Create 5 flashcards from the text below. Each flashcard should be formatted exactly as:
Q: [question]
A: [answer]

Text:
"""${inputText}"""`;

    const response = await callGeminiAPI(prompt);
    // ✅ Get the text from Gemini
const rawOutput = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
console.log("✅ Gemini response text:\n", rawOutput);

const flashcards = [];

const lines = rawOutput
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line.length > 0);

console.log("🚨 BEGIN LINE SPLIT DUMP 🚨");
lines.forEach((line, i) => console.log(`[${i}] ${JSON.stringify(line)}`));
console.log("🚨 END LINE SPLIT DUMP 🚨");

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith("Q:") && lines[i + 1]?.startsWith("A:")) {
    flashcards.push({
      question: lines[i].slice(2).trim(),
      answer: lines[i + 1].slice(2).trim()
    });
    i++;
  }
}

console.log("✅ Parsed flashcards array length:", flashcards.length);

    if (flashcards.length === 0) {
      return [
        {
          question: "What is the main topic of this content?",
          answer: "Please review the uploaded content to understand the main concepts."
        },
        {
          question: "What are the key points to remember?",
          answer: "Focus on the most important information presented in the material."
        }
      ];
    }

    return flashcards;
  } catch (error) {
    console.error("❌ Error generating flashcards:", error);
    return [
      {
        question: "What is the main topic of this content?",
        answer: "Please review the uploaded content to understand the main concepts."
      },
      {
        question: "What are the key points to remember?",
        answer: "Focus on the most important information presented in the material."
      },
      {
        question: "How can you apply this knowledge?",
        answer: "Think about practical applications of the concepts you've learned."
      }
    ];
  }
}

module.exports = {
  generateFlashcardsFromText,
};
