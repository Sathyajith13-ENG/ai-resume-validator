const mongoose = require('mongoose');
const AnalysisSession = require('../models/AnalysisSession');

// In-memory session store for fast response and resilient fallback when DB is disconnected
const memorySessions = new Map();

// Periodic cleanup of expired memory sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of memorySessions.entries()) {
    if (session.expiresAt && session.expiresAt.getTime() < now) {
      memorySessions.delete(id);
    }
  }
}, 60 * 60 * 1000).unref();

/**
 * Stores session data in memory and MongoDB (if connected).
 */
const saveSession = async ({ sessionId, jobDescription, resumeKeywords, analysisResult }) => {
  const sessionData = {
    sessionId,
    jobDescription,
    resumeKeywords: resumeKeywords || [],
    analysisResult,
    chatHistory: [],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };

  // Always keep in memory
  memorySessions.set(sessionId, sessionData);

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await AnalysisSession.create(sessionData);
    } catch (err) {
      console.warn('MongoDB save skipped:', err.message);
    }
  }

  return sessionData;
};

/**
 * Retrieves session by sessionId from memory or MongoDB.
 */
const getSession = async (sessionId) => {
  // Check memory first
  if (memorySessions.has(sessionId)) {
    return memorySessions.get(sessionId);
  }

  // Fallback to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const dbSession = await AnalysisSession.findOne({ sessionId });
      if (dbSession) {
        memorySessions.set(sessionId, dbSession);
        return dbSession;
      }
    } catch (err) {
      console.warn('MongoDB lookup skipped:', err.message);
    }
  }

  return null;
};

/**
 * Appends messages to chat history in memory and MongoDB.
 */
const updateChatHistory = async (session, userMessage, assistantReply) => {
  if (!session.chatHistory) session.chatHistory = [];
  session.chatHistory.push({ role: 'user', content: userMessage, createdAt: new Date() });
  session.chatHistory.push({ role: 'assistant', content: assistantReply, createdAt: new Date() });

  if (session.chatHistory.length > 20) {
    session.chatHistory = session.chatHistory.slice(-20);
  }

  // Update MongoDB if connected
  if (typeof session.save === 'function' && mongoose.connection.readyState === 1) {
    try {
      await session.save();
    } catch (err) {
      console.warn('MongoDB chat save skipped:', err.message);
    }
  } else if (mongoose.connection.readyState === 1) {
    try {
      await AnalysisSession.updateOne(
        { sessionId: session.sessionId },
        { $set: { chatHistory: session.chatHistory } }
      );
    } catch (err) {
      console.warn('MongoDB chat update skipped:', err.message);
    }
  }
};

/**
 * Removes session data.
 */
const removeSession = async (sessionId) => {
  const existedInMemory = memorySessions.delete(sessionId);
  let dbDeleted = false;

  if (mongoose.connection.readyState === 1) {
    try {
      const res = await AnalysisSession.deleteOne({ sessionId });
      dbDeleted = res.deletedCount > 0;
    } catch (err) {
      console.warn('MongoDB delete skipped:', err.message);
    }
  }

  return existedInMemory || dbDeleted;
};

module.exports = {
  saveSession,
  getSession,
  updateChatHistory,
  removeSession,
};
