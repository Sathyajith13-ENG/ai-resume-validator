const express = require('express');
const { body, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');

const upload = require('../middleware/upload');
const { extractTextFromPDF } = require('../services/pdfService');
const { analyseResume } = require('../services/aiService');
const { saveSession, getSession, removeSession } = require('../services/sessionStore');

const router = express.Router();

// ── POST /api/analysis ────────────────────────────────────────
// Accepts: multipart/form-data with `resume` (PDF) + `jobDescription` (text)
router.post(
  '/',
  upload.single('resume'),
  [
    body('jobDescription')
      .trim()
      .isLength({ min: 50, max: 10000 })
      .withMessage('Job description must be between 50 and 10,000 characters.'),
  ],
  async (req, res, next) => {
    try {
      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
          details: errors.array(),
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Please upload a PDF résumé.' });
      }

      const { jobDescription } = req.body;

      // Extract text from PDF buffer (never saved to disk)
      const resumeText = await extractTextFromPDF(req.file.buffer);

      // Run AI analysis
      const analysisResult = await analyseResume(resumeText, jobDescription);

      const sessionId = randomUUID();

      // Persist to sessionStore (in-memory + MongoDB if available)
      await saveSession({
        sessionId,
        jobDescription,
        resumeKeywords: analysisResult.resumeKeywords || [],
        analysisResult: {
          overallScore: analysisResult.overallScore,
          matchedSkills: analysisResult.matchedSkills,
          missingSkills: analysisResult.missingSkills,
          strengths: analysisResult.strengths,
          improvements: analysisResult.improvements,
          summary: analysisResult.summary,
          experienceMatch: analysisResult.experienceMatch,
          educationMatch: analysisResult.educationMatch,
        },
      });

      // Return the analysis (sessionId enables follow-up chat)
      res.status(200).json({
        sessionId,
        ...analysisResult,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/analysis/:sessionId ──────────────────────────────
router.get('/:sessionId', async (req, res, next) => {
  try {
    const session = await getSession(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Analysis session not found or has expired.' });
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/analysis/:sessionId ──────────────────────────
// Allows users to manually remove their session data before the 24-hour TTL
router.delete('/:sessionId', async (req, res, next) => {
  try {
    const deleted = await removeSession(req.params.sessionId);

    if (!deleted) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    res.json({ message: 'Session data deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
