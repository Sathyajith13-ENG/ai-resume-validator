const mongoose = require('mongoose');

/**
 * AnalysisSession stores only the processed, anonymised results of an analysis.
 * Raw résumé text is NEVER stored. Job description text IS stored as it was
 * supplied by the user for the purpose of follow-up chat queries.
 *
 * Retention: TTL index auto-deletes documents after 24 hours.
 * Manual removal: DELETE /api/analysis/:sessionId
 */
const analysisSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    jobDescription: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    // Extracted skill keywords only – no personal info
    resumeKeywords: {
      type: [String],
      default: [],
    },
    analysisResult: {
      overallScore: { type: Number, min: 0, max: 100 },
      matchedSkills: [String],
      missingSkills: [String],
      strengths: [String],
      improvements: [String],
      summary: String,
      experienceMatch: String,
      educationMatch: String,
    },
    // Chat history (role + text only, no personal data)
    chatHistory: [
      {
        role: { type: String, enum: ['user', 'assistant'] },
        content: { type: String, maxlength: 5000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Auto-delete after 24 hours
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true, bufferCommands: false }
);

module.exports = mongoose.model('AnalysisSession', analysisSessionSchema);
