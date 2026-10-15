const pdfParse = require('pdf-parse');

/**
 * Extracts plain text from a PDF buffer.
 * Throws a user-friendly error if the PDF is encrypted, empty, or corrupted.
 */
const extractTextFromPDF = async (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw Object.assign(new Error('The uploaded file appears to be empty.'), { status: 400 });
  }

  let data;
  try {
    data = await pdfParse(buffer, {
      // Limit pages to prevent DoS via huge PDFs
      max: 20,
    });
  } catch (err) {
    console.error('PDF parse error:', err.message);
    throw Object.assign(
      new Error(
        'Could not read the PDF. The file may be password-protected, corrupted, or contain only images. ' +
          'Please try a text-based PDF or copy-paste your résumé text instead.'
      ),
      { status: 422 }
    );
  }

  const text = (data.text || '').trim();

  if (text.length < 50) {
    throw Object.assign(
      new Error(
        'Very little text was extracted from your PDF. ' +
          'The résumé may be image-based (scanned). ' +
          'Please use a text-based PDF for best results.'
      ),
      { status: 422 }
    );
  }

  // Sanitise: collapse excessive whitespace
  return text.replace(/\s{3,}/g, '\n\n').substring(0, 15000);
};

module.exports = { extractTextFromPDF };
