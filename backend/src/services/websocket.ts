import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { executeQuery, queryDatabaseSingle, queryDatabase } from '../db/index.js';
import { calculateHealthScore } from '../services/aiml.js';

/**
 * WebSocket Real-time Service
 * Handles:
 * - Real-time health score updates
 * - Instant provider alerts for anomalies
 * - Live patient notifications
 */

export function initializeWebSocket(io: SocketIOServer) {
  // Track connected users
  const userSockets: Map<string, Set<string>> = new Map();
  const providerClients: Map<string, Set<string>> = new Map();

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    /**
     * User authenticates and joins their room
     */
    socket.on('authenticate', (data: { userId: string; role: string }) => {
      const { userId, role } = data;

      // Add to user sockets map
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);

      // Provider-specific room
      if (role === 'PROVIDER') {
        if (!providerClients.has(userId)) {
          providerClients.set(userId, new Set());
        }
        providerClients.get(userId)!.add(socket.id);
        socket.join(`provider:${userId}`);
      }

      // Patient-specific room
      if (role === 'PATIENT') {
        socket.join(`patient:${userId}`);
      }

      socket.emit('authenticated', { success: true });
      console.log(`User ${userId} (${role}) authenticated`);
    });

    /**
     * Patient logs new vital signs - triggers health score calculation
     */
    socket.on('vitals-logged', async (data: any) => {
      try {
        const { patientId, systolic, diastolic, heartRate, temperature } = data;

        // Recalculate health score
        const healthScore = await calculateHealthScore(patientId);

        // Broadcast to patient
        io.to(`patient:${patientId}`).emit('health-score-updated', {
          score: healthScore,
          timestamp: new Date(),
        });

        // Check for critical values and alert provider if needed
        if (systolic > 180 || diastolic > 120 || heartRate > 120) {
          await createAndBroadcastAlert(patientId, 'VITAL_SPIKE', systolic, diastolic, heartRate);
        }
      } catch (error) {
        console.error('Error processing vitals:', error);
      }
    });

    /**
     * Patient logs symptom - provider gets notification
     */
    socket.on('symptom-logged', async (data: any) => {
      try {
        const { patientId, description, urgencyScore, severity } = data;

        if (severity === 'HIGH' || severity === 'CRITICAL') {
          await createAndBroadcastAlert(
            patientId,
            'UNUSUAL_SYMPTOM',
            description,
            urgencyScore,
            severity
          );
        }
      } catch (error) {
        console.error('Error processing symptom:', error);
      }
    });

    /**
     * Patient logs mood - check for mental health concerns
     */
    socket.on('mood-logged', async (data: any) => {
      try {
        const { patientId, moodLevel, anxietyLevel, stressLevel } = data;

        if (
          moodLevel <= 2 ||
          anxietyLevel >= 8 ||
          stressLevel >= 8
        ) {
          await createAndBroadcastAlert(
            patientId,
            'MOOD_SHIFT',
            `Low mood: ${moodLevel}, Anxiety: ${anxietyLevel}, Stress: ${stressLevel}`
          );
        }

        // Broadcast mood update to patient's providers
        io.to(`patient:${patientId}`).emit('mood-status', {
          moodLevel,
          anxietyLevel,
          stressLevel,
        });
      } catch (error) {
        console.error('Error processing mood:', error);
      }
    });

    /**
     * Provider requests to monitor patient
     */
    socket.on('start-monitoring', (data: { patientId: string; providerId: string }) => {
      const { patientId, providerId } = data;
      socket.join(`monitor:${providerId}:${patientId}`);
      socket.emit('monitoring-started', { patientId });
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      // Clean up user socket
      for (const [userId, sockets] of userSockets.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }

      // Clean up provider client
      for (const [providerId, sockets] of providerClients.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          providerClients.delete(providerId);
        }
      }

      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  /**
   * Helper function to create and broadcast alerts
   */
  async function createAndBroadcastAlert(
    patientId: string,
    anomalyType: string,
    ...details: any[]
  ) {
    try {
      // Get patient's providers
      const providers = await queryDatabase('provider_patients', {
        match: { patient_id: patientId },
        select: 'provider_id'
      });

      const patientData = await queryDatabaseSingle<any>('users', {
        match: { id: patientId },
        select: 'first_name, last_name'
      });

      for (const provider of providers) {
        const providerId = provider.provider_id;
        const alertId = uuid();

        // Determine severity and description
        let severity = 'MEDIUM';
        let description = '';

        if (anomalyType === 'VITAL_SPIKE') {
          const [systolic, diastolic, heartRate] = details;
          severity = heartRate > 130 ? 'HIGH' : 'MEDIUM';
          description = `Critical vital signs - BP: ${systolic}/${diastolic}, HR: ${heartRate} bpm`;
        } else if (anomalyType === 'UNUSUAL_SYMPTOM') {
          const [description_text, urgencyScore, sev] = details;
          description = description_text;
          severity = sev || 'HIGH';
        } else if (anomalyType === 'MOOD_SHIFT') {
          const [moodData] = details;
          description = `Mental health concern: ${moodData}`;
          severity = 'HIGH';
        }

        // Create alert in database
        await executeQuery('anomaly_alerts', 'insert', {
          id: alertId,
          patient_id: patientId,
          provider_id: providerId,
          anomaly_type: anomalyType,
          description,
          severity,
          suggested_action: `Review patient ${patientData?.first_name} ${patientData?.last_name}`,
        });

        // Broadcast to provider
        io.to(`provider:${providerId}`).emit('new-alert', {
          id: alertId,
          anomalyType,
          description,
          severity,
          patient: {
            id: patientId,
            name: `${patientData?.first_name} ${patientData?.last_name}`,
          },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  return {
    broadcastHealthScore: (patientId: string, score: any) => {
      io.to(`patient:${patientId}`).emit('health-score-updated', score);
    },

    notifyProviders: (providerId: string, alert: any) => {
      io.to(`provider:${providerId}`).emit('provider-alert', alert);
    },

    broadcastToPatient: (patientId: string, event: string, data: any) => {
      io.to(`patient:${patientId}`).emit(event, data);
    },
  };
}

export type WebSocketService = ReturnType<typeof initializeWebSocket>;
