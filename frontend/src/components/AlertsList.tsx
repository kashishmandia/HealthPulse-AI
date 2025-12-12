import React from 'react';

interface Alert {
  id: string;
  anomalyType: string;
  description: string;
  severity: string;
  patient?: { id: string; name: string };
  acknowledged: boolean;
  createdAt: string;
}

interface Props {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
}

export default function AlertsList({ alerts, onAcknowledge }: Props) {
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: '#dc2626',
      HIGH: '#f59e0b',
      MEDIUM: '#3b82f6',
      LOW: '#10b981',
    };
    return colors[severity] || '#6b7280';
  };

  const getAnomalyIcon = (type: string) => {
    const icons: Record<string, string> = {
      VITAL_SPIKE: '📊',
      UNUSUAL_SYMPTOM: '🤒',
      MOOD_SHIFT: '🧠',
      SCORE_DROP: '📉',
    };
    return icons[type] || '⚠️';
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="alerts-list">
      {unacknowledgedAlerts.length === 0 ? (
        <div className="empty-state">
          <p>All alerts have been acknowledged ✓</p>
        </div>
      ) : (
        <>
          <div className="alerts-header">
            <h2>Active Alerts ({unacknowledgedAlerts.length})</h2>
          </div>

          {unacknowledgedAlerts.map((alert) => (
            <div
              key={alert.id}
              className="alert-item"
              style={{
                borderLeftColor: getSeverityColor(alert.severity),
              }}
            >
              <div className="alert-header">
                <span className="alert-icon">{getAnomalyIcon(alert.anomalyType)}</span>
                <div className="alert-title">
                  <h3>{alert.anomalyType.replace(/_/g, ' ')}</h3>
                  <p className="patient-name">
                    {alert.patient?.name || 'Patient'} - {alert.severity}
                  </p>
                </div>
              </div>

              <div className="alert-body">
                <p>{alert.description}</p>
              </div>

              <div className="alert-footer">
                <span className="timestamp">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="acknowledge-btn"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
