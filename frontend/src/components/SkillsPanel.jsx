import './SkillsPanel.css';

export default function SkillsPanel({ matched = [], missing = [] }) {
  return (
    <div className="skills-panels">
      {/* Matched Skills */}
      <div className="skills-panel card">
        <div className="skills-panel-header">
          <span className="skills-panel-icon skills-panel-icon--success" aria-hidden="true">✓</span>
          <div>
            <h3 className="skills-panel-title">Matched Skills</h3>
            <p className="skills-panel-count text-muted text-sm">
              {matched.length} skill{matched.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <div className="skills-list" role="list" aria-label="Matched skills">
          {matched.length > 0 ? (
            matched.map((skill, i) => (
              <span
                key={i}
                className="badge badge-success skill-badge"
                style={{ animationDelay: `${i * 40}ms` }}
                role="listitem"
              >
                <span aria-hidden="true">✓</span> {skill}
              </span>
            ))
          ) : (
            <p className="text-muted text-sm">No matching skills detected.</p>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      <div className="skills-panel card">
        <div className="skills-panel-header">
          <span className="skills-panel-icon skills-panel-icon--error" aria-hidden="true">!</span>
          <div>
            <h3 className="skills-panel-title">Missing Skills</h3>
            <p className="skills-panel-count text-muted text-sm">
              {missing.length} gap{missing.length !== 1 ? 's' : ''} identified
            </p>
          </div>
        </div>
        <div className="skills-list" role="list" aria-label="Missing skills">
          {missing.length > 0 ? (
            missing.map((skill, i) => (
              <span
                key={i}
                className="badge badge-error skill-badge"
                style={{ animationDelay: `${i * 40}ms` }}
                role="listitem"
              >
                <span aria-hidden="true">+</span> {skill}
              </span>
            ))
          ) : (
            <p className="text-success text-sm">🎉 No critical skill gaps found!</p>
          )}
        </div>
      </div>
    </div>
  );
}
