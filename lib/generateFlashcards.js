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

    // FIX: Use the text() method to extract content more reliably
    const rawOutput = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("✅ Gemini response text:\n", rawOutput);

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

    // If no flashcards were parsed, return default ones
    if (flashcards.length === 0) {
      console.warn("No flashcards were parsed from AI response, returning default flashcards");
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
    console.error("Error generating flashcards:", error);
    
    // Return default flashcards instead of throwing the error
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
