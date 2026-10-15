const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw Object.assign(
        new Error('AI service is not configured. Please add your GEMINI_API_KEY to backend/.env to run the analysis.'),
        { status: 503 }
      );
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-flash-lite',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithFallback = async (prompt) => {
  const client = getClient();
  let lastErr;
  for (const modelName of MODELS) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      console.warn(`Model ${modelName} fallback triggered:`, err.message);
      lastErr = err;
      await sleep(500);
    }
  }
  throw lastErr;
};

/**
 * Analyses how well a résumé matches a job description.
 * Returns structured JSON with score, matched/missing skills, etc.
 */
const analyseResume = async (resumeText, jobDescription) => {
  const prompt = `You are an expert recruiter and ATS (Applicant Tracking System) specialist.
Analyse the following résumé against the job description and return a JSON object (no markdown fences).

JOB DESCRIPTION:
${jobDescription.substring(0, 5000)}

RÉSUMÉ:
${resumeText.substring(0, 8000)}

Return ONLY valid JSON matching this exact structure:
{
  "overallScore": <integer 0-100>,
  "matchedSkills": [<array of skill strings found in résumé that match JD>],
  "missingSkills": [<array of important skills in JD not found in résumé>],
  "strengths": [<array of 3-5 brief strength statements>],
  "improvements": [<array of 3-5 specific, actionable improvement suggestions>],
  "summary": "<2-3 sentence overall assessment>",
  "experienceMatch": "<one of: Excellent | Good | Partial | Poor>",
  "educationMatch": "<one of: Excellent | Good | Partial | Poor | Not Specified>",
  "resumeKeywords": [<array of key skills/technologies extracted from résumé>]
}`;

  const result = await generateWithFallback(prompt);
  const text = result.response.text().trim();

  // Strip accidental markdown fences
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw Object.assign(
      new Error('AI returned an unexpected format. Please try again.'),
      { status: 502 }
    );
  }

  // Validate and clamp score
  parsed.overallScore = Math.max(0, Math.min(100, parseInt(parsed.overallScore) || 0));
  parsed.matchedSkills = Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills.slice(0, 30) : [];
  parsed.missingSkills = Array.isArray(parsed.missingSkills) ? parsed.missingSkills.slice(0, 20) : [];
  parsed.strengths = Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6) : [];
  parsed.improvements = Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 6) : [];
  parsed.resumeKeywords = Array.isArray(parsed.resumeKeywords) ? parsed.resumeKeywords.slice(0, 40) : [];

  return parsed;
};

/**
 * Continues a chat conversation about the résumé analysis.
 */
const chatAboutResume = async (sessionData, userMessage, history) => {
  const client = getClient();

  const systemContext = `You are a helpful career coach and résumé expert. 
You have already analysed a résumé for the following job description:

JOB DESCRIPTION SUMMARY:
${sessionData.jobDescription.substring(0, 2000)}

ANALYSIS RESULTS:
- Overall Match Score: ${sessionData.analysisResult.overallScore}%
- Matched Skills: ${(sessionData.analysisResult.matchedSkills || []).join(', ')}
- Missing Skills: ${(sessionData.analysisResult.missingSkills || []).join(', ')}
- Summary: ${sessionData.analysisResult.summary}

Answer the user's questions concisely and helpfully. Focus on actionable advice.
Keep responses under 300 words unless more detail is specifically requested.`;

  // Build chat history for Gemini
  const chatHistory = (history || []).slice(-10).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chatContents = [
    { role: 'user', parts: [{ text: systemContext }] },
    { role: 'model', parts: [{ text: 'Understood. I\'m ready to help with questions about this résumé analysis.' }] },
    ...chatHistory,
  ];

  let lastErr;
  for (const modelName of MODELS) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const chat = model.startChat({ history: chatContents });
      const result = await chat.sendMessage(userMessage);
      return result.response.text();
    } catch (err) {
      console.warn(`Chat model ${modelName} fallback triggered:`, err.message);
      lastErr = err;
      await sleep(500);
    }
  }
  throw lastErr;
};

module.exports = { analyseResume, chatAboutResume };
