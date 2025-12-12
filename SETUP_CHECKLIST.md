# ✅ SUPABASE SETUP CHECKLIST

Use this checklist to complete your Supabase setup. Check off each item as you complete it.

---

## Phase 1: Create Supabase Project (5 minutes)

- [ ] Go to https://supabase.com
- [ ] Click "Sign up"
- [ ] Create account (email + password)
- [ ] Click "New Project"
- [ ] Enter project name: `HealthPulse-AI`
- [ ] Create strong database password (save it!)
- [ ] Select region (closest to you)
- [ ] Click "Create new project"
- [ ] ⏳ Wait 2-3 minutes for initialization
- [ ] See dashboard with "PostgreSQL" message

---

## Phase 2: Get Credentials (2 minutes)

- [ ] In Supabase Dashboard, click **Settings** (bottom left)
- [ ] Go to **API** tab
- [ ] Find **Project URL** section
- [ ] Copy the **Project URL** value (starts with `https://`)
- [ ] This is your `SUPABASE_URL`
- [ ] Find **API Keys** section
- [ ] Copy **anon public** key (starts with `eyJhbGc...`)
- [ ] This is your `SUPABASE_KEY`
- [ ] ✅ Keep these safe! You'll need them next.

---

## Phase 3: Create Database Schema (3 minutes)

- [ ] In Supabase Dashboard, go to **SQL Editor** (left sidebar)
- [ ] Click **"New Query"** button
- [ ] Open file: `SUPABASE_SETUP.md`
- [ ] Copy **entire SQL schema** (the big `CREATE TABLE` block)
- [ ] Paste into Supabase SQL Editor
- [ ] Click **"Run"** button (▶️ icon)
- [ ] Wait for success message (green checkmark)
- [ ] Go to **Table Editor** and verify tables exist:
  - [ ] users
  - [ ] patients
  - [ ] providers
  - [ ] vital_signs
  - [ ] symptoms
  - [ ] mood_checkins
  - [ ] health_scores
  - [ ] health_correlations
  - [ ] anomaly_alerts
- [ ] ✅ All tables created successfully

---

## Phase 4: Setup Backend (3 minutes)

- [ ] Open PowerShell/Terminal
- [ ] Navigate to project: `cd e:\HealthCare\healthpulse-mono\backend`
- [ ] File `.env` should already exist (or create it)
- [ ] Open `.env` in your editor
- [ ] Add these lines:
  ```
  SUPABASE_URL=YOUR_PROJECT_URL_HERE
  SUPABASE_KEY=YOUR_ANON_KEY_HERE
  ```
- [ ] Replace `YOUR_PROJECT_URL_HERE` with your Project URL
- [ ] Replace `YOUR_ANON_KEY_HERE` with your anon key
- [ ] Save `.env` file
- [ ] ✅ Credentials configured

---

## Phase 5: Install Dependencies (2 minutes)

- [ ] In terminal, run: `npm install --legacy-peer-deps`
- [ ] ⏳ Wait for installation to complete
- [ ] Should see: `added XXX packages`
- [ ] ✅ Dependencies installed

---

## Phase 6: Test Backend Locally (5 minutes)

- [ ] In terminal, run: `npm run dev`
- [ ] Wait for server to start
- [ ] Should see:
  ```
  ✓ Supabase client initialized
  ✓ Schema ready
  🚀 HealthPulse AI Backend Starting...
  ✓ Server running on http://localhost:3001
  ```
- [ ] ✅ Server running successfully

---

## Phase 7: Test API Endpoints (5 minutes)

### Test 1: Register Patient
- [ ] Open new PowerShell/Terminal window
- [ ] Run this command:
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
    dateOfBirth = "1990-01-01"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register/patient" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```
- [ ] Should get response with user ID and JWT token
- [ ] Copy the JWT token for next test
- [ ] ✅ Patient registration works

### Test 2: Log Vitals (requires JWT from Test 1)
- [ ] Replace `YOUR_JWT_TOKEN` with actual token
- [ ] Run:
```powershell
$body = @{
    systolic = 120
    diastolic = 80
    heartRate = 72
    temperature = 37.0
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/health/vitals" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer YOUR_JWT_TOKEN"
    } `
    -Body $body
```
- [ ] Should see vitals logged successfully
- [ ] ✅ Vitals endpoint works

### Test 3: Get Health Score
- [ ] Run:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health/vitals" `
    -Method GET `
    -Headers @{
        "Authorization"="Bearer YOUR_JWT_TOKEN"
    }
```
- [ ] Should see list of vitals
- [ ] ✅ GET vitals endpoint works

---

## Phase 8: Verify Supabase Data (2 minutes)

- [ ] Go back to Supabase Dashboard
- [ ] Click **Table Editor** (left sidebar)
- [ ] Click **users** table
- [ ] Should see your test user (test@example.com)
- [ ] Click **vital_signs** table
- [ ] Should see your logged vitals
- [ ] ✅ Data persisted to Supabase

---

## Phase 9: Deploy Backend to Render (10 minutes)

- [ ] Go to https://render.com
- [ ] Sign up / Login
- [ ] Click **"New +"** → **"Web Service"**
- [ ] Select "Deploy from GitHub"
- [ ] Connect your GitHub account
- [ ] Select your repository
- [ ] Select branch: `main` or `master`
- [ ] Set name: `healthpulse-ai-backend`
- [ ] Environment: `Node`
- [ ] Build command: `npm install --legacy-peer-deps && npm run build`
- [ ] Start command: `npm start`
- [ ] Add environment variables:
  - [ ] `SUPABASE_URL` → Your Supabase URL
  - [ ] `SUPABASE_KEY` → Your Supabase Key
  - [ ] `JWT_SECRET` → A strong random string
  - [ ] `FRONTEND_URL` → Your frontend URL (after deployment)
  - [ ] `NODE_ENV` → `production`
- [ ] Click **"Create Web Service"**
- [ ] ⏳ Wait for deployment (2-5 minutes)
- [ ] Get public URL from Render dashboard
- [ ] ✅ Backend deployed

---

## Phase 10: Deploy Frontend to Vercel (5 minutes)

- [ ] Go to https://vercel.com
- [ ] Sign up / Login
- [ ] Click **"New Project"**
- [ ] Select GitHub repo
- [ ] Select `frontend` root directory
- [ ] Add environment variable:
  - [ ] `VITE_API_URL` → Your Render backend URL
  - [ ] `VITE_SOCKET_URL` → Your Render backend URL
- [ ] Click **"Deploy"**
- [ ] ⏳ Wait for deployment (1-2 minutes)
- [ ] Get public URL from Vercel
- [ ] ✅ Frontend deployed

---

## Phase 11: Update Deployment Links

- [ ] Go back to Render
- [ ] Add `FRONTEND_URL` env var with your Vercel URL
- [ ] Redeploy backend
- [ ] ✅ CORS now allows your frontend

---

## Phase 12: Test Live Application (10 minutes)

- [ ] Open your Vercel frontend URL in browser
- [ ] Register a new account
- [ ] Login
- [ ] Log some vitals
- [ ] Check health score
- [ ] Verify data appears in Supabase dashboard
- [ ] ✅ Live application works!

---

## Phase 13: Record Demo Video (30-45 minutes)

- [ ] Follow VIDEO_SCRIPT.md
- [ ] Record deployment walkthrough (5-7 min)
- [ ] Record feature demo (5-8 min)
- [ ] Record architecture explanation (2-3 min)
- [ ] Edit video smoothly
- [ ] Upload to YouTube (private/unlisted)
- [ ] Get shareable link
- [ ] ✅ Video ready

---

## Phase 14: Final Submission (5 minutes)

- [ ] Push code to GitHub
- [ ] Prepare submission info:
  - [ ] Frontend URL: https://...vercel.app
  - [ ] Backend URL: https://...onrender.com
  - [ ] GitHub repo: https://github.com/.../
  - [ ] Video link: https://youtube.com/watch?v=...
- [ ] Submit all required materials
- [ ] ✅ Submission complete!

---

## Troubleshooting

### Issue: "SUPABASE_URL and SUPABASE_KEY are required"
- [ ] Check `.env` file exists in backend folder
- [ ] Verify values are set (no spaces)
- [ ] Restart dev server

### Issue: "Table does not exist"
- [ ] Go to Supabase SQL Editor
- [ ] Run the SQL schema again
- [ ] Verify in Table Editor that tables exist

### Issue: "Connection refused" on localhost
- [ ] Check server is running: `npm run dev`
- [ ] Check port 3001 is available
- [ ] Check no other process using port 3001

### Issue: "CORS error"
- [ ] Check `FRONTEND_URL` in backend `.env`
- [ ] Should match your frontend URL exactly
- [ ] Restart backend server

---

## Quick Reference

### Important URLs
- Supabase: https://supabase.com
- Render: https://render.com
- Vercel: https://vercel.com

### Important Files
- Backend config: `backend/.env`
- Setup guide: `SUPABASE_QUICK_START.md`
- SQL schema: `SUPABASE_SETUP.md`
- Video script: `VIDEO_SCRIPT.md`

### Important Commands
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install --legacy-peer-deps

# Run locally
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Success Indicators ✅

After completing all phases, you should have:

- ✅ Supabase project created
- ✅ Database schema running
- ✅ Backend running locally
- ✅ API endpoints tested
- ✅ Backend deployed to Render
- ✅ Frontend deployed to Vercel
- ✅ Live application accessible
- ✅ Demo video recorded
- ✅ Code on GitHub
- ✅ Ready for assessment

---

## Total Time Estimate

| Phase | Time |
|-------|------|
| 1-7: Local setup | 25 min |
| 8: Verify data | 2 min |
| 9-10: Deploy | 15 min |
| 11: Update config | 2 min |
| 12: Test live | 10 min |
| 13: Record video | 45 min |
| 14: Submit | 5 min |
| **TOTAL** | **~1.5 hours** |

---

## ✨ You're All Set!

Follow this checklist step-by-step and you'll have a live, production-ready HealthPulse AI application running on Supabase!

**Questions?** Refer to the documentation files:
- SUPABASE_QUICK_START.md
- SUPABASE_SETUP.md
- SUPABASE_MIGRATION_GUIDE.md
- STATUS_REPORT.md

**Ready to start?** Begin with Phase 1 above! 🚀
