# Supabase Setup Guide for HealthPulse AI

## Step 1: Create Supabase Account & Project

1. Go to [Supabase](https://supabase.com) and sign up
2. Create a new project
3. Choose a strong database password
4. Wait for project initialization (usually 2-3 minutes)

## Step 2: Get Your Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Public Key** → `SUPABASE_KEY`

## Step 3: Create Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query and paste the entire SQL schema below
3. Run it

### Complete Database Schema

```sql
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  acknowledged_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_vital_signs ON vital_signs(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptoms ON symptoms(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_checkins ON mood_checkins(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_scores ON health_scores(patient_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_correlations ON health_correlations(patient_id, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts ON anomaly_alerts(provider_id, acknowledged, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_alerts ON anomaly_alerts(patient_id, created_at DESC);
```

## Step 4: Enable Row Level Security (RLS)

Go to **Authentication** → **Policies** and configure RLS if needed. For development, you may keep it disabled.

## Step 5: Configure Backend

1. Copy `.env.example` to `.env` in backend directory
2. Add your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```

## Step 6: Update Services (Important!)

The following services need updates to use new Supabase query signatures:

### Before (PostgreSQL with pg):
```typescript
const user = await queryDatabaseSingle('SELECT * FROM users WHERE email = $1', [email]);
const results = await queryDatabase('SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at DESC', [patientId]);
```

### After (Supabase):
```typescript
const user = await queryDatabaseSingle('users', { 
  match: { email } 
});

const results = await queryDatabase('vital_signs', {
  match: { patient_id: patientId },
  order: { column: 'recorded_at', ascending: false }
});
```

### Insert/Update/Delete:
```typescript
// Insert
await executeQuery('users', 'insert', {
  id, email, password_hash, first_name, last_name, role
});

// Update
await executeQuery('users', 'update', 
  { password_hash: newHash },
  { match: { id: userId } }
);

// Delete
await executeQuery('users', 'delete', null,
  { match: { id: userId } }
);
```

## Step 7: Install Dependencies

```bash
cd backend
npm install
```

## Step 8: Start Backend

```bash
npm run dev
```

## Troubleshooting

### "SUPABASE_URL and SUPABASE_KEY are required"
- Make sure `.env` file has correct values
- Restart the server after updating `.env`

### "Table does not exist" error
- Make sure you ran the SQL schema in Supabase SQL Editor
- Go to Supabase Dashboard → Table Editor to verify tables exist

### CORS errors
- Ensure `FRONTEND_URL` is correctly set in `.env`
- Check Supabase CORS settings if needed

### Query errors
- Check the new query syntax matches the Supabase format
- Verify table and column names match the schema exactly

## Next Steps

1. Test API endpoints locally
2. Deploy backend to Render with Supabase credentials
3. Deploy frontend with correct backend URL
4. Run comprehensive testing

## Documentation

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase API Overview](https://supabase.com/docs/guides/api)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
