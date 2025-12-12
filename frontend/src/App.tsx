import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import './App.css';

export default function App() {
  const { user, token } = useAuthStore();

  const isAuthenticated = !!token && !!user;

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : user?.role === 'PATIENT' ? (
          <>
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <>
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="*" element={<Navigate to="/provider" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
