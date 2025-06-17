const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set!');
  console.error('Please check your .env file in the ai-backend directory');
  throw new Error('Gemini API key not set! Please add GEMINI_API_KEY to your .env file.');
}

console.log('✅ Gemini API key loaded successfully');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

module.exports = genAI;