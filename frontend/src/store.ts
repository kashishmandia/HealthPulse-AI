import { create } from 'zustand';
import type { User } from '../../shared/types';

interface AuthState {
  user: Partial<User> | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

interface HealthState {
  healthScore: any | null;
  vitals: any[];
  symptoms: any[];
  moods: any[];
  correlations: any[];
  isLoading: boolean;

  // Actions
  setHealthScore: (score: any) => void;
  setVitals: (vitals: any[]) => void;
  setSymptoms: (symptoms: any[]) => void;
  setMoods: (moods: any[]) => void;
  setCorrelations: (correlations: any[]) => void;
  setLoading: (loading: boolean) => void;
  addVital: (vital: any) => void;
  addSymptom: (symptom: any) => void;
  addMood: (mood: any) => void;
  reset: () => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  healthScore: null,
  vitals: [],
  symptoms: [],
  moods: [],
  correlations: [],
  isLoading: false,

  setHealthScore: (score) => set({ healthScore: score }),
  setVitals: (vitals) => set({ vitals }),
  setSymptoms: (symptoms) => set({ symptoms }),
  setMoods: (moods) => set({ moods }),
  setCorrelations: (correlations) => set({ correlations }),
  setLoading: (loading) => set({ isLoading: loading }),

  addVital: (vital) =>
    set((state) => ({
      vitals: [vital, ...state.vitals],
    })),

  addSymptom: (symptom) =>
    set((state) => ({
      symptoms: [symptom, ...state.symptoms],
    })),

  addMood: (mood) =>
    set((state) => ({
      moods: [mood, ...state.moods],
    })),

  reset: () =>
    set({
      healthScore: null,
      vitals: [],
      symptoms: [],
      moods: [],
      correlations: [],
    }),
}));

interface ProviderState {
  patients: any[];
  alerts: any[];
  selectedPatientId: string | null;
  isLoading: boolean;

  // Actions
  setPatients: (patients: any[]) => void;
  setAlerts: (alerts: any[]) => void;
  setSelectedPatient: (patientId: string | null) => void;
  setLoading: (loading: boolean) => void;
  acknowledgeAlert: (alertId: string) => void;
  reset: () => void;
}

export const useProviderStore = create<ProviderState>((set) => ({
  patients: [],
  alerts: [],
  selectedPatientId: null,
  isLoading: false,

  setPatients: (patients) => set({ patients }),
  setAlerts: (alerts) => set({ alerts }),
  setSelectedPatient: (selectedPatientId) => set({ selectedPatientId }),
  setLoading: (loading) => set({ isLoading: loading }),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    })),

  reset: () => set({ patients: [], alerts: [], selectedPatientId: null }),
}));
