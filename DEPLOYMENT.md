# HealthPulse AI - Deployment Guide

This guide covers step-by-step deployment of HealthPulse AI to production.

## Architecture Overview

```
User's Browser
    ↓
[Vercel/Netlify Frontend] ←WebSocket/REST→ [Render/Railway Backend]
                                                ↓
                                          [PostgreSQL Database]
```

## Prerequisites

- GitHub account with repository
- Vercel or Netlify account (for frontend)
- Render or Railway account (for backend)
- PostgreSQL database service (managed service)
- Node.js 18+ (for local testing)

## Phase 1: Database Setup

### Option A: Using Railway PostgreSQL

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New"
   - Select "PostgreSQL"
   - Railway creates a new PostgreSQL instance

3. **Get Connection String**
   - Open your project
   - Go to PostgreSQL plugin
   - Copy the connection string from "Connection String"
   - Save it (format: `postgresql://user:password@host:port/database`)

4. **Test Connection** (optional)
   - Use DBeaver or pgAdmin to verify

### Option B: Using Render PostgreSQL

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL
   - Name: `healthpulse-db`
   - Keep defaults
   - Create database

3. **Get Connection String**
   - Copy from "External Database URL"
   - Format: `postgresql://user:password@host:port/database`

## Phase 2: Backend Deployment (Render)

### Step 1: Prepare Repository

```bash
# 1. Initialize git repository (if not already)
cd healthpulse-mono
git init
git add .
git commit -m "Initial commit: HealthPulse AI"

# 2. Create GitHub repository
# Go to https://github.com/new
# Name: healthpulse-ai
# Push local repo

git remote add origin https://github.com/YOUR_USERNAME/healthpulse-ai
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Render

1. **Sign in to Render**
   - Go to https://dashboard.render.com
   - Click "New +"

2. **Create Web Service**
   - Select "Web Service"
   - Connect GitHub repository
   - Select `healthpulse-ai` repo
   - Authorize Render

3. **Configure Service**
   - **Name**: `healthpulse-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   - Click "Environment"
   - Add variables:
     ```
     DATABASE_URL=postgresql://user:password@host/database
     JWT_SECRET=generate-strong-random-key-here
     FRONTEND_URL=https://your-frontend-domain.com
     NODE_ENV=production
     PORT=3001
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render automatically deploys from `main` branch
   - Wait for "Your service is live" message
   - Copy the service URL (e.g., `https://healthpulse-backend.onrender.com`)

### Step 3: Verify Backend Deployment

```bash
# Test health endpoint
curl https://healthpulse-backend.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

## Phase 3: Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. **Go to Vercel**
   - Visit https://vercel.com/new
   - Sign up/Log in with GitHub

2. **Import Project**
   - Select your `healthpulse-ai` repository
   - Click "Import"

3. **Configure Project**
   - **Project Name**: `healthpulse-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`

4. **Build Settings**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**
   - Add variables:
     ```
     VITE_API_URL=https://healthpulse-backend.onrender.com/api
     VITE_SOCKET_URL=https://healthpulse-backend.onrender.com
     ```

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Vercel provides production URL (e.g., `https://healthpulse-frontend.vercel.app`)

### Step 2: Update Backend CORS

1. **Go back to Render Dashboard**
2. **Select backend service**
3. **Edit Environment**
   - Update `FRONTEND_URL`:
     ```
     FRONTEND_URL=https://healthpulse-frontend.vercel.app
     ```
4. **Deploy** (manually trigger)
   - Go to "Manual Deploy" → "Latest Deployment"

## Phase 4: Verification Checklist

### Frontend Checks
- [ ] Frontend loads without errors
- [ ] Can navigate to login page
- [ ] Can navigate to register page

### Backend Checks
- [ ] Health endpoint returns 200
- [ ] Database tables are created (check logs)
- [ ] CORS is properly configured

### Integration Checks
- [ ] Registration works end-to-end
- [ ] Login succeeds and redirects correctly
- [ ] WebSocket connects (check browser DevTools → Network)
- [ ] Logging vital signs works
- [ ] Health score calculation works
- [ ] Real-time alerts appear in provider dashboard

### Test Scenarios

**Patient Registration**:
```
1. Go to frontend URL
2. Click Register
3. Select "Patient"
4. Fill form:
   - Email: test-patient@test.com
   - Password: TestPass123!
   - Name: John Doe
   - DOB: 1990-01-01
5. Submit → Should redirect to dashboard
```

**Patient Features**:
```
1. Log Vitals:
   - BP: 180/110
   - HR: 125
   - Temp: 37.5
   - Submit → Health score updates
   - Provider sees alert immediately

2. Add Symptom:
   - Description: "severe chest pain"
   - Submit → AI analyzes, shows urgency score

3. Mood Check-in:
   - Select moods/stress levels
   - Submit → Updates health score
```

**Provider Access**:
```
1. Register as provider:
   - License: ABC123
   - Specialization: Cardiology
   - Hospital: City Hospital
   
2. View Alerts:
   - Should see patient alerts in real-time
   - Click "Acknowledge"
   
3. Assign Patient:
   - View patient timeline
   - Check health score
```

## Phase 5: Monitoring & Maintenance

### Daily Checks

```bash
# Check backend health
curl https://healthpulse-backend.onrender.com/health

# Check frontend loads
# Open https://healthpulse-frontend.vercel.app in browser
```

### Log Viewing

**Render Backend Logs**:
1. Go to Render Dashboard
2. Select service
3. Click "Logs" tab
4. Monitor for errors

**Vercel Frontend Logs**:
1. Go to Vercel Dashboard
2. Select project
3. Click "Deployments"
4. Select latest → View logs

### Database Maintenance

**Connect to Production Database**:
```bash
# Using psql
psql "postgresql://user:password@host:port/database"

# Check database size
SELECT pg_size_pretty(pg_database_size('healthpulse'));

# View recent records
SELECT * FROM health_scores ORDER BY calculated_at DESC LIMIT 10;
SELECT * FROM anomaly_alerts ORDER BY created_at DESC LIMIT 10;
```

## Phase 6: Post-Deployment Optimization

### Performance Tuning

1. **Database Indexes** (already in schema)
   - Verify indexes exist
   - Monitor slow queries

2. **Frontend Optimization**
   - Vercel CDN (automatic)
   - Enable gzip compression (automatic)
   - Monitor Core Web Vitals in Vercel dashboard

3. **Backend Optimization**
   - Render uses HTTP/2 (automatic)
   - Enable connection pooling (in DATABASE_URL)

### Security Hardening

```
☑ JWT_SECRET is strong (>32 characters)
☑ FRONTEND_URL is exact match (no wildcards)
☑ DATABASE_URL credentials are secure
☑ HTTPS enforced (automatic on Render/Vercel)
☑ Rate limiting active (default 100/15min)
☑ CORS properly configured
☑ Helmet security headers enabled
```

### Backup Strategy

1. **Database Backups**
   - Enable automated backups (Railway/Render default)
   - Test restore procedure monthly

2. **Code Backups**
   - GitHub is your backup
   - Tag releases: `git tag -a v1.0.0 -m "Production release"`

## Phase 7: Scaling Considerations

### When to Scale

- **Frontend**: When Vercel analytics show >100k requests/day
- **Backend**: When response times exceed 500ms
- **Database**: When queries take >1s

### Scaling Options

**Frontend**:
- Vercel handles auto-scaling automatically
- Monitor analytics dashboard

**Backend**:
- Render: Upgrade to higher tier
- Or use Railway: Scale with reserve capacity

**Database**:
- Railway: Upgrade CPU/RAM
- Render: Same process
- Consider read replicas for heavy analytics

## Troubleshooting

### Issue: CORS Errors

```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Fix**:
1. Check `FRONTEND_URL` in backend env vars
2. Ensure exact URL match (no trailing slash)
3. Redeploy backend
4. Clear browser cache

### Issue: WebSocket Connection Failed

```
Error: WebSocket connection to ... failed
```

**Fix**:
1. Verify `VITE_SOCKET_URL` in frontend env
2. Check backend WebSocket logs
3. Ensure backend is running
4. Try: `curl https://backend-url/health`

### Issue: Database Connection Fails

```
Error: Can't connect to database
```

**Fix**:
1. Test connection string locally:
   ```bash
   psql "postgresql://user:password@host:port/database"
   ```
2. Verify credentials
3. Check DATABASE_URL format
4. Verify IP whitelist (if applicable)

### Issue: Login/Registration Fails

```
Error: Network error or validation failed
```

**Fix**:
1. Check browser Network tab (DevTools)
2. Verify API_URL is correct
3. Check backend logs
4. Test with curl:
   ```bash
   curl -X POST https://backend-url/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test"}'
   ```

## Rollback Procedure

If deployment fails:

**Render Backend**:
1. Dashboard → Service → Deployments
2. Select previous successful deployment
3. Click "Re-deploy"

**Vercel Frontend**:
1. Dashboard → Deployments
2. Select previous deployment
3. Click "Redeploy"

## Estimated Costs (Monthly)

- **Vercel Frontend**: $0-20 (free tier generous)
- **Render Backend**: $12-40 (starter tier)
- **PostgreSQL Database**: $15-50 (depends on usage)
- **Total**: $27-110/month

## Success Criteria

✅ Frontend loads without errors  
✅ User can register and login  
✅ Health data logging works  
✅ Real-time alerts appear instantly  
✅ Provider dashboard receives alerts  
✅ WebSocket connection stable  
✅ Database persists data correctly  
✅ Response times <500ms  
✅ No CORS errors  
✅ All features functional  

---

**Deployment completed!** 🎉

Your HealthPulse AI is now live and ready for users. Monitor the dashboards regularly and follow the maintenance schedule.
