import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';

interface Props {
  patientId: string;
}

export default function PatientTimeline({ patientId }: Props) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const [timelineData, scoreData] = await Promise.all([
        apiClient.getPatientTimeline(patientId),
        apiClient.getPatientHealthScore(patientId),
      ]);

      setTimeline(timelineData);
      setHealthScore(scoreData.score);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      VITAL: '📊',
      SYMPTOM: '🤒',
      MOOD: '🧠',
      ALERT: '⚠️',
    };
    return icons[type] || '📋';
  };

  return (
    <div className="card">
      <h2>Patient Health Timeline</h2>

      {healthScore && (
        <div className="patient-score-summary">
          <div className="score-badge" style={{
            backgroundColor: healthScore.overallScore >= 80 ? '#10b981' : 
                           healthScore.overallScore >= 60 ? '#f59e0b' : '#ef4444'
          }}>
            {healthScore.overallScore}
          </div>
          <div className="score-info">
            <span className="risk">Risk: {healthScore.risk_level}</span>
            <span className="trend">Trend: {healthScore.trend}</span>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading patient data...</p>
      ) : timeline.length === 0 ? (
        <p className="empty-state">No timeline events yet</p>
      ) : (
        <div className="timeline">
          {timeline.map((event, idx) => (
            <div key={event.id || idx} className="timeline-item">
              <div className="timeline-icon">{getEventIcon(event.type)}</div>
              <div className="timeline-content">
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <span className="time">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
