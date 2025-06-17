require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000; // Changed to port 4000

// Middleware
app.use(cors());
app.use(express.json());

// Debug: Log environment variables (remove in production)
console.log('Environment check:');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);

// Routes - Load quiz routes first to ensure they're registered
console.log('Loading quiz routes...');
const quizRoutes = require('./src/routes/quiz');
app.use('/api/quiz', quizRoutes);
console.log('Quiz routes loaded successfully');

// Load other routes
const summarizeRoute = require('./src/routes/summarize');
const documentsRoute = require('./src/routes/documents');

app.use('/api/summarize', summarizeRoute);
app.use('/api/documents', documentsRoute);

// Add AI chat route
app.post('/api/ask', async (req, res) => {
  try {
    const genAI = require('./lib/gemini');
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'No question provided' });
    }
    
    console.log('AI Chat question received:', question);
    
    // Use Gemini to answer the question
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a helpful AI study assistant. Answer the following question in a clear, educational manner:\n\n${question}`;
    
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    
    console.log('AI Chat response generated');
    res.json({ answer });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process your question. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check
app.get('/debug-routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      routes.push({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      });
    } else if (r.name === 'router') {
      r.handle.stack.forEach(function(rr){
        if (rr.route) {
          routes.push({
            path: r.regexp.source.replace('\\/?(?=\\/|$)', '') + rr.route.path,
            methods: Object.keys(rr.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
    }
  });
});

app.get('/ping', (req, res) => res.send('pong'));

// Catch all unhandled errors safely
app.use((err, req, res, next) => {
  console.error('Express error handler caught:', err);
  res.status(500).json({ 
    error: err?.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' && err?.stack ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`AI Backend server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Quiz ping available at http://localhost:${PORT}/api/quiz/ping`);
  console.log(`Debug routes available at http://localhost:${PORT}/debug-routes`);
});