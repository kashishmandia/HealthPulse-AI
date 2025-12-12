# Supabase Migration - Visual Quick Reference

## Before → After

```
BEFORE (PostgreSQL with pg driver):
┌─────────────────────────────────────┐
│  Frontend (React/TypeScript)         │
└────────────────┬────────────────────┘
                 │ HTTP
                 ▼
┌─────────────────────────────────────┐
│  Express.js Backend                  │
│  ├─ auth.ts                          │
│  ├─ health.ts                        │
│  ├─ provider.ts                      │
│  └─ db/index.ts (pg Pool)            │
└────────────────┬────────────────────┘
                 │ SQL Queries
                 │ ($1, $2 parameters)
                 ▼
┌─────────────────────────────────────┐
│  PostgreSQL (Local or Remote)        │
│  ├─ users table                      │
│  ├─ vitals_signs table               │
│  └─ ... (8 total tables)             │
└─────────────────────────────────────┘

AFTER (Supabase):
┌─────────────────────────────────────┐
│  Frontend (React/TypeScript)         │
└────────────────┬────────────────────┘
                 │ HTTP
                 ▼
┌─────────────────────────────────────┐
│  Express.js Backend                  │
│  ├─ auth.ts                          │
│  ├─ health.ts                        │
│  ├─ provider.ts                      │
│  └─ db/index.ts (Supabase Client)    │
└────────────────┬────────────────────┘
                 │ Supabase JS SDK
                 │ (Managed API)
                 ▼
┌─────────────────────────────────────┐
│  Supabase (Managed PostgreSQL)       │
│  ├─ PostgreSQL Database              │
│  ├─ REST API (auto-generated)        │
│  ├─ Real-time WebSocket              │
│  ├─ Authentication                   │
│  ├─ Authorization (RLS)              │
│  └─ Storage, Backups, etc.           │
│                                      │
│  (No server to manage!)              │
└─────────────────────────────────────┘
```

## Query Translation Examples

### Pattern 1: Select All Matching

```typescript
// OLD (PostgreSQL)
const users = await queryDatabase(
  `SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC`,
  ['PATIENT']
);

// NEW (Supabase)
const users = await queryDatabase('users', {
  match: { role: 'PATIENT' },
  order: { column: 'created_at', ascending: false }
});
```

### Pattern 2: Select One Row

```typescript
// OLD
const user = await queryDatabaseSingle(
  `SELECT * FROM users WHERE email = $1`,
  [email]
);

// NEW
const user = await queryDatabaseSingle('users', {
  match: { email }
});
```

### Pattern 3: Insert Row

```typescript
// OLD
await executeQuery(
  `INSERT INTO users (id, email, password_hash, role)
   VALUES ($1, $2, $3, $4)`,
  [id, email, hash, 'PATIENT']
);

// NEW
await executeQuery('users', 'insert', {
  id,
  email,
  password_hash: hash,
  role: 'PATIENT'
});
```

### Pattern 4: Update Row

```typescript
// OLD
await executeQuery(
  `UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2`,
  [newEmail, userId]
);

// NEW
await executeQuery('users', 'update',
  { email: newEmail, updated_at: new Date() },
  { match: { id: userId } }
);
```

### Pattern 5: Delete Row

```typescript
// OLD
await executeQuery(
  `DELETE FROM users WHERE id = $1`,
  [userId]
);

// NEW
await executeQuery('users', 'delete', null,
  { match: { id: userId } }
);
```

## Setup Timeline

```
Day 0:
├─ [5 min]  Create Supabase project
├─ [1 min]  Copy credentials
├─ [2 min]  Run SQL schema
├─ [2 min]  Set up .env
└─ [1 min]  npm run dev
   TOTAL: ~11 minutes

Day 1:
├─ [15 min] Local testing
├─ [15 min] Deploy backend to Render
├─ [15 min] Deploy frontend to Vercel
└─ [30 min] Test live application
   TOTAL: ~1.5 hours

Day 2:
├─ [45 min] Record demo video (follow VIDEO_SCRIPT.md)
├─ [10 min] Push to GitHub
└─ [5 min]  Submit: URLs + Video
   TOTAL: ~1 hour
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Frontend                              │
│              (Vercel Deployment)                        │
│     React + TypeScript + Zustand + Socket.io            │
│     URL: https://healthpulse.vercel.app                 │
└────────────────┬──────────────────────────────────────┘
                 │ HTTP/WebSocket
                 │ (https://)
                 ▼
┌────────────────────────────────────────────────────────┐
│                   Backend                               │
│             (Render Deployment)                         │
│     Express.js + Node.js + Socket.io                    │
│     URL: https://healthpulse-backend.onrender.com       │
└────────────────┬──────────────────────────────────────┘
                 │ Supabase Client SDK
                 │ (authenticated)
                 ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Cloud                        │
│              (Managed PostgreSQL)                       │
│     ├─ PostgreSQL Database                              │
│     ├─ REST API                                         │
│     ├─ Real-time (WebSocket)                            │
│     ├─ Backups & Monitoring                             │
│     └─ Auto-scaling                                     │
│                                                         │
│     Credentials: SUPABASE_URL, SUPABASE_KEY             │
└────────────────────────────────────────────────────────┘
```

## Environment Variables Mapping

```
Production Deployment (Render):
┌─────────────────────────────────────┐
│ Environment Variables               │
├─────────────────────────────────────┤
│ NODE_ENV=production                 │
│ PORT=3001 (auto-assigned by Render) │
│ SUPABASE_URL=https://...            │ ◄── From Supabase
│ SUPABASE_KEY=eyJhbGc...             │ ◄── From Supabase
│ JWT_SECRET=your-secret-key          │
│ FRONTEND_URL=https://...vercel.app  │
└─────────────────────────────────────┘
         ▲
         │ Set via Render Dashboard
         │ (Settings → Environment)
         │
    Environment Variables in Render
```

## Database Connection Flow

```
Request from Frontend:
┌──────────────┐
│ POST /vitals │
└──────┬───────┘
       │
       ▼
┌───────────────────────────┐
│ Express Route Handler     │ (health.ts)
│ ├─ Validate data          │
│ ├─ Extract userId         │
│ └─ Call executeQuery()    │
└──────┬────────────────────┘
       │
       ▼
┌───────────────────────────┐
│ executeQuery()            │ (db/index.ts)
│ ├─ Get Supabase client    │
│ ├─ Build query            │
│ └─ Execute insert         │
└──────┬────────────────────┘
       │
       ▼
┌───────────────────────────┐
│ Supabase JS Client        │
│ ├─ Sign request           │
│ ├─ Send HTTPS to Supabase │
│ └─ Return results         │
└──────┬────────────────────┘
       │
       ▼
┌───────────────────────────┐
│ Supabase API Server       │
│ ├─ Authenticate request   │
│ ├─ Execute on PostgreSQL  │
│ └─ Return JSON response   │
└──────┬────────────────────┘
       │
       ▼
┌───────────────────────────┐
│ Response returned to      │
│ Express handler           │
│ Send to Frontend as JSON  │
└───────────────────────────┘
```

## Error Handling

```
Query Error Flow:
┌──────────────────────┐
│ Error from Supabase  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Catch in try-catch block         │
│ ├─ Check error.message           │
│ ├─ Check error.code              │
│ └─ Handle appropriately          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Return appropriate HTTP response │
│ ├─ 400 Bad Request               │
│ ├─ 404 Not Found                 │
│ ├─ 409 Conflict (duplicate)      │
│ └─ 500 Server Error              │
└──────────────────────────────────┘
```

## WebSocket Real-time Flow

```
Patient logs vitals:
┌────────────┐
│  Frontend  │
│  POST /api │
│  /vitals   │
└──────┬─────┘
       │
       ▼
┌──────────────────────┐
│ Backend receives     │
│ ├─ Inserts to DB     │
│ ├─ Calculates score  │
│ └─ Emits via Socket  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Socket.io broadcast  │
│ emit('vitals-logged',│
│  { data })           │
└──────┬───────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
  ┌────────┐        ┌────────┐        ┌────────┐
  │Frontend│        │Frontend│        │Frontend│
  │(Patient)        │(Provider)      │(Other)
  └────────┘        └────────┘        └────────┘
  Updates UI        Gets Alert       Not subscribed
```

## All Files Updated

```
✅ backend/package.json
   └─ @supabase/supabase-js: "2.38.4"

✅ backend/src/config.ts
   └─ SUPABASE_URL, SUPABASE_KEY

✅ backend/src/db/index.ts
   ├─ initializeSupabase()
   ├─ getSupabase()
   ├─ queryDatabase() - Supabase syntax
   ├─ queryDatabaseSingle() - Supabase syntax
   └─ executeQuery() - INSERT/UPDATE/DELETE

✅ backend/src/index.ts
   └─ initializeSupabase() call

✅ backend/src/services/auth.ts
   ├─ registerPatient() - Updated queries
   ├─ registerProvider() - Updated queries
   ├─ loginUser() - Updated queries
   └─ getUserById() - Updated queries

✅ backend/src/routes/health.ts
   ├─ POST /vitals - Updated
   ├─ GET /vitals - Updated
   ├─ POST /symptoms - Updated
   ├─ GET /symptoms - Updated
   ├─ POST /mood - Updated
   ├─ GET /mood - Updated
   └─ GET /health-score - Updated

✅ backend/src/routes/provider.ts
   ├─ GET /alerts - Updated
   ├─ PATCH /alerts/:id/acknowledge - Updated
   ├─ GET /patients - Updated
   ├─ GET /patients/:id/timeline - Updated
   ├─ GET /patients/:id/health-score - Updated
   └─ POST /patients/:id/assign - Updated

✅ backend/src/services/aiml.ts
   ├─ calculateHealthScore() - Updated queries
   └─ detectHealthCorrelations() - Updated queries

✅ backend/.env.example
   ├─ SUPABASE_URL
   └─ SUPABASE_KEY

Documentation:
✅ SUPABASE_QUICK_START.md
✅ SUPABASE_SETUP.md
✅ SUPABASE_MIGRATION_GUIDE.md
✅ SUPABASE_MIGRATION_COMPLETE.md (this file)
```

---

**Status: ✅ READY TO DEPLOY**

All code is updated and tested. Follow SUPABASE_QUICK_START.md to get running in 5 minutes!
