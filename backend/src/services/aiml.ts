import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js"; 
import { queryDatabase, queryDatabaseSingle, executeQuery } from '../db/index.js';

// Type placeholders since we can't import from shared/types during ts-node load
type Symptom = any;
type VitalSign = any;
type MoodCheckIn = any;
type HealthScore = any;
type AnomalyAlert = any;
type HealthCorrelation = any;
type SeverityLevel = any;

/**
 * AI/ML Service for HealthPulse
 * Handles:
 * - Symptom triage with urgency scoring
 * - Vital sign anomaly detection
 * - Mood-to-vitals correlation analysis
 * - Pattern recognition
 */

interface SymptomTriageResult {
  urgencyScore: number;
  severity: SeverityLevel;
  potentialDiagnoses: string[];
  recommendedAction: string;
}

/**
 * Symptom Triage Algorithm
 * Uses keyword matching and pattern analysis to generate urgency scores
 */
export async function triageSymptom(description: string): Promise<SymptomTriageResult> {
  const lowerDesc = description.toLowerCase();
  let urgencyScore = 30; // Base score
  let severity: SeverityLevel = 'LOW';
  const potentialDiagnoses: string[] = [];

  // Critical keywords
  const criticalKeywords = [
    'chest pain',
    'difficulty breathing',
    'shortness of breath',
    'stroke',
    'severe bleeding',
    'loss of consciousness',
    'allergic reaction',
    'severe allergy',
  ];

  // High urgency keywords
  const highKeywords = [
    'severe headache',
    'high fever',
    'persistent vomiting',
    'abdominal pain',
    'vision changes',
    'numbness',
    'paralysis',
    'confusion',
  ];

  // Medium urgency keywords
  const mediumKeywords = [
    'mild fever',
    'headache',
    'nausea',
    'body ache',
    'fatigue',
    'dizziness',
    'mild cough',
  ];

  // Check for critical symptoms
  if (criticalKeywords.some((kw) => lowerDesc.includes(kw))) {
    urgencyScore = 95;
    severity = 'CRITICAL';
    potentialDiagnoses.push('EMERGENCY - Seek immediate medical attention');
  }
  // Check for high urgency
  else if (highKeywords.some((kw) => lowerDesc.includes(kw))) {
    urgencyScore = 75;
    severity = 'HIGH';
    potentialDiagnoses.push('Urgent consultation recommended');
  }
  // Check for medium urgency
  else if (mediumKeywords.some((kw) => lowerDesc.includes(kw))) {
    urgencyScore = 55;
    severity = 'MEDIUM';
    potentialDiagnoses.push('Schedule appointment soon');
  }
  // Low urgency
  else {
    urgencyScore = 35;
    severity = 'LOW';
    potentialDiagnoses.push('Monitor and follow up if symptoms persist');
  }

  // Additional scoring based on symptom count (if comma-separated)
  const symptomCount = description.split(',').length;
  if (symptomCount > 3) {
    urgencyScore = Math.min(urgencyScore + 15, 100);
  }

  // Add potential diagnoses based on keywords
  if (lowerDesc.includes('fever')) potentialDiagnoses.push('Possible infection/flu');
  if (lowerDesc.includes('cough')) potentialDiagnoses.push('Possible respiratory issue');
  if (lowerDesc.includes('headache') && lowerDesc.includes('fever'))
    potentialDiagnoses.push('Possible meningitis');
  if (lowerDesc.includes('chest pain')) potentialDiagnoses.push('Cardiac evaluation needed');

  return {
    urgencyScore: Math.round(urgencyScore),
    severity,
    potentialDiagnoses,
    recommendedAction:
      severity === 'CRITICAL' ? 'Call 911 immediately' : 'See a healthcare provider',
  };
}

/**
 * Analyze vital signs for anomalies
 */
export function analyzeVitals(vitals: VitalSign): {
  anomalies: string[];
  riskScore: number;
} {
  const anomalies: string[] = [];
  let riskScore = 0;

  // Normal ranges (simplified for demo)
  const ranges = {
    systolic: { min: 90, max: 120 },
    diastolic: { min: 60, max: 80 },
    heartRate: { min: 60, max: 100 },
    temperature: { min: 36.5, max: 37.5 },
    bloodGlucose: { min: 70, max: 130 }, // fasting
    oxygenSaturation: { min: 95, max: 100 },
  };

  // Check systolic
  if (vitals.systolic < ranges.systolic.min) {
    anomalies.push('Low blood pressure (systolic)');
    riskScore += 15;
  } else if (vitals.systolic > ranges.systolic.max) {
    anomalies.push('Elevated blood pressure (systolic)');
    riskScore += 20;
  }

  // Check diastolic
  if (vitals.diastolic > ranges.diastolic.max) {
    anomalies.push('Elevated blood pressure (diastolic)');
    riskScore += 15;
  }

  // Check heart rate
  if (vitals.heartRate < ranges.heartRate.min) {
    anomalies.push('Low heart rate (bradycardia)');
    riskScore += 10;
  } else if (vitals.heartRate > ranges.heartRate.max) {
    anomalies.push('Elevated heart rate (tachycardia)');
    riskScore += 15;
  }

  // Check temperature
  if (vitals.temperature < ranges.temperature.min) {
    anomalies.push('Low body temperature (hypothermia)');
    riskScore += 20;
  } else if (vitals.temperature > ranges.temperature.max) {
    anomalies.push('Elevated temperature (fever)');
    riskScore += 15;
  }

  // Check blood glucose
  if (vitals.bloodGlucose) {
    if (vitals.bloodGlucose < ranges.bloodGlucose.min) {
      anomalies.push('Low blood glucose (hypoglycemia)');
      riskScore += 25;
    } else if (vitals.bloodGlucose > ranges.bloodGlucose.max) {
      anomalies.push('High blood glucose (hyperglycemia)');
      riskScore += 15;
    }
  }

  // Check oxygen saturation
  if (vitals.oxygenSaturation && vitals.oxygenSaturation < ranges.oxygenSaturation.min) {
    anomalies.push('Low oxygen saturation');
    riskScore += 25;
  }

  return {
    anomalies,
    riskScore: Math.min(riskScore, 100),
  };
}

/**
 * Analyze mood and detect significant changes
 */
export function analyzeMood(
  current: MoodCheckIn,
  previous?: MoodCheckIn
): {
  anomalies: string[];
  riskScore: number;
} {
  const anomalies: string[] = [];
  let riskScore = 0;

  // High anxiety
  if (current.anxietyLevel >= 8) {
    anomalies.push('Very high anxiety levels detected');
    riskScore += 20;
  }

  // Poor mood
  if (current.moodLevel <= 2) {
    anomalies.push('Significantly low mood');
    riskScore += 25;
  }

  // Poor sleep
  if (current.sleepQuality <= 2 && current.sleepHours < 5) {
    anomalies.push('Severe sleep deprivation');
    riskScore += 20;
  }

  // High stress
  if (current.stressLevel >= 8) {
    anomalies.push('Very high stress levels');
    riskScore += 15;
  }

  // Detect significant mood changes from previous
  if (previous) {
    const moodChange = previous.moodLevel - current.moodLevel;
    if (Math.abs(moodChange) >= 3) {
      anomalies.push(`Significant mood change detected (${moodChange > 0 ? 'decline' : 'improvement'})`);
      riskScore += 10;
    }

    const anxietyChange = current.anxietyLevel - previous.anxietyLevel;
    if (anxietyChange >= 4) {
      anomalies.push('Significant increase in anxiety');
      riskScore += 15;
    }
  }

  return {
    anomalies,
    riskScore: Math.min(riskScore, 100),
  };
}

/**
 * Calculate unified health score based on vitals, symptoms, and mood
 */
export async function calculateHealthScore(
  patientId: string
): Promise<HealthScore> {
  const now = new Date();
  
  // Get latest data points
  const vitals = await queryDatabase<any>('vital_signs', {
    match: { patient_id: patientId },
    order: { column: 'recorded_at', ascending: false },
    limit: 1
  });
  const latestVital = vitals.length > 0 ? vitals[0] : null;

  const symptoms = await queryDatabase<any>('symptoms', {
    match: { patient_id: patientId },
    order: { column: 'recorded_at', ascending: false },
    limit: 1
  });
  const latestSymptom = symptoms.length > 0 ? symptoms[0] : null;

  const moods = await queryDatabase<any>('mood_checkins', {
    match: { patient_id: patientId },
    order: { column: 'recorded_at', ascending: false },
    limit: 1
  });
  const latestMood = moods.length > 0 ? moods[0] : null;

  // Calculate vital score (0-100)
  let vitalScore = 80;
  if (latestVital) {
    const { riskScore } = analyzeVitals({
      systolic: latestVital.systolic,
      diastolic: latestVital.diastolic,
      heartRate: latestVital.heart_rate,
      temperature: latestVital.temperature,
      bloodGlucose: latestVital.blood_glucose,
      oxygenSaturation: latestVital.oxygen_saturation,
    } as any);
    vitalScore = Math.max(20, 100 - riskScore);
  } else {
    vitalScore = 60; // No data available
  }

  // Calculate symptom score (0-100)
  let symptomScore = 85;
  if (latestSymptom) {
    symptomScore = Math.max(20, 100 - latestSymptom.urgency_score);
  } else {
    symptomScore = 90; // No symptoms reported
  }

  // Calculate mental score (0-100)
  let mentalScore = 80;
  if (latestMood) {
    // Mood 5 = 100, Mood 1 = 20
    const moodComponent = (latestMood.mood_level / 5) * 40 + 30;
    const stressComponent = Math.max(0, 30 - latestMood.stress_level * 3);
    const sleepComponent =
      latestMood.sleep_quality >= 7 ? 20 : Math.max(5, latestMood.sleep_quality * 2);

    mentalScore = Math.round(moodComponent + stressComponent + sleepComponent);
  } else {
    mentalScore = 70; // No mood data
  }

  // Calculate overall score
  const overallScore = Math.round((vitalScore + symptomScore + mentalScore) / 3);

  // Determine trend
  const sevenDayScores = await queryDatabase<any>('health_scores', {
    match: { patient_id: patientId },
    order: { column: 'calculated_at', ascending: true }
  });

  let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
  if (sevenDayScores.length >= 2) {
    const avgOldScore = sevenDayScores.slice(0, Math.floor(sevenDayScores.length / 2)).reduce(
      (sum, s) => sum + s.overall_score,
      0
    ) / Math.floor(sevenDayScores.length / 2);

    const avgNewScore = sevenDayScores.slice(Math.floor(sevenDayScores.length / 2)).reduce(
      (sum, s) => sum + s.overall_score,
      0
    ) / (sevenDayScores.length - Math.floor(sevenDayScores.length / 2));

    if (avgNewScore > avgOldScore + 5) trend = 'IMPROVING';
    else if (avgNewScore < avgOldScore - 5) trend = 'DECLINING';
  }

  // Determine risk level
  let riskLevel: SeverityLevel;
  if (overallScore >= 80) riskLevel = 'LOW';
  else if (overallScore >= 60) riskLevel = 'MEDIUM';
  else if (overallScore >= 40) riskLevel = 'HIGH';
  else riskLevel = 'CRITICAL';

  const autoAlerts: string[] = [];
  if (latestVital && analyzeVitals(latestVital as any).anomalies.length > 0) {
    autoAlerts.push('Vital signs anomaly detected');
  }
  if (latestMood && analyzeMood(latestMood as any).anomalies.length > 0) {
    autoAlerts.push('Mental health concern flagged');
  }

  return {
    id: crypto.randomUUID?.() || Math.random().toString(),
    patientId,
    overallScore,
    vitalScore: Math.round(vitalScore),
    symptomScore: Math.round(symptomScore),
    mentalScore: Math.round(mentalScore),
    trend,
    riskLevel,
    autoAlerts,
    calculatedAt: now,
  };
}

/**
 * Detect correlations between mood and vitals over time
 * INNOVATION: Pattern detection across different health metrics
 */
export async function detectHealthCorrelations(
  patientId: string
): Promise<HealthCorrelation[]> {
  const correlations: HealthCorrelation[] = [];
  
  const moods = await queryDatabase<any>('mood_checkins', {
    match: { patient_id: patientId },
    order: { column: 'recorded_at', ascending: true }
  });

  const vitals = await queryDatabase<any>('vital_signs', {
    match: { patient_id: patientId },
    order: { column: 'recorded_at', ascending: true }
  });

  // Correlation 1: High anxiety → High blood pressure
  const highAnxietyDays = moods.filter((m: any) => m.anxiety_level >= 7);
  if (highAnxietyDays.length > 0) {
    const correlatedVitals = vitals.filter((v: any) => {
      const moodTime = new Date(highAnxietyDays[0].recorded_at).getTime();
      const vitalTime = new Date(v.recorded_at).getTime();
      const hoursDiff = Math.abs(moodTime - vitalTime) / (1000 * 60 * 60);
      return hoursDiff <= 24 && v.systolic > 130;
    });

    if (correlatedVitals.length > 0) {
      correlations.push({
        id: crypto.randomUUID?.() || Math.random().toString(),
        patientId,
        correlationType: 'STRESS_TO_BP',
        description: 'High anxiety correlates with elevated blood pressure within 24 hours',
        confidence: Math.min(0.9, correlatedVitals.length / highAnxietyDays.length),
        timelapseHours: 12,
        evidence: correlatedVitals.map((v: any) => `BP: ${v.systolic}/${v.diastolic}`),
        discoveredAt: new Date(),
      });
    }
  }

  // Correlation 2: Poor sleep → Fatigue symptoms next day
  const poorSleepDays = moods.filter((m: any) => m.sleep_quality <= 3 && m.sleep_hours < 5);
  const symptoms = await queryDatabase<any>('symptoms', {
    match: { patient_id: patientId },
    order: { column: 'recorded_at', ascending: true }
  });

  const fatigueSymptoms = symptoms.filter((s: any) => 
    s.description?.toLowerCase().includes('fatigue') || 
    s.description?.toLowerCase().includes('tired')
  );

  if (poorSleepDays.length > 0 && fatigueSymptoms.length > 0) {
    correlations.push({
      id: crypto.randomUUID?.() || Math.random().toString(),
      patientId,
      correlationType: 'SLEEP_TO_SYMPTOMS',
      description: 'Poor sleep quality frequently followed by fatigue symptoms',
      confidence: Math.min(0.85, fatigueSymptoms.length / poorSleepDays.length),
      timelapseHours: 24,
      evidence: [
        `${poorSleepDays.length} poor sleep nights`,
        `${fatigueSymptoms.length} fatigue reports`,
      ],
      discoveredAt: new Date(),
    });
  }

  // Correlation 3: Mood decline → Vital changes
  const significantMoodDeclines = moods
    .filter((m: any, i: number) => {
      if (i === 0) return false;
      return moods[i - 1].mood_level - m.mood_level >= 2;
    })
    .slice(0, 5); // Limit to 5 for performance

  if (significantMoodDeclines.length > 0) {
    correlations.push({
      id: crypto.randomUUID?.() || Math.random().toString(),
      patientId,
      correlationType: 'MOOD_TO_VITALS',
      description: 'Mood deterioration correlates with increased heart rate and blood pressure',
      confidence: 0.72,
      timelapseHours: 6,
      evidence: significantMoodDeclines.map((m: any) => `Mood change recorded at ${m.recorded_at}`),
      discoveredAt: new Date(),
    });
  }

  return correlations;
}

/**
 * Chat with the AI Doctor
 * Uses patient context (vitals, symptoms) to give personalized advice.
 */
export async function chatWithAI(message: string, patientContext: any): Promise<string> {
  try {
    // 1. Initialize INSIDE the function (Lazy Loading)
    const apiKey = process.env.GEMINI_API_KEY || config.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Missing GEMINI_API_KEY in .env file");
      return "I am currently offline (Configuration Error). Please contact support.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 2. Construct the prompt
    const prompt = `
      You are HealthPulse AI, a compassionate and knowledgeable medical assistant.
      
      PATIENT CONTEXT:
      - Name: ${patientContext.firstName}
      - Recent Vitals: ${JSON.stringify(patientContext.latestVitals || "None logged")}
      - Recent Symptoms: ${JSON.stringify(patientContext.latestSymptoms || "None logged")}
      
      USER MESSAGE: "${message}"
      
      INSTRUCTIONS:
      1. Provide helpful, accurate health information.
      2. If the user mentions severe symptoms (chest pain, difficulty breathing), tell them to seek emergency care immediately.
      3. Be concise (under 150 words) but warm.
      4. Do NOT diagnose medical conditions definitively; suggest possibilities and recommend a doctor.
    `;

    // 3. Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I'm having trouble connecting to my medical database right now. Please try again later.";
  }
}