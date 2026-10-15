import './ScoreRing.css';

const getScoreColor = (score) => {
  if (score >= 75) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.35)', label: 'Excellent' };
  if (score >= 55) return { stroke: '#6366f1', glow: 'rgba(99,102,241,0.35)', label: 'Good' };
  if (score >= 35) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.35)', label: 'Fair' };
  return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.35)', label: 'Low' };
};

export default function ScoreRing({ score }) {
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { stroke, glow, label } = getScoreColor(score);

  return (
    <div className="score-ring-wrapper animate-fade-in-scale">
      <div className="score-ring" style={{ '--glow': glow }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <defs>
            <filter id="scoreGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter="url(#scoreGlow)"
            className="score-ring-progress"
            style={{ '--circumference': circumference, '--offset': offset }}
          />
        </svg>

        <div className="score-ring-label">
          <span
            className="score-number font-display"
            style={{ color: stroke }}
          >
            {score}
          </span>
          <span className="score-percent text-muted">%</span>
          <span className="score-label" style={{ color: stroke }}>{label}</span>
        </div>
      </div>

      <p className="score-caption text-muted text-sm text-center">
        Overall Match Score
      </p>
    </div>
  );
}
