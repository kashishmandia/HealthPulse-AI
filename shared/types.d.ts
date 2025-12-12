/**
 * Shared TypeScript types across HealthPulse AI
 * This ensures type safety between frontend and backend
 */
export declare enum UserRole {
    PATIENT = "PATIENT",
    PROVIDER = "PROVIDER",
    ADMIN = "ADMIN"
}
export declare enum SeverityLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum MoodLevel {
    VERY_POOR = 1,
    POOR = 2,
    NEUTRAL = 3,
    GOOD = 4,
    EXCELLENT = 5
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
    systolic: number;
    diastolic: number;
    heartRate: number;
    temperature: number;
    bloodGlucose?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    recordedAt: Date;
    createdAt: Date;
}
export interface Symptom {
    id: string;
    patientId: string;
    description: string;
    severity: SeverityLevel;
    duration: string;
    affectedAreas?: string[];
    urgencyScore: number;
    potentialDiagnoses?: string[];
    notes?: string;
    recordedAt: Date;
    createdAt: Date;
}
export interface MoodCheckIn {
    id: string;
    patientId: string;
    moodLevel: MoodLevel;
    stressLevel: number;
    sleepQuality: number;
    sleepHours: number;
    anxietyLevel: number;
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
    confidence: number;
    timelapseHours?: number;
    evidence: string[];
    discoveredAt: Date;
}
/**
 * Health Score Calculation
 */
export interface HealthScore {
    id: string;
    patientId: string;
    overallScore: number;
    vitalScore: number;
    symptomScore: number;
    mentalScore: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    riskLevel: SeverityLevel;
    autoAlerts: string[];
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
//# sourceMappingURL=types.d.ts.map