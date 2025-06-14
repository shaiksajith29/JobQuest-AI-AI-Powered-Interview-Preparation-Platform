const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample questions array
const questions = [
  "What is normalization in databases?",
  "Explain polymorphism in OOP.",
  "What is a RESTful API?",
];

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).send("Unauthorized");

  const token = authHeader.split(' ')[1]; // Bearer <token>
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send("Invalid Token");
    req.userId = decoded.id;
    next();
  });
}

// GET /question - send a random question
router.get('/question', verifyToken, (req, res) => {
  const question = questions[Math.floor(Math.random() * questions.length)];
  res.json({ question });
});

// POST /answer - receive answer, call OpenAI, save feedback
router.post('/answer', verifyToken, async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    const prompt = `Evaluate the following answer for an interview:\n\nQuestion: ${question}\nAnswer: ${answer}\nGive feedback and rate from 1 to 10.`;

    // Call OpenAI API
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = gptResponse.choices[0].message.content;

    // Save interview session to DB
    db.query(
      "INSERT INTO interview_sessions (user_id, question, answer, feedback) VALUES (?, ?, ?, ?)",
      [req.userId, question, answer, feedback],
      (err) => {
        if (err) {
          console.error("DB insert error:", err);
          return res.status(500).json({ error: "Database insert failed" });
        }
        res.json({ feedback });
      }
    );

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
