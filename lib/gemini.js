const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set!');
  console.error('Please check your .env file in the ai-backend directory');
  throw new Error('Gemini API key not set! Please add GEMINI_API_KEY to your .env file.');
}

console.log('✅ Gemini API key loaded successfully');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Helper to call Gemini with a prompt and get the full response
 * @param {string} prompt 
 * @returns {Promise<Object>} Gemini API response
 */
async function callGeminiAPI(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

    console.log("Gemini API raw response:", JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

module.exports = {
  genAI,
  callGeminiAPI,
};
