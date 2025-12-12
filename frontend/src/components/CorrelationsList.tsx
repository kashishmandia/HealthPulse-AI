import React from 'react';

interface Correlation {
  id: string;
  correlationType: string;
  description: string;
  confidence: number;
  timelapseHours?: number;
  evidence: string[];
}

interface Props {
  correlations: Correlation[];
}

export default function CorrelationsList({ correlations }: Props) {
  if (correlations.length === 0) {
    return <p className="empty-state">No correlations detected yet</p>;
  }

  const getCorrelationIcon = (type: string) => {
    const icons: Record<string, string> = {
      MOOD_TO_VITALS: '🧠→❤️',
      SLEEP_TO_SYMPTOMS: '😴→🤒',
      STRESS_TO_BP: '😰→📈',
      FATIGUE_PATTERN: '⚡→😴',
    };
    return icons[type] || '📊';
  };

  return (
    <div className="correlations-list">
      {correlations.map((corr) => (
        <div key={corr.id} className="correlation-item">
          <div className="correlation-header">
            <span className="correlation-icon">{getCorrelationIcon(corr.correlationType)}</span>
            <h3>{corr.description}</h3>
          </div>

          <div className="correlation-details">
            <div className="detail">
              <span className="label">Confidence:</span>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${corr.confidence * 100}%` }}
                />
              </div>
              <span>{Math.round(corr.confidence * 100)}%</span>
            </div>

            {corr.timelapseHours && (
              <div className="detail">
                <span className="label">Time Lag:</span>
                <span>{corr.timelapseHours} hours</span>
              </div>
            )}
          </div>

          {corr.evidence.length > 0 && (
            <div className="evidence">
              <span className="label">Evidence:</span>
              <ul>
                {corr.evidence.slice(0, 3).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
