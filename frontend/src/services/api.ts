import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async registerPatient(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // Changed to string to match common usage, but Date object also works if serialized
  }) {
    // Ensure date is string if passed as Date object
    const payload = {
        ...data,
        dateOfBirth: (data.dateOfBirth as unknown) instanceof Date ? (data.dateOfBirth as Date).toISOString() : data.dateOfBirth
    };
    const res = await this.client.post('/auth/register/patient', payload);
    return res.data;
  }

  async registerProvider(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    specialization: string;
    hospital?: string;
  }) {
    const res = await this.client.post('/auth/register/provider', data);
    return res.data;
  }

  async login(email: string, password: string) {
    const res = await this.client.post('/auth/login', { email, password });
    return res.data;
  }

  async getCurrentUser() {
    const res = await this.client.get('/auth/me');
    return res.data;
  }

  // Health endpoints
  async logVitals(data: {
    systolic: number;
    diastolic: number;
    heartRate: number;
    temperature: number;
    bloodGlucose?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  }) {
    const res = await this.client.post('/health/vitals', data);
    return res.data;
  }

  async getVitals(days?: number) {
    const res = await this.client.get('/health/vitals', { params: { days } });
    return res.data;
  }

  async logSymptom(data: {
    description: string;
    duration?: string;
    affectedAreas?: string[];
    notes?: string;
  }) {
    const res = await this.client.post('/health/symptoms', data);
    return res.data;
  }

  async getSymptoms(days?: number) {
    const res = await this.client.get('/health/symptoms', { params: { days } });
    return res.data;
  }

  async logMood(data: {
    moodLevel: number;
    stressLevel: number;
    sleepQuality: number;
    sleepHours: number;
    anxietyLevel: number;
    notes?: string;
  }) {
    const res = await this.client.post('/health/mood', data);
    return res.data;
  }

  async getMood(days?: number) {
    const res = await this.client.get('/health/mood', { params: { days } });
    return res.data;
  }

  async getHealthScore() {
    const res = await this.client.get('/health/health-score');
    return res.data;
  }

  // AI Chat Endpoint (NEW)
  async chatWithAI(message: string) {
    const res = await this.client.post('/health/chat', { message });
    return res.data;
  }

  // Provider endpoints
  async getAlerts(acknowledged?: boolean) {
    const res = await this.client.get('/provider/alerts', {
      params: { acknowledged },
    });
    return res.data;
  }

  async acknowledgeAlert(alertId: string) {
    const res = await this.client.patch(`/provider/alerts/${alertId}/acknowledge`);
    return res.data;
  }

  async getAssignedPatients() {
    const res = await this.client.get('/provider/patients');
    return res.data;
  }

  async getPatientTimeline(patientId: string) {
    const res = await this.client.get(`/provider/patients/${patientId}/timeline`);
    return res.data;
  }

  async getPatientHealthScore(patientId: string) {
    const res = await this.client.get(`/provider/patients/${patientId}/health-score`);
    return res.data;
  }

  async assignPatient(patientId: string) {
    const res = await this.client.post(`/provider/patients/${patientId}/assign`);
    return res.data;
  }
}

export const apiClient = new ApiClient();
