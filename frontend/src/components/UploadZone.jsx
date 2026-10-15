import { useCallback, useState } from 'react';
import './UploadZone.css';

const MAX_SIZE_MB = 5;

export default function UploadZone({ file, onFileChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');

  const validateFile = (f) => {
    if (!f) return 'No file selected.';
    if (f.type !== 'application/pdf') return 'Only PDF files are accepted.';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB} MB.`;
    return null;
  };

  const handleFile = useCallback((f) => {
    const error = validateFile(f);
    if (error) {
      setDragError(error);
      return;
    }
    setDragError('');
    onFileChange(f);
  }, [onFileChange]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
    e.target.value = ''; // allow re-selecting same file
  };

  return (
    <div className="form-group">
      <label className="form-label" htmlFor="resume-upload">
        Résumé PDF
      </label>

      <div
        className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''} ${file ? 'upload-zone--has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('resume-upload').click()}
        role="button"
        tabIndex={0}
        aria-label="Upload résumé PDF by clicking or dragging"
        onKeyDown={(e) => e.key === 'Enter' && document.getElementById('resume-upload').click()}
      >
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="sr-only"
          aria-describedby="upload-hint"
        />

        {file ? (
          <div className="upload-zone-success">
            <span className="upload-icon" aria-hidden="true">📄</span>
            <div>
              <p className="upload-filename">{file.name}</p>
              <p className="upload-filesize text-muted text-sm">
                {(file.size / 1024).toFixed(0)} KB · Click to replace
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm upload-remove"
              onClick={(e) => { e.stopPropagation(); onFileChange(null); setDragError(''); }}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-zone-empty">
            <div className="upload-icon-wrapper" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="upload-title">Drop your résumé here</p>
            <p className="upload-subtitle text-muted text-sm" id="upload-hint">
              or <span className="text-primary">browse to upload</span> · PDF only · Max {MAX_SIZE_MB} MB
            </p>
          </div>
        )}
      </div>

      {dragError && (
        <p className="form-error" role="alert">
          <span aria-hidden="true">⚠️</span> {dragError}
        </p>
      )}
    </div>
  );
}
