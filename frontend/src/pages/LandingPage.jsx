import { useState } from 'react';
import Navbar from '../components/Navbar';
import UploadZone from '../components/UploadZone';
import { analyseResume } from '../api/client';
import './LandingPage.css';

const FEATURES = [
  { icon: '🎯', title: 'ATS Score', desc: 'Get an instant match score against your target role.' },
  { icon: '🔍', title: 'Skill Gap Analysis', desc: 'See exactly which skills are missing from your résumé.' },
  { icon: '🤖', title: 'AI Chat Coach', desc: 'Ask questions and get personalised improvement advice.' },
  { icon: '🔒', title: 'Privacy First', desc: 'Your résumé is never stored. Sessions expire in 24 hours.' },
];

const STEPS = [
  { num: '01', title: 'Upload Your Résumé', desc: 'Drop a PDF up to 5 MB.' },
  { num: '02', title: 'Paste the Job Description', desc: 'Copy it directly from the job posting.' },
  { num: '03', title: 'Get Your Analysis', desc: 'AI scores your match in seconds.' },
];

export default function LandingPage({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!file) errs.file = 'Please upload your résumé as a PDF.';
    if (!jobDescription.trim()) {
      errs.jobDescription = 'Please paste the job description.';
    } else if (jobDescription.trim().length < 50) {
      errs.jobDescription = 'Job description seems too short (min 50 characters).';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const data = await analyseResume(file, jobDescription);
      onAnalysisComplete(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      <Navbar onNewAnalysis={() => {}} />

      {/* Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>

        <div className="container hero-content">
          <div className="hero-badge">
            <span aria-hidden="true">✨</span> Powered by Google Gemini AI
          </div>

          <h1 id="hero-heading" className="hero-title font-display">
            Land Your Dream Job<br />
            <span className="hero-title-gradient">Faster with AI</span>
          </h1>

          <p className="hero-subtitle text-muted">
            Upload your résumé and paste any job description. Our AI analyses the match,
            identifies skill gaps, and provides actionable coaching — in seconds.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">95%</span>
              <span className="hero-stat-label text-muted text-sm">Accuracy</span>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <span className="hero-stat-value">&lt;30s</span>
              <span className="hero-stat-label text-muted text-sm">Analysis Time</span>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <span className="hero-stat-value">Free</span>
              <span className="hero-stat-label text-muted text-sm">No Sign-up</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Form */}
      <section className="upload-section" aria-labelledby="upload-heading">
        <div className="container">
          <div className="upload-card card-glass">
            <div className="upload-card-header">
              <h2 id="upload-heading" className="font-display text-xl font-bold">
                Analyse Your Résumé
              </h2>
              <p className="text-muted text-sm">
                Your résumé is processed in memory only and never saved to disk.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="upload-form-grid">
                {/* Upload zone */}
                <div>
                  <UploadZone file={file} onFileChange={setFile} />
                  {fieldErrors.file && (
                    <p className="form-error mt-2" role="alert">
                      <span aria-hidden="true">⚠️</span> {fieldErrors.file}
                    </p>
                  )}
                </div>

                {/* Job Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="job-description">
                    Job Description
                  </label>
                  <textarea
                    id="job-description"
                    className={`form-textarea ${fieldErrors.jobDescription ? 'form-textarea--error' : ''}`}
                    placeholder="Paste the full job description here…"
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      if (fieldErrors.jobDescription) setFieldErrors((p) => ({ ...p, jobDescription: '' }));
                    }}
                    maxLength={10000}
                    aria-describedby={fieldErrors.jobDescription ? 'jd-error' : 'jd-hint'}
                    style={{ minHeight: '200px' }}
                  />
                  <div className="jd-footer">
                    {fieldErrors.jobDescription ? (
                      <p className="form-error" id="jd-error" role="alert">
                        <span aria-hidden="true">⚠️</span> {fieldErrors.jobDescription}
                      </p>
                    ) : (
                      <p className="text-muted text-xs" id="jd-hint">
                        Tip: Include the full description for better accuracy.
                      </p>
                    )}
                    <span className="text-muted text-xs">
                      {jobDescription.length}/10,000
                    </span>
                  </div>
                </div>
              </div>

              {/* Global error */}
              {error && (
                <div className="alert alert-error animate-fade-in" role="alert">
                  <span className="alert-icon" aria-hidden="true">⚠️</span>
                  <div>
                    <strong>Analysis failed</strong>
                    <p>{error}</p>
                    {error.toLowerCase().includes('pdf') && (
                      <p className="mt-2 text-sm">
                        💡 Try exporting your résumé as a text-based PDF from Word or Google Docs.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="upload-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      <span>Analysing your résumé…</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">🚀</span>
                      <span>Analyse My Résumé</span>
                    </>
                  )}
                </button>

                {loading && (
                  <p className="text-center text-muted text-sm animate-fade-in" role="status" aria-live="polite">
                    AI is reading your résumé and job description. This takes 10–30 seconds…
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="steps-section" aria-labelledby="steps-heading">
        <div className="container">
          <h2 id="steps-heading" className="section-title font-display">How It Works</h2>
          <div className="steps-grid">
            {STEPS.map((step) => (
              <div key={step.num} className="step-card card">
                <span className="step-num">{step.num}</span>
                <h3 className="step-title font-display">{step.title}</h3>
                <p className="text-muted text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading" className="section-title font-display">Why ResumeAI?</h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card">
                <span className="feature-icon" aria-hidden="true">{f.icon}</span>
                <h3 className="feature-title font-display">{f.title}</h3>
                <p className="text-muted text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} ResumeAI · Built with Google Gemini AI
          </p>
          <p className="text-muted text-xs">
            Résumé data is processed in memory only and auto-deleted after 24 hours.
          </p>
        </div>
      </footer>
    </div>
  );
}
