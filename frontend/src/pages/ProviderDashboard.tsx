import { useState, useEffect } from 'react';
import { useAuthStore, useProviderStore } from '../store';
import { apiClient } from '../services/api';
import { wsService } from '../services/websocket';
import AlertsList from '../components/AlertsList';
import PatientsList from '../components/PatientsList';
import PatientTimeline from '../components/PatientTimeline';
import '../styles/dashboard.css';

export default function ProviderDashboard() {
  const { user, logout } = useAuthStore();
  const { patients, alerts, selectedPatientId, setPatients, setAlerts, setSelectedPatient } =
    useProviderStore();
  const [activeTab, setActiveTab] = useState<'alerts' | 'patients'>('alerts');
  const [loading, setLoading] = useState(true);
  const [newAlertsCount, setNewAlertsCount] = useState(0);

  useEffect(() => {
    // Initialize WebSocket
    wsService.connect(user?.id || '', 'PROVIDER');

    // Listen for new alerts
    wsService.on('new-alert', (alert) => {
      setAlerts([alert, ...alerts]);
      setNewAlertsCount((prev) => prev + 1);
    });

    // Load initial data
    loadProviderData();

    return () => {
      wsService.disconnect();
    };
  }, []);

  const loadProviderData = async () => {
    setLoading(true);
    try {
      const [patientsData, alertsData] = await Promise.all([
        apiClient.getAssignedPatients(),
        apiClient.getAlerts(false),
      ]);

      setPatients(patientsData);
      setAlerts(alertsData);
      setNewAlertsCount(alertsData.length);
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await apiClient.acknowledgeAlert(alertId);
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
      setNewAlertsCount(Math.max(0, newAlertsCount - 1));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  return (
    <div className="dashboard provider-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>HealthPulse AI - Provider Dashboard</h1>
          <p>Welcome, Dr. {user?.lastName}! Monitor your patients' health.</p>
        </div>
        <div className="header-actions">
          {newAlertsCount > 0 && (
            <div className="alert-badge" title={`${newAlertsCount} new alerts`}>
              {newAlertsCount}
            </div>
          )}
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts
            {newAlertsCount > 0 && <span className="badge">{newAlertsCount}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            My Patients
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading provider data...</div>
        ) : (
          <>
            {activeTab === 'alerts' && (
              <div className="tab-content">
                <AlertsList alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
              </div>
            )}

            {activeTab === 'patients' && (
              <div className="tab-content provider-content">
                <div className="provider-grid">
                  <div className="patients-section">
                    <PatientsList patients={patients} onSelectPatient={setSelectedPatient} />
                  </div>

                  {selectedPatientId && (
                    <div className="patient-details-section">
                      <PatientTimeline patientId={selectedPatientId} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
