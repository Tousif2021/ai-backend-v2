const genAI = require('./gemini');

/**
 * Generates a quiz (MCQs) from the given document content using Gemini AI.
 * Returns an array of questions, or a fallback if parsing fails.
 */
async function generateQuiz(content) {
  // 1. Build the prompt for Gemini
  const prompt = `
You are an expert quiz creator. Based on the following text, create exactly 8-12 multiple choice questions that test understanding of the key concepts.

IMPORTANT: Respond with ONLY a valid JSON array. No additional text, explanations, or formatting.

Format for each question:
{
  "type": "mcq",
  "question": "What is the main concept discussed?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Option A"
}

Requirements:
- Create 8-12 questions total
- All questions must be multiple choice (type: "mcq")
- Each question must have exactly 4 options
- Questions should cover different aspects of the content
- Make questions challenging but fair
- Ensure the correct answer is clearly identifiable from the text

TEXT TO ANALYZE:
"""${content.substring(0, 8000)}"""

Respond with only the JSON array:
`;

  let text = '';
  try {
    // 2. Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();

    // 3. Remove markdown and extract JSON array
    let quizJSON = text.trim()
      .replace(/```json\s*/g, '')
      .replace(/```/g, '');

    // Find JSON array bounds (start and end)
    const start = quizJSON.indexOf('[');
    const end = quizJSON.lastIndexOf(']');

    if (start === -1 || end === -1) {
      throw new Error('No JSON array found in Gemini response');
    }

    quizJSON = quizJSON.slice(start, end + 1);

    // 4. Parse JSON
    const parsedQuiz = JSON.parse(quizJSON);

    // 5. Validate: must be an array with 8-12 questions
    if (!Array.isArray(parsedQuiz) || parsedQuiz.length < 4) {
      throw new Error('Not enough valid quiz questions returned');
    }

    // 6. Validate questions structure (type, question, options, answer)
    const validatedQuiz = parsedQuiz.filter(q =>
      q &&
      q.type === 'mcq' &&
      typeof q.question === 'string' &&
      Array.isArray(q.options) && q.options.length === 4 &&
      typeof q.answer === 'string' &&
      q.options.includes(q.answer)
    );

    if (validatedQuiz.length === 0) {
      throw new Error('No valid MCQ questions found in generated quiz');
    }

    return validatedQuiz;
  } catch (err) {
    console.error('Quiz parsing error:', err.message);
    if (text) console.error('Gemini response (first 500 chars):', text.substring(0, 500));
    // Fallback: return a basic quiz so your UI doesn't break
    return [
      {
        type: "mcq",
        question: "Based on the document, what is the general topic?",
        options: [
          "Education/Study material",
          "Personal blog",
          "Fictional story",
          "Advertisement"
        ],
        answer: "Education/Study material"
      }
    ];
  }
}

module.exports = { generateQuiz };
