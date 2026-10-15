const { extractTextFromPDF } = require('../src/services/pdfService');

describe('PDF Service', () => {
  it('throws on empty buffer', async () => {
    await expect(extractTextFromPDF(Buffer.alloc(0))).rejects.toThrow(/empty/i);
  });

  it('throws on null input', async () => {
    await expect(extractTextFromPDF(null)).rejects.toThrow();
  });

  it('throws on corrupted PDF buffer', async () => {
    const fakeBuffer = Buffer.from('not a valid pdf content at all');
    await expect(extractTextFromPDF(fakeBuffer)).rejects.toThrow();
  });
});
