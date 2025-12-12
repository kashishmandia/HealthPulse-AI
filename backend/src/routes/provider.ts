import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware.js';
import { queryDatabase, queryDatabaseSingle, executeQuery } from '../db/index.js';

const router = Router();

/**
 * Get all alerts for provider
 */
router.get('/alerts', authMiddleware, requireRole('PROVIDER'), async (req: Request, res: Response) => {
  try {
    const acknowledged = req.query.acknowledged === 'true';

    const alerts = await queryDatabase<any>('anomaly_alerts', {
      match: { provider_id: req.userId, acknowledged },
      order: { column: 'created_at', ascending: false }
    });

    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Acknowledge alert
 */
router.patch('/alerts/:alertId/acknowledge', authMiddleware, requireRole('PROVIDER'), async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    const updated = await executeQuery('anomaly_alerts', 'update',
      {
        acknowledged: true,
        acknowledged_by: req.userId,
        acknowledged_at: new Date()
      },
      { match: { id: alertId, provider_id: req.userId } }
    );

    if (updated.rowCount === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json(updated.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get assigned patients
 */
router.get('/patients', authMiddleware, requireRole('PROVIDER'), async (req: Request, res: Response) => {
  try {
    // Get patient IDs first
    const assignments = await queryDatabase<any>('provider_patients', {
      match: { provider_id: req.userId }
    });

    // Then get patient details
    const patients = assignments.length > 0 
      ? await queryDatabase<any>('users', {
          order: { column: 'first_name', ascending: true }
        }).then(users => 
          users.filter(u => assignments.some(a => a.patient_id === u.id))
        )
      : [];

    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get patient health timeline
 */
router.get('/patients/:patientId/timeline', authMiddleware, requireRole('PROVIDER'), async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // Get all recent health events
    const vitals = (await queryDatabase<any>('vital_signs', {
      match: { patient_id: patientId },
      order: { column: 'recorded_at', ascending: false },
      limit: 50
    })).map(v => ({
      id: v.id,
      timestamp: v.recorded_at,
      type: 'VITAL',
      title: 'Vital Signs Log'
    }));

    const symptoms = (await queryDatabase<any>('symptoms', {
      match: { patient_id: patientId },
      order: { column: 'recorded_at', ascending: false },
      limit: 50
    })).map(s => ({
      id: s.id,
      timestamp: s.recorded_at,
      type: 'SYMPTOM',
      title: s.description
    }));

    const moods = (await queryDatabase<any>('mood_checkins', {
      match: { patient_id: patientId },
      order: { column: 'recorded_at', ascending: false },
      limit: 50
    })).map(m => ({
      id: m.id,
      timestamp: m.recorded_at,
      type: 'MOOD',
      title: 'Mood Check-in'
    }));

    const alerts = (await queryDatabase<any>('anomaly_alerts', {
      match: { patient_id: patientId },
      order: { column: 'created_at', ascending: false },
      limit: 50
    })).map(a => ({
      id: a.id,
      timestamp: a.created_at,
      type: 'ALERT',
      title: a.description
    }));

    const timeline = [...vitals, ...symptoms, ...moods, ...alerts]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    res.json(timeline);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get patient current health score
 */
router.get('/patients/:patientId/health-score', authMiddleware, requireRole('PROVIDER'), async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const scores = await queryDatabase<any>('health_scores', {
      match: { patient_id: patientId },
      order: { column: 'calculated_at', ascending: false },
      limit: 1
    });

    const score = scores.length > 0 ? scores[0] : null;

    const correlations = await queryDatabase<any>('health_correlations', {
      match: { patient_id: patientId },
      order: { column: 'discovered_at', ascending: false },
      limit: 10
    });

    if (!score) {
      res.json({ score: null, correlations: [] });
      return;
    }

    res.json({ score, correlations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Assign patient to provider
 */
router.post('/patients/:patientId/assign', authMiddleware, requireRole('PROVIDER'), async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // Check if patient exists
    const patient = await queryDatabaseSingle('patients', {
      match: { id: patientId }
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Create relationship
    await executeQuery('provider_patients', 'insert', {
      provider_id: req.userId,
      patient_id: patientId
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
