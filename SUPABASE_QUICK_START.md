# HealthPulse AI - Supabase Setup Complete ✅

Your HealthPulse AI backend has been successfully converted to use **Supabase** as the database!

## What Changed

### Updated Files:
- ✅ `backend/package.json` - Replaced `pg` with `@supabase/supabase-js`
- ✅ `backend/src/config.ts` - Added `SUPABASE_URL` and `SUPABASE_KEY` config
- ✅ `backend/src/db/index.ts` - Converted to Supabase client
- ✅ `backend/.env.example` - Updated with Supabase credentials
- ✅ `backend/src/services/auth.ts` - Updated all queries to Supabase syntax
- ✅ `backend/src/routes/health.ts` - Updated all queries to Supabase syntax
- ✅ `backend/src/routes/provider.ts` - Updated all queries to Supabase syntax
- ✅ `backend/src/services/aiml.ts` - Updated all queries to Supabase syntax
- ✅ `backend/src/index.ts` - Added Supabase initialization

## Quick Start (5 Minutes)

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Choose any name (e.g., "HealthPulse-AI")
5. Create a strong database password
6. Select region (closest to you)
7. Click "Create new project"
8. Wait 2-3 minutes for initialization

### Step 2: Get Credentials
1. In Supabase Dashboard, click **Settings** (bottom left)
2. Go to **API** tab
3. Copy these:
   - **Project URL** → Your `SUPABASE_URL`
   - **anon public** → Your `SUPABASE_KEY`

### Step 3: Create Database Schema
1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy-paste the entire SQL schema from `SUPABASE_SETUP.md`
4. Click **"Run"** button
5. Wait for success message
6. Done! ✅

### Step 4: Setup Backend

```bash
# Navigate to backend
cd backend

# Copy env file
copy .env.example .env

# Edit .env with your Supabase credentials
# (Use your editor or notepad to add the values)
```

In `.env`, replace these:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
✓ Supabase client initialized
✓ Schema ready
🚀 HealthPulse AI Backend Starting...
✓ Server running on http://localhost:3001
```

## Testing

### Test 1: Register Patient
```bash
curl -X POST http://localhost:3001/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT"
  },
  "token": "jwt-token-here"
}
```

### Test 2: Log Vitals
```bash
curl -X POST http://localhost:3001/api/health/vitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "systolic": 120,
    "diastolic": 80,
    "heartRate": 72,
    "temperature": 37.0
  }'
```

## What's Different from PostgreSQL

### Old (PostgreSQL):
```typescript
const user = await queryDatabase(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

### New (Supabase):
```typescript
const user = await queryDatabase('users', {
  match: { email }
});
```

**All files have been updated!** No need to change them manually.

## API Query Syntax

### SELECT (Multiple Rows)
```typescript
const vitals = await queryDatabase('vital_signs', {
  match: { patient_id: userId },
  order: { column: 'recorded_at', ascending: false },
  limit: 10
});
```

### SELECT (Single Row)
```typescript
const user = await queryDatabaseSingle('users', {
  match: { email }
});
```

### INSERT
```typescript
await executeQuery('users', 'insert', {
  id: userId,
  email,
  password_hash: hash,
  first_name: 'John',
  last_name: 'Doe',
  role: 'PATIENT'
});
```

### UPDATE
```typescript
await executeQuery('users', 'update',
  { email: newEmail },
  { match: { id: userId } }
);
```

### DELETE
```typescript
await executeQuery('users', 'delete', null,
  { match: { id: userId } }
);
```

## Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_KEY are required"
**Fix:** Check your `.env` file has correct values and restart server

### Error: "Table does not exist"
**Fix:** Make sure you ran the SQL schema in Supabase SQL Editor

### Error: "No database connection"
**Fix:** 
1. Check `.env` has correct SUPABASE_URL and SUPABASE_KEY
2. Verify Supabase project is active (not paused)
3. Check internet connection

### Slow queries
**Fix:** Supabase indexes are set up in the schema - they work automatically

## Next Steps

1. ✅ Local testing (done)
2. 📦 Deploy backend to Render
   - Follow DEPLOYMENT.md
   - Add env vars to Render
3. 🎨 Deploy frontend to Vercel
4. 📹 Record demo video
5. 🎓 Submit to assessment

## Important Notes

- **Supabase is free** for development (up to 500MB)
- **No Docker needed** for Supabase
- **Real-time enabled** by default (WebSocket works!)
- **Row Level Security** available (advanced feature)
- **Backups** automatic (daily)

## Support

If you encounter issues:
1. Check SUPABASE_SETUP.md for detailed schema
2. Review SUPABASE_MIGRATION_GUIDE.md for query syntax
3. Check Supabase logs in Dashboard
4. Verify all table names match exactly (case-sensitive)

## Files Reference

```
healthpulse-mono/
├── backend/
│   ├── src/
│   │   ├── config.ts          ← Supabase config
│   │   ├── db/index.ts        ← Supabase client
│   │   ├── services/
│   │   │   ├── auth.ts        ← Updated queries
│   │   │   └── aiml.ts        ← Updated queries
│   │   └── routes/
│   │       ├── health.ts      ← Updated queries
│   │       └── provider.ts    ← Updated queries
│   ├── .env.example           ← Add Supabase creds here
│   └── package.json           ← Has @supabase/supabase-js
├── SUPABASE_SETUP.md          ← Full SQL schema
├── SUPABASE_MIGRATION_GUIDE.md ← Query syntax guide
└── DEPLOYMENT.md              ← How to deploy
```

---

**You're all set!** Your HealthPulse AI backend is now ready with Supabase. 🚀
