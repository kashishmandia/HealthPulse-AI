import React from 'react';
import type { HealthScore } from '../../shared/types';

interface Props {
  score: HealthScore | null;
}

export default function HealthScoreCard({ score }: Props) {
  if (!score) return <div>No health data available</div>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#dc2626';
  };

  const getRiskLabel = (risk: string) => {
    const labels: Record<string, string> = {
      LOW: '✓ Low Risk',
      MEDIUM: '⚠ Medium Risk',
      HIGH: '⚠️ High Risk',
      CRITICAL: '🚨 Critical',
    };
    return labels[risk] || risk;
  };

  return (
    <div className="card health-score-card">
      <h2>Unified Health Score</h2>

      <div className="score-display">
        <div className="score-circle">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getScoreColor(score.overallScore)}
              strokeWidth="8"
              strokeDasharray={`${(score.overallScore / 100) * 282.7} 282.7`}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
            />
          </svg>
          <div className="score-value">{score.overallScore}</div>
        </div>
      </div>

      <div className="score-details">
        <div className="detail-row">
          <span>Vital Score</span>
          <strong>{score.vitalScore}</strong>
        </div>
        <div className="detail-row">
          <span>Symptom Score</span>
          <strong>{score.symptomScore}</strong>
        </div>
        <div className="detail-row">
          <span>Mental Health Score</span>
          <strong>{score.mentalScore}</strong>
        </div>
        <div className="detail-row">
          <span>Risk Level</span>
          <strong>{getRiskLabel(score.riskLevel)}</strong>
        </div>
        <div className="detail-row">
          <span>Trend</span>
          <strong>{score.trend}</strong>
        </div>
      </div>

      {score.autoAlerts && score.autoAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>⚠️ Active Alerts</h3>
          <ul>
            {score.autoAlerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
