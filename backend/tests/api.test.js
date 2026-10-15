const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Set test environment before requiring app
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';
process.env.MONGODB_URI = ''; // skip DB in tests

const app = require('../src/app');

describe('Health Endpoint', () => {
  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('ai');
  });
});

describe('Analysis Endpoint - Validation', () => {
  it('POST /api/analysis without file returns 400', async () => {
    const res = await request(app)
      .post('/api/analysis')
      .field('jobDescription', 'We need a React developer with 3 years experience and TypeScript skills for a fintech startup.');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/analysis with short job description returns 422', async () => {
    // Create a minimal PDF buffer for testing
    const minimalPdf = Buffer.from('%PDF-1.4 1 0 obj<</Type/Catalog>>');

    const res = await request(app)
      .post('/api/analysis')
      .attach('resume', minimalPdf, { filename: 'test.pdf', contentType: 'application/pdf' })
      .field('jobDescription', 'Too short');

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/analysis with non-PDF file returns 400', async () => {
    const txtBuffer = Buffer.from('plain text file');

    const res = await request(app)
      .post('/api/analysis')
      .attach('resume', txtBuffer, { filename: 'resume.txt', contentType: 'text/plain' })
      .field('jobDescription', 'We need an experienced software engineer with React, Node.js, and TypeScript skills to build enterprise applications.');

    expect(res.status).toBe(400);
  });
});

describe('Chat Endpoint - Validation', () => {
  it('POST /api/chat/:id with empty message returns 422', async () => {
    const res = await request(app)
      .post('/api/chat/fake-session-id')
      .send({ message: '' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/chat/:id with non-existent session returns 404 or 503', async () => {
    const res = await request(app)
      .post('/api/chat/non-existent-session-123')
      .send({ message: 'What skills should I add?' });

    // 404 (session not found) or 503 (no DB configured)
    expect([404, 503]).toContain(res.status);
  });
});

describe('404 Handler', () => {
  it('Unknown routes return 404', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
