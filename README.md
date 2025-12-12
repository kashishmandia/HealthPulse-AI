# HealthPulse AI - Unified Health Intelligence Platform

A sophisticated full-stack healthcare application that revolutionizes how patients and providers interact with health data through AI-powered insights, real-time monitoring, and pattern detection.

## 🎯 Project Vision

**Problem Statement**: Most health apps are siloed—vitals tracked separately from symptoms, mental health data isolated from physical indicators. This fragmentation prevents holistic health understanding.

**Solution**: HealthPulse AI uniquely correlates physical symptoms, vital signs, and mental wellness into one unified AI-powered health score. It detects patterns like:
- "Your anxiety spikes correlate with elevated blood pressure"
- "Fatigue symptoms appear 2 days after poor sleep/mood trends"
- Real-time provider alerts for critical anomalies

## ✨ Innovation & Key Differentiators

### 1. **Unified Health Intelligence**
- Multi-dimensional health scoring combining vitals, symptoms, and mental health
- Proprietary correlation engine detecting health patterns across modalities
- Real-time health score recalculation based on new data

### 2. **AI-Powered Diagnostics**
- Symptom triage algorithm with urgency scoring (0-100)
- Potential diagnosis suggestions based on symptom analysis
- Sentiment-aware mood tracking with mental health risk detection

### 3. **Anomaly Detection & Alerts**
- Automatic vital sign anomaly detection (BP spikes, heart rate irregularities, etc.)
- WebSocket-based real-time alerts to providers
- Auto-escalation for critical health events

### 4. **Pattern Recognition**
- Correlation analysis identifying mood-to-vitals relationships
- Sleep-to-symptom pattern detection
- Stress-to-blood-pressure trending

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│   • Patient Dashboard (Vitals, Symptoms, Mood, Score)      │
│   • Provider Dashboard (Alerts, Patients, Timeline)          │
│   • Real-time Charts & Correlations Visualization           │
└──────────────────────┬──────────────────────────────────────┘
                       │ WebSocket + REST API
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend (Express.js)                       │
│                                                              │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Auth Service │  │  AI/ML Engine│  │  WebSocket Svc  │  │
│  │  (JWT, RBAC)  │  │  (Triage,    │  │  (Real-time     │  │
│  │               │  │   Anomaly)   │  │   Alerts)       │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           REST API Routes                               ││
│  │  /api/auth    /api/health    /api/provider              ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL
┌──────────────────────▼──────────────────────────────────────┐
│              PostgreSQL Database                             │
│  • Users (Patients & Providers)                             │
│  • Vital Signs (BP, HR, Temp, SpO2, Glucose)              │
│  • Symptoms (with AI-generated triage scores)              │
│  • Mood Check-ins (emotional & sleep metrics)              │
│  • Health Scores (unified metric with trend)               │
│  • Anomaly Alerts (real-time flagged events)               │
│  • Correlations (detected health patterns)                 │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Database Schema

### Core Tables
- **users**: Patient & Provider accounts with role-based access
- **patients**: Patient-specific data (DOB, medical history, allergies)
- **providers**: Medical professionals (license, specialization, hospital)
- **provider_patients**: Many-to-many relationship for patient assignment

### Health Data Tables
- **vital_signs**: BP (systolic/diastolic), HR, Temperature, SpO2, Glucose
- **symptoms**: Description, severity, urgency_score (AI-generated), potential diagnoses
- **mood_checkins**: Mood (1-5), stress, sleep quality, anxiety levels
- **health_scores**: Unified score breakdown (overall, vital, symptom, mental)

### Intelligence Tables
- **health_correlations**: Detected patterns between health metrics
- **anomaly_alerts**: Critical events flagged for provider action

## 🚀 Core Features

### Patient Features
1. **Health Score Dashboard**
   - Unified health metric (0-100)
   - Component breakdown (Vital, Symptom, Mental)
   - 7-day trend visualization
   - Risk level indicator

2. **Vital Signs Logger**
   - Blood pressure (systolic/diastolic)
   - Heart rate, temperature
   - Blood glucose, oxygen saturation (optional)
   - Automatic anomaly detection

3. **AI Symptom Checker**
   - Natural language symptom description
   - AI urgency scoring (0-100)
   - Severity classification (Low/Medium/High/Critical)
   - Potential diagnosis suggestions
   - Recommended actions

4. **Daily Wellness Check-In**
   - Mood rating (1-5 scale)
   - Stress level (0-10)
   - Sleep quality & hours
   - Anxiety tracking
   - Optional notes

5. **Pattern Recognition**
   - View detected health correlations
   - Understand relationships (mood→vitals, sleep→symptoms)
   - Confidence scores for each pattern

### Provider Features
1. **Priority Alert Dashboard**
   - Real-time alerts for patient anomalies
   - Alert severity color-coding
   - Alert acknowledgment workflow
   - Patient context (name, current health score)

2. **Patient Management**
   - Assigned patients list
   - One-click patient selection
   - Current health score overview

3. **Patient Timeline**
   - Chronological health events
   - Type icons (Vitals, Symptoms, Mood, Alerts)
   - Detailed event descriptions
   - Timestamp tracking

4. **Health Analytics**
   - Patient health score trends
   - Detected correlations for each patient
   - Risk level assessment

## 🔐 Security Features

- **JWT Authentication**: Secure token-based user sessions
- **Role-Based Access Control (RBAC)**: Patient vs Provider permissions
- **Password Hashing**: bcryptjs with 10 salt rounds
- **CORS Protection**: Frontend whitelist
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet Security**: HTTP headers protection

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Charting**: Recharts
- **Styling**: Custom CSS with CSS Grid/Flexbox

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Auth**: JWT + bcryptjs
- **API Style**: RESTful with WebSocket events

### Deployment
- **Frontend**: Vercel/Netlify
- **Backend**: Render/Railway
- **Database**: PostgreSQL managed service
- **CI/CD**: GitHub Actions ready

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Backend Setup

1. **Clone and navigate**
```bash
cd healthpulse-mono/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

4. **Initialize database**
```bash
npm run seed  # Creates tables and sample data
```

5. **Start development server**
```bash
npm run dev   # Runs on http://localhost:3001
```

### Frontend Setup

1. **Navigate to frontend**
```bash
cd healthpulse-mono/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Verify API_URL points to your backend
```

4. **Start development server**
```bash
npm run dev   # Runs on http://localhost:3000
```

## 📝 API Documentation

### Authentication Endpoints

```
POST /api/auth/register/patient
POST /api/auth/register/provider
POST /api/auth/login
GET /api/auth/me (requires auth)
```

### Health Data Endpoints (Patient)

```
POST /api/health/vitals       - Log vital signs
GET /api/health/vitals        - Get vital history
POST /api/health/symptoms     - Log symptom with AI triage
GET /api/health/symptoms      - Get symptoms
POST /api/health/mood         - Log mood check-in
GET /api/health/mood          - Get mood history
GET /api/health/health-score  - Get unified health score with correlations
```

### Provider Endpoints

```
GET /api/provider/alerts                    - Get unacknowledged alerts
PATCH /api/provider/alerts/:alertId/acknowledge
GET /api/provider/patients                  - Get assigned patients
GET /api/provider/patients/:patientId/timeline
GET /api/provider/patients/:patientId/health-score
POST /api/provider/patients/:patientId/assign
```

## 🎯 AI/ML Algorithms

### 1. Symptom Triage Algorithm
**Purpose**: Convert free-text symptom descriptions into urgency scores

**Logic**:
- Keyword matching for symptom categories
- Severity classification (Critical→95, High→75, Medium→55, Low→35)
- Symptom count multiplier (+15 for >3 symptoms)
- Potential diagnosis inference

**Example**:
```
Input: "chest pain, shortness of breath"
Output: Urgency=95, Severity=CRITICAL, Diagnosis=["Cardiac evaluation needed"]
```

### 2. Vital Sign Anomaly Detection
**Purpose**: Identify out-of-range vital signs and flag risks

**Normal Ranges** (simplified for demo):
- Systolic BP: 90-120 mmHg
- Diastolic BP: 60-80 mmHg
- Heart Rate: 60-100 bpm
- Temperature: 36.5-37.5°C
- Blood Glucose: 70-130 mg/dL (fasting)
- SpO2: 95-100%

**Risk Scoring**: Each anomaly contributes points; total capped at 100

### 3. Mood Analysis
**Purpose**: Assess mental health status and detect concerning patterns

**Risk Factors**:
- Very high anxiety (≥8/10): +20 points
- Low mood (≤2/5): +25 points
- Sleep deprivation (<5 hours): +20 points
- High stress (≥8/10): +15 points
- Significant mood changes: +10 points

### 4. Unified Health Score Calculation
**Purpose**: Combine all modalities into single interpretable metric

**Components**:
- Vital Score: 100 - vitalAnomalyRisk
- Symptom Score: 100 - urgencyScore (capped at 20 minimum)
- Mental Score: (mood/5)*40 + stressComponent + sleepComponent
- **Overall Score**: Average of three components

**Risk Level**:
- 80+: LOW
- 60-79: MEDIUM
- 40-59: HIGH
- <40: CRITICAL

### 5. Pattern Correlation Detection
**Purpose**: Identify health relationships (e.g., anxiety→high BP)

**Correlations Detected**:
- MOOD_TO_VITALS: High anxiety within 24h of elevated BP
- SLEEP_TO_SYMPTOMS: Poor sleep (≤3/10, <5 hours) preceding fatigue
- STRESS_TO_BP: Stress elevation correlating with systolic >130
- FATIGUE_PATTERN: Repeated fatigue after specific triggers

**Confidence Scoring**: Based on frequency and temporal proximity

## 🔄 Real-time Features (WebSocket)

### Client → Server Events
```javascript
socket.emit('authenticate', {userId, role})
socket.emit('vitals-logged', {patientId, systolic, diastolic, ...})
socket.emit('symptom-logged', {patientId, description, urgencyScore, ...})
socket.emit('mood-logged', {patientId, moodLevel, stressLevel, ...})
socket.emit('start-monitoring', {patientId, providerId})
```

### Server → Client Events
```javascript
socket.on('authenticated', {success: true})
socket.on('health-score-updated', {score, timestamp})
socket.on('new-alert', {alertId, anomalyType, severity, patient, ...})
socket.on('mood-status', {moodLevel, anxietyLevel, stressLevel})
```

## 🧪 Testing the Application

### Test Accounts (Post-Deployment)

**Patient Account**:
- Email: patient@test.com
- Password: TestPass123

**Provider Account**:
- Email: provider@test.com
- Password: TestPass123

### Test Scenarios

1. **Patient Workflow**
   - Register/Login as patient
   - Log vital signs (try 180/110 HR 120 for anomaly)
   - Add symptom ("chest pain" for high urgency)
   - Complete mood check-in
   - Observe health score update in real-time

2. **Provider Workflow**
   - Register/Login as provider
   - Assign patient
   - View real-time alerts when patient logs critical vitals
   - Click timeline to see patient health history
   - Acknowledge alerts

3. **AI Features**
   - Log symptom "severe headache, fever, stiff neck" → observe AI diagnosis suggestion
   - Log critical vitals → see instant provider alert
   - Track mood over days → observe correlations detected

## 📦 Deployment Guide

### Backend Deployment (Render/Railway)

1. **Environment Variables**
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Port**: 3001 (or your choice)

### Frontend Deployment (Vercel/Netlify)

1. **Environment Variables**
```
VITE_API_URL=https://your-backend-url/api
VITE_SOCKET_URL=https://your-backend-url
```

2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`

### Database Setup

1. Create PostgreSQL database on managed service
2. Get connection string
3. Add to backend `.env` as `DATABASE_URL`
4. Server auto-initializes schema on first run

## 📊 Code Quality & Architecture

### Design Patterns

1. **Separation of Concerns**: Services handle business logic
2. **Type Safety**: Full TypeScript implementation
3. **Reusable Components**: React components with clear props
4. **State Management**: Zustand for minimal complexity
5. **Middleware Pattern**: Express middleware for auth/errors

### File Structure

```
backend/
├── src/
│   ├── index.ts           # Main server
│   ├── config.ts          # Configuration
│   ├── middleware.ts      # Auth & error handling
│   ├── db/
│   │   └── index.ts       # Database initialization
│   ├── services/
│   │   ├── auth.ts        # JWT, password handling
│   │   ├── aiml.ts        # Core AI algorithms
│   │   └── websocket.ts   # Real-time logic
│   └── routes/
│       ├── auth.ts
│       ├── health.ts
│       └── provider.ts

frontend/
├── src/
│   ├── App.tsx            # Router setup
│   ├── main.tsx           # Entry point
│   ├── store.ts           # Zustand stores
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── PatientDashboard.tsx
│   │   └── ProviderDashboard.tsx
│   ├── components/        # Reusable UI components
│   ├── services/
│   │   ├── api.ts         # API client
│   │   └── websocket.ts   # WebSocket service
│   └── styles/            # CSS modules
```

## 🌟 Bonus Features

1. **Responsive Design**: Mobile-first CSS Grid/Flexbox
2. **Dark Mode Ready**: CSS variables for theme switching
3. **Accessibility**: Semantic HTML, ARIA labels
4. **Error Handling**: Comprehensive try-catch blocks
5. **Rate Limiting**: Prevents API abuse
6. **Logging**: Console logging for debugging

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

This is a submission project. For questions about implementation:
1. Review the architecture diagram
2. Check `AIAlgorithms` section for logic details
3. Examine TypeScript types in `shared/types.ts`

## 📄 License

MIT - Feel free to use this for your own projects

## 🎓 Learning Resources

- Express.js: https://expressjs.com
- React: https://react.dev
- PostgreSQL: https://www.postgresql.org/docs
- Socket.IO: https://socket.io/docs
- TypeScript: https://www.typescriptlang.org/docs

---

**Built with ❤️ for healthcare innovation**

*HealthPulse AI - Where data becomes insight, and insight becomes better health.*
