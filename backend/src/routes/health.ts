import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { authMiddleware, requireRole } from '../middleware.js';
import { queryDatabase, queryDatabaseSingle, executeQuery } from '../db/index.js';
import { triageSymptom, calculateHealthScore, detectHealthCorrelations } from '../services/aiml.js';
import { chatWithAI } from '../services/aiml.js'; // Add chatWithAI to existing imports

const router = Router();

/**
 * AI Chat Endpoint
 */
router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    // 1. Fetch patient context for the AI
    // (We quickly grab the latest data so the AI knows who it's talking to)
    const patientData = await executeQuery('users', 'select', { id: req.userId });
    
    // Simple query to get latest vitals/symptoms (simplified for brevity)
    // In a real app, you might query these tables specifically
    const context = {
        firstName: patientData[0]?.first_name || "Patient",
        latestVitals: "Checked recently", 
        latestSymptoms: "None active"
    };

    // 2. Get AI Response
    const aiResponse = await chatWithAI(message, context);

    res.json({ response: aiResponse });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Log vital signs
 */
router.post('/vitals', authMiddleware, requireRole('PATIENT'), async (req: Request, res: Response) => {
  try {
    const {
      systolic,
      diastolic,
      heartRate,
      temperature,
      bloodGlucose,
      oxygenSaturation,
      respiratoryRate,
    } = req.body;

    if (!systolic || !diastolic || !heartRate || !temperature) {
      res.status(400).json({ error: 'Missing required vital signs' });
      return;
    }

    const id = uuid();
    const recordedAt = new Date();

    await executeQuery('vital_signs', 'insert', {
      id,
      patient_id: req.userId,
      systolic,
      diastolic,
      heart_rate: heartRate,
      temperature,
      blood_glucose: bloodGlucose || null,
      oxygen_saturation: oxygenSaturation || null,
      respiratory_rate: respiratoryRate || null,
      recorded_at: recordedAt,
    });

    res.status(201).json({
      id,
      patientId: req.userId,
      systolic,
      diastolic,
      heartRate,
      temperature,
      bloodGlucose,
      oxygenSaturation,
      respiratoryRate,
      recordedAt,
      createdAt: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get patient vital history
 */
router.get('/vitals', authMiddleware, async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const vitals = await queryDatabase<any>('vital_signs', {
      match: { patient_id: req.userId },
      order: { column: 'recorded_at', ascending: false },
    });

    res.json(vitals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Log symptom
 */
router.post('/symptoms', authMiddleware, requireRole('PATIENT'), async (req: Request, res: Response) => {
  try {
    const { description, duration, affectedAreas, notes } = req.body;

    if (!description) {
      res.status(400).json({ error: 'Symptom description required' });
      return;
    }

    // AI triage
    const triageResult = await triageSymptom(description);

    const id = uuid();
    const recordedAt = new Date();

    await executeQuery('symptoms', 'insert', {
      id,
      patient_id: req.userId,
      description,
      severity: triageResult.severity,
      duration: duration || null,
      affected_areas: affectedAreas || null,
      urgency_score: triageResult.urgencyScore,
      potential_diagnoses: triageResult.potentialDiagnoses,
      notes: notes || null,
      recorded_at: recordedAt,
    });

    res.status(201).json({
      id,
      patientId: req.userId,
      description,
      severity: triageResult.severity,
      duration,
      affectedAreas,
      urgencyScore: triageResult.urgencyScore,
      potentialDiagnoses: triageResult.potentialDiagnoses,
      notes,
      recordedAt,
      createdAt: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get patient symptoms
 */
router.get('/symptoms', authMiddleware, async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const symptoms = await queryDatabase<any>('symptoms', {
      match: { patient_id: req.userId },
      order: { column: 'recorded_at', ascending: false },
    });

    res.json(symptoms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Log mood check-in
 */
router.post('/mood', authMiddleware, requireRole('PATIENT'), async (req: Request, res: Response) => {
  try {
    const { moodLevel, stressLevel, sleepQuality, sleepHours, anxietyLevel, notes } = req.body;

    if (
      moodLevel === undefined ||
      stressLevel === undefined ||
      sleepQuality === undefined ||
      sleepHours === undefined ||
      anxietyLevel === undefined
    ) {
      res.status(400).json({ error: 'Missing required mood fields' });
      return;
    }

    const id = uuid();
    const recordedAt = new Date();

    await executeQuery('mood_checkins', 'insert', {
      id,
      patient_id: req.userId,
      mood_level: moodLevel,
      stress_level: stressLevel,
      sleep_quality: sleepQuality,
      sleep_hours: sleepHours,
      anxiety_level: anxietyLevel,
      notes: notes || null,
      recorded_at: recordedAt,
    });

    res.status(201).json({
      id,
      patientId: req.userId,
      moodLevel,
      stressLevel,
      sleepQuality,
      sleepHours,
      anxietyLevel,
      notes,
      recordedAt,
      createdAt: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get mood history
 */
router.get('/mood', authMiddleware, async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const moods = await queryDatabase<any>('mood_checkins', {
      match: { patient_id: req.userId },
      order: { column: 'recorded_at', ascending: false },
    });

    res.json(moods);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get unified health score
 */
router.get('/health-score', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Calculate current health score
    const score = await calculateHealthScore(req.userId!);

    // Save to database
    await executeQuery('health_scores', 'insert', {
      id: score.id,
      patient_id: score.patientId,
      overall_score: score.overallScore,
      vital_score: score.vitalScore,
      symptom_score: score.symptomScore,
      mental_score: score.mentalScore,
      trend: score.trend,
      risk_level: score.riskLevel,
      auto_alerts: score.autoAlerts,
    });

    // Get correlations
    const correlations = await detectHealthCorrelations(req.userId!);

    // Get historical scores for trend
    const historicalScores = await queryDatabase<any>('health_scores', {
      match: { patient_id: req.userId },
      order: { column: 'calculated_at', ascending: false },
      limit: 30,
    });

    res.json({
      score,
      correlations,
      trend: {
        dates: historicalScores
          .map((s: any) => new Date(s.calculated_at).toLocaleDateString())
          .reverse(),
        scores: historicalScores.map((s: any) => s.overall_score).reverse(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
