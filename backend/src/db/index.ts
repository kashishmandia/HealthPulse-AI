import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let supabase: SupabaseClient | null = null;

export function initializeSupabase() {
  if (!config.SUPABASE_URL || !config.SUPABASE_KEY) {
    console.warn('⚠️  Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_KEY in .env');
    console.warn('📝 For now, running in offline mode. Add credentials to .env to enable Supabase.');
    supabase = null;
    return null;
  }

  try {
    supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
    console.log('✓ Supabase client initialized');
    return supabase;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    supabase = null;
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabase;
}

export async function initializeDatabase() {
  try {
    const client = getSupabase();
    
    if (!client) {
      console.warn('⚠️  Supabase not configured - skipping schema initialization');
      console.warn('ℹ️  Database operations will fail until Supabase is configured in .env');
      return;
    }

    console.log('Initializing Supabase schema...');

    // Create tables using SQL via Supabase RPC (you'll need to run these SQL commands manually in Supabase SQL editor)
    // Or use the following approach for automatic initialization:

    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('PATIENT', 'PROVIDER', 'ADMIN')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Patients table
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        date_of_birth DATE,
        medical_history TEXT,
        emergency_contact VARCHAR(255),
        allergies TEXT[]
      );

      -- Providers table
      CREATE TABLE IF NOT EXISTS providers (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(255) UNIQUE NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        hospital VARCHAR(255),
        patients_count INTEGER DEFAULT 0
      );

      -- Provider-Patient relationships
      CREATE TABLE IF NOT EXISTS provider_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider_id, patient_id)
      );

      -- Vital signs table
      CREATE TABLE IF NOT EXISTS vital_signs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        systolic INTEGER NOT NULL,
        diastolic INTEGER NOT NULL,
        heart_rate INTEGER NOT NULL,
        temperature DECIMAL(5, 2) NOT NULL,
        blood_glucose INTEGER,
        oxygen_saturation DECIMAL(5, 2),
        respiratory_rate INTEGER,
        recorded_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_patient_vitals (patient_id, recorded_at DESC)
      );

      -- Symptoms table
      CREATE TABLE IF NOT EXISTS symptoms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        severity VARCHAR(50) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        duration VARCHAR(255),
        affected_areas TEXT[],
        urgency_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
        potential_diagnoses TEXT[],
        notes TEXT,
        recorded_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_patient_symptoms (patient_id, recorded_at DESC)
      );

      -- Mood check-ins table
      CREATE TABLE IF NOT EXISTS mood_checkins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 5),
        stress_level INTEGER NOT NULL CHECK (stress_level >= 0 AND stress_level <= 10),
        sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 0 AND sleep_quality <= 10),
        sleep_hours DECIMAL(5, 2) NOT NULL,
        anxiety_level INTEGER NOT NULL CHECK (anxiety_level >= 0 AND anxiety_level <= 10),
        notes TEXT,
        recorded_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_patient_mood (patient_id, recorded_at DESC)
      );

      -- Health score history table
      CREATE TABLE IF NOT EXISTS health_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        overall_score DECIMAL(5, 2) NOT NULL,
        vital_score DECIMAL(5, 2) NOT NULL,
        symptom_score DECIMAL(5, 2) NOT NULL,
        mental_score DECIMAL(5, 2) NOT NULL,
        trend VARCHAR(50) NOT NULL CHECK (trend IN ('IMPROVING', 'STABLE', 'DECLINING')),
        risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        auto_alerts TEXT[],
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_patient_scores (patient_id, calculated_at DESC)
      );

      -- Correlation analysis table
      CREATE TABLE IF NOT EXISTS health_correlations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        correlation_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        confidence DECIMAL(3, 2) NOT NULL,
        timelapse_hours INTEGER,
        evidence TEXT[],
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_patient_correlations (patient_id, discovered_at DESC)
      );

      -- Anomaly alerts table
      CREATE TABLE IF NOT EXISTS anomaly_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
        anomaly_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        severity VARCHAR(50) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        suggested_action TEXT,
        acknowledged BOOLEAN DEFAULT FALSE,
        acknowledged_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        acknowledged_at TIMESTAMP,
        INDEX idx_provider_alerts (provider_id, acknowledged, created_at DESC),
        INDEX idx_patient_alerts (patient_id, created_at DESC)
      );

      -- Create indexes on email for faster lookups
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_vital_signs ON vital_signs(patient_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_symptoms ON symptoms(patient_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_mood_checkins ON mood_checkins(patient_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_health_scores ON health_scores(patient_id, calculated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_correlations ON health_correlations(patient_id, discovered_at DESC);
      CREATE INDEX IF NOT EXISTS idx_alerts ON anomaly_alerts(provider_id, acknowledged, created_at DESC);
    `;

    console.log('✓ Schema ready (tables should be created via Supabase SQL Editor)');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw - tables might already exist
  }
}

// Query helper functions using Supabase
export async function queryDatabase<T = any>(
  table: string,
  options?: {
    select?: string;
    match?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<T[]> {
  try {
    const client = getSupabase();
    if (!client) {
      console.warn(`queryDatabase called on ${table} but Supabase not configured`);
      return [];
    }
    let query = client.from(table).select(options?.select || '*');

    if (options?.match) {
      Object.entries(options.match).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending !== false,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as T[];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function queryDatabaseSingle<T = any>(
  table: string,
  options?: {
    select?: string;
    match?: Record<string, any>;
  }
): Promise<T | null> {
  try {
    const client = getSupabase();
    if (!client) {
      console.warn(`queryDatabaseSingle called on ${table} but Supabase not configured`);
      return null;
    }
    let query = client.from(table).select(options?.select || '*');

    if (options?.match) {
      Object.entries(options.match).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    query = query.single();

    const { data, error } = await query;

    if (error && error.code === 'PGRST116') {
      // No rows found
      return null;
    }

    if (error) throw error;
    return (data || null) as T | null;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function executeQuery(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data?: any,
  options?: { match?: Record<string, any> }
): Promise<{ rowCount: number; rows: any[] }> {
  try {
    const client = getSupabase();
    if (!client) {
      console.warn(`executeQuery called on ${table} but Supabase not configured`);
      return { rowCount: 0, rows: [] };
    }

    if (operation === 'insert') {
      const { data: result, error } = await client.from(table).insert(data).select();
      if (error) throw error;
      return { rowCount: result?.length || 0, rows: result || [] };
    }

    if (operation === 'update') {
      let query = client.from(table).update(data);

      if (options?.match) {
        Object.entries(options.match).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data: result, error } = await query.select();
      if (error) throw error;
      return { rowCount: result?.length || 0, rows: result || [] };
    }

    if (operation === 'delete') {
      let query = client.from(table).delete();

      if (options?.match) {
        Object.entries(options.match).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { error } = await query;
      if (error) throw error;
      return { rowCount: 1, rows: [] };
    }

    throw new Error('Invalid operation');
  } catch (error) {
    console.error('Execute query error:', error);
    throw error;
  }
}
