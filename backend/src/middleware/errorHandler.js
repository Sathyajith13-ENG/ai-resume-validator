/**
 * Global error handler – normalises all errors into a consistent JSON shape.
 * Sensitive stack traces are only surfaced in development.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 5 MB.' });
  }

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(422).json({ error: 'Validation failed', details: err.details });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status < 500 || isDev ? err.message : 'An unexpected server error occurred.';

  console.error(`[${new Date().toISOString()}] ${status} ${req.method} ${req.path}:`, err.message);
  if (isDev && err.stack) console.error(err.stack);

  res.status(status).json({
    error: message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
