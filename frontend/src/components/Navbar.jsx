import './Navbar.css';

export default function Navbar({ onNewAnalysis }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        <button className="navbar-brand" onClick={onNewAnalysis} aria-label="Go to home">
          <span className="navbar-logo-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
              <path d="M8 20L14 8L20 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 16.5H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1"/>
                  <stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="navbar-brand-text">Resume<span className="text-primary">AI</span></span>
        </button>

        <div className="navbar-actions">
          <span className="navbar-badge">
            <span className="navbar-badge-dot" aria-hidden="true" />
            AI Powered
          </span>
        </div>
      </div>
    </nav>
  );
}
