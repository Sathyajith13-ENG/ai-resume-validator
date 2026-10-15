const express = require('express');
const { body, validationResult } = require('express-validator');

const { chatAboutResume } = require('../services/aiService');
const AnalysisSession = require('../models/AnalysisSession');
const mongoose = require('mongoose');

const router = express.Router();

// ── POST /api/chat/:sessionId ─────────────────────────────────
router.post(
  '/:sessionId',
  [
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2,000 characters.'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
      }

      const { message } = req.body;
      const { sessionId } = req.params;

      // Fail fast if database is not connected
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          error: 'Database is not connected. Chat session persistence is unavailable.',
        });
      }

      // Retrieve session from DB
      let session = null;
      try {
        session = await AnalysisSession.findOne({ sessionId });
      } catch (dbErr) {
        console.warn('DB lookup skipped:', dbErr.message);
      }

      if (!session) {
        return res.status(404).json({
          error: 'Analysis session not found or has expired. Please run a new analysis.',
        });
      }

      // Get AI response
      const aiResponse = await chatAboutResume(
        session,
        message,
        session.chatHistory
      );

      // Persist updated chat history (best-effort)
      try {
        session.chatHistory.push({ role: 'user', content: message });
        session.chatHistory.push({ role: 'assistant', content: aiResponse });
        // Keep only last 20 messages to limit document size
        if (session.chatHistory.length > 20) {
          session.chatHistory = session.chatHistory.slice(-20);
        }
        await session.save();
      } catch (dbErr) {
        console.warn('Chat history save skipped:', dbErr.message);
      }

      res.json({ reply: aiResponse });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
