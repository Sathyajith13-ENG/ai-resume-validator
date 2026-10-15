const express = require('express');
const { body, validationResult } = require('express-validator');

const { chatAboutResume } = require('../services/aiService');
const { getSession, updateChatHistory } = require('../services/sessionStore');

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

      // Retrieve session from sessionStore (memory or MongoDB)
      const session = await getSession(sessionId);

      if (!session) {
        return res.status(404).json({
          error: 'Analysis session not found or has expired. Please run a new analysis.',
        });
      }

      // Get AI response
      const aiResponse = await chatAboutResume(
        session,
        message,
        session.chatHistory || []
      );

      // Persist updated chat history in sessionStore
      await updateChatHistory(session, message, aiResponse);

      res.json({ reply: aiResponse });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
