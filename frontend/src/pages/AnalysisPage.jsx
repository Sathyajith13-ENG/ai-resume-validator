import { useState } from 'react';
import Navbar from '../components/Navbar';
import ScoreRing from '../components/ScoreRing';
import SkillsPanel from '../components/SkillsPanel';
import ChatAssistant from '../components/ChatAssistant';
import { deleteSession } from '../api/client';
import './AnalysisPage.css';

const MATCH_LABELS = {
  Excellent: { color: 'var(--color-success)', icon: '🌟' },
  Good: { color: 'var(--color-primary-light)', icon: '✅' },
  Partial: { color: 'var(--color-warning)', icon: '⚡' },
  Poor: { color: 'var(--color-error)', icon: '⚠️' },
  'Not Specified': { color: 'var(--color-text-3)', icon: '—' },
};

export default function AnalysisPage({ data, onNewAnalysis }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDeleteSession = async () => {
    if (!data?.sessionId || deleting) return;
    setDeleting(true);
    try {
      await deleteSession(data.sessionId);
      setDeleted(true);
    } catch {
      // Session may have already expired – that's fine
      setDeleted(true);
    } finally {
      setDeleting(false);
    }
  };

  const expLabel = MATCH_LABELS[data?.experienceMatch] || MATCH_LABELS['Not Specified'];
  const eduLabel = MATCH_LABELS[data?.educationMatch] || MATCH_LABELS['Not Specified'];

  return (
    <div className="analysis-page">
      <Navbar onNewAnalysis={onNewAnalysis} />

      <main className="analysis-main">
        <div className="container">

          {/* Page Header */}
          <div className="analysis-header animate-fade-in">
            <div>
              <h1 className="analysis-page-title font-display">Analysis Results</h1>
              <p className="text-muted text-sm">
                Session: <code className="session-id">{data?.sessionId?.slice(0, 8)}…</code>
                {' · '}Auto-deletes in 24 hours
                {' · '}
                <button
                  className="btn-link"
                  onClick={handleDeleteSession}
                  disabled={deleting || deleted}
                >
                  {deleted ? '✓ Data Deleted' : deleting ? 'Deleting…' : 'Delete Now'}
                </button>
              </p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={onNewAnalysis}
              aria-label="Start a new analysis"
            >
              <span aria-hidden="true">+</span> New Analysis
            </button>
          </div>

          {/* Score Hero */}
          <section className="score-hero card animate-fade-in" aria-label="Overall match score">
            <div className="score-hero-ring">
              <ScoreRing score={data?.overallScore ?? 0} />
            </div>
            <div className="score-hero-summary">
              <div className="match-meta">
                <div className="match-meta-item">
                  <span className="match-meta-label text-muted text-xs">Experience</span>
                  <span className="match-meta-value" style={{ color: expLabel.color }}>
                    {expLabel.icon} {data?.experienceMatch || 'N/A'}
                  </span>
                </div>
                <div className="match-meta-divider" aria-hidden="true" />
                <div className="match-meta-item">
                  <span className="match-meta-label text-muted text-xs">Education</span>
                  <span className="match-meta-value" style={{ color: eduLabel.color }}>
                    {eduLabel.icon} {data?.educationMatch || 'N/A'}
                  </span>
                </div>
              </div>

              <p className="score-summary text-muted">{data?.summary}</p>
            </div>
          </section>

          {/* Tabs */}
          <div className="tabs" role="tablist" aria-label="Analysis sections">
            {['overview', 'improvements', 'chat'].map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tab-panel-${tab}`}
                id={`tab-${tab}`}
                className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'improvements' && '💡 Improvements'}
                {tab === 'chat' && '🤖 AI Coach'}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div
            role="tabpanel"
            id="tab-panel-overview"
            aria-labelledby="tab-overview"
            hidden={activeTab !== 'overview'}
          >
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <SkillsPanel
                  matched={data?.matchedSkills || []}
                  missing={data?.missingSkills || []}
                />

                {/* Strengths */}
                {data?.strengths?.length > 0 && (
                  <div className="insight-section card" aria-label="Strengths">
                    <h2 className="insight-title font-display">
                      <span aria-hidden="true">💪</span> Your Strengths
                    </h2>
                    <ul className="insight-list">
                      {data.strengths.map((s, i) => (
                        <li key={i} className="insight-item insight-item--strength animate-fade-in"
                          style={{ animationDelay: `${i * 80}ms` }}>
                          <span className="insight-dot insight-dot--success" aria-hidden="true" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            role="tabpanel"
            id="tab-panel-improvements"
            aria-labelledby="tab-improvements"
            hidden={activeTab !== 'improvements'}
          >
            {activeTab === 'improvements' && (
              <div className="card animate-fade-in" aria-label="Improvement suggestions">
                <h2 className="insight-title font-display">
                  <span aria-hidden="true">💡</span> Actionable Improvements
                </h2>
                {data?.improvements?.length > 0 ? (
                  <ol className="improvement-list">
                    {data.improvements.map((imp, i) => (
                      <li key={i} className="improvement-item animate-fade-in"
                        style={{ animationDelay: `${i * 80}ms` }}>
                        <span className="improvement-num">{i + 1}</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted">No specific improvements identified.</p>
                )}
                <div className="alert alert-success" style={{ marginTop: '1.5rem' }}>
                  <span className="alert-icon" aria-hidden="true">💬</span>
                  Use the <strong>AI Coach</strong> tab to get detailed, personalised advice on any of these points.
                </div>
              </div>
            )}
          </div>

          <div
            role="tabpanel"
            id="tab-panel-chat"
            aria-labelledby="tab-chat"
            hidden={activeTab !== 'chat'}
          >
            {activeTab === 'chat' && data?.sessionId && (
              <div className="animate-fade-in">
                <ChatAssistant sessionId={data.sessionId} />
              </div>
            )}
            {activeTab === 'chat' && !data?.sessionId && (
              <div className="alert alert-warning">
                <span className="alert-icon">⚠️</span>
                Chat is only available when a database session was created. Please run a new analysis.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
