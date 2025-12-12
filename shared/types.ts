/**
 * Shared TypeScript types across HealthPulse AI
 * This ensures type safety between frontend and backend
 */

export enum UserRole {
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum MoodLevel {
  VERY_POOR = 1,
  POOR = 2,
  NEUTRAL = 3,
  GOOD = 4,
  EXCELLENT = 5,
}

/**
 * User Types
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient extends User {
  dateOfBirth: Date;
  medicalHistory?: string;
  emergencyContact?: string;
  allergies?: string[];
}

export interface Provider extends User {
  licenseNumber: string;
  specialization: string;
  hospital?: string;
  patientsCount: number;
}

/**
 * Health Data Types
 */
export interface VitalSign {
  id: string;
  patientId: string;
  systolic: number; // BP upper
  diastolic: number; // BP lower
  heartRate: number; // bpm
  temperature: number; // Celsius
  bloodGlucose?: number; // mg/dL
  oxygenSaturation?: number; // SpO2 %
  respiratoryRate?: number; // breaths/min
  recordedAt: Date;
  createdAt: Date;
}

export interface Symptom {
  id: string;
  patientId: string;
  description: string;
  severity: SeverityLevel;
  duration: string; // e.g., "2 days", "1 week"
  affectedAreas?: string[];
  urgencyScore: number; // 0-100, calculated by AI
  potentialDiagnoses?: string[]; // AI-generated
  notes?: string;
  recordedAt: Date;
  createdAt: Date;
}

export interface MoodCheckIn {
  id: string;
  patientId: string;
  moodLevel: MoodLevel; // 1-5
  stressLevel: number; // 0-10
  sleepQuality: number; // 0-10
  sleepHours: number;
  anxietyLevel: number; // 0-10
  notes?: string;
  recordedAt: Date;
  createdAt: Date;
}

/**
 * Correlation Analysis (Innovation Feature)
 */
export interface HealthCorrelation {
  id: string;
  patientId: string;
  correlationType: 'MOOD_TO_VITALS' | 'SLEEP_TO_SYMPTOMS' | 'STRESS_TO_BP' | 'FATIGUE_PATTERN';
  description: string;
  confidence: number; // 0-1, how strong is correlation
  timelapseHours?: number; // lag between events
  evidence: string[]; // specific data points
  discoveredAt: Date;
}

/**
 * Health Score Calculation
 */
export interface HealthScore {
  id: string;
  patientId: string;
  overallScore: number; // 0-100
  vitalScore: number; // 0-100
  symptomScore: number; // 0-100
  mentalScore: number; // 0-100
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING'; // 7-day trend
  riskLevel: SeverityLevel;
  autoAlerts: string[]; // Alerts that triggered auto-escalation
  calculatedAt: Date;
}

/**
 * Anomaly Detection
 */
export interface AnomalyAlert {
  id: string;
  patientId: string;
  providerId: string;
  anomalyType: 'VITAL_SPIKE' | 'UNUSUAL_SYMPTOM' | 'MOOD_SHIFT' | 'SCORE_DROP';
  description: string;
  severity: SeverityLevel;
  suggestedAction: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: Date;
  acknowledgedAt?: Date;
}

/**
 * API Request/Response Types
 */
export interface AuthResponse {
  token: string;
  user: Partial<User>;
}

export interface HealthScoreResponse {
  score: HealthScore;
  correlations: HealthCorrelation[];
  recentAnomalies: AnomalyAlert[];
  trend: {
    dates: string[];
    scores: number[];
  };
}

export interface PatientTimelineEvent {
  id: string;
  timestamp: Date;
  type: 'VITAL' | 'SYMPTOM' | 'MOOD' | 'ALERT';
  title: string;
  description: string;
  severity?: SeverityLevel;
  data: Record<string, any>;
}

/**
 * WebSocket Events
 */
export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
  timestamp: Date;
}

export interface ProviderAlert {
  alert: AnomalyAlert;
  patient: {
    id: string;
    name: string;
  };
  currentHealthScore: number;
}

/**
 * Error Types
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
