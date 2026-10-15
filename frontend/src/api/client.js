const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (isJson && (body.error || body.message)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }
  return body;
};

/**
 * POST /api/analysis
 * Sends the PDF and job description for analysis.
 */
export const analyseResume = async (pdfFile, jobDescription, onProgress) => {
  const formData = new FormData();
  formData.append('resume', pdfFile);
  formData.append('jobDescription', jobDescription);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const res = await fetch(`${BASE_URL}/analysis`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error. Please check your connection.', 0);
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * POST /api/chat/:sessionId
 * Sends a chat message and gets an AI response.
 */
export const sendChatMessage = async (sessionId, message) => {
  const res = await fetch(`${BASE_URL}/chat/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return handleResponse(res);
};

/**
 * DELETE /api/analysis/:sessionId
 * Manually removes session data.
 */
export const deleteSession = async (sessionId) => {
  const res = await fetch(`${BASE_URL}/analysis/${sessionId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
};

/**
 * GET /api/health
 */
export const checkHealth = async () => {
  const res = await fetch(`${BASE_URL}/health`);
  return handleResponse(res);
};

export { ApiError };
