# Supabase Migration - Query Examples

Since you've switched to Supabase, all query patterns need to be updated. Here's a quick reference guide:

## Quick Migration Guide

### OLD (PostgreSQL with pg driver):
```typescript
// SELECT with WHERE and ORDER
const users = await queryDatabase(
  'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
  ['PATIENT']
);

// SELECT single row
const user = await queryDatabaseSingle(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// INSERT
await executeQuery(
  'INSERT INTO users (id, email, name) VALUES ($1, $2, $3)',
  [id, email, name]
);

// UPDATE
await executeQuery(
  'UPDATE users SET email = $1 WHERE id = $2',
  [newEmail, userId]
);

// DELETE
await executeQuery(
  'DELETE FROM users WHERE id = $1',
  [userId]
);
```

### NEW (Supabase):
```typescript
// SELECT with filtering and ordering
const users = await queryDatabase('users', {
  match: { role: 'PATIENT' },
  order: { column: 'created_at', ascending: false }
});

// SELECT single row
const user = await queryDatabaseSingle('users', {
  match: { email }
});

// INSERT
await executeQuery('users', 'insert', {
  id,
  email,
  name
});

// UPDATE
await executeQuery('users', 'update',
  { email: newEmail },
  { match: { id: userId } }
);

// DELETE
await executeQuery('users', 'delete', null,
  { match: { id: userId } }
);
```

## Files That Need Updating

### Priority 1 (Already Updated):
- ✅ `backend/src/services/auth.ts` - Updated
- ✅ `backend/src/routes/health.ts` - Updated
- ✅ `backend/src/config.ts` - Updated
- ✅ `backend/package.json` - Updated
- ✅ `backend/.env.example` - Updated

### Priority 2 (Needs Updates):
- ⏳ `backend/src/routes/provider.ts` - Has 5+ SQL queries
- ⏳ `backend/src/services/aiml.ts` - Has complex queries
- ⏳ `backend/src/services/websocket.ts` - May have queries

## How to Update Remaining Files

### For routes/provider.ts:

Replace all instances like this:

```typescript
// OLD
const alerts = await queryDatabase<any>(
  `SELECT aa.*, u.first_name, u.last_name
   FROM anomaly_alerts aa
   JOIN users u ON aa.patient_id = u.id
   WHERE aa.provider_id = $1 AND aa.acknowledged = $2
   ORDER BY aa.created_at DESC`,
  [req.userId, false]
);

// NEW - Use Supabase's join syntax
const alerts = await queryDatabase<any>('anomaly_alerts', {
  select: 'id, description, severity, created_at, users(first_name, last_name)',
  match: { provider_id: req.userId, acknowledged: false },
  order: { column: 'created_at', ascending: false }
});
```

Or for complex joins, fetch separately and combine in memory.

### For services/aiml.ts:

```typescript
// OLD
const recentVitals = await queryDatabase(
  'SELECT * FROM vital_signs WHERE patient_id = $1 AND recorded_at >= $2 ORDER BY recorded_at DESC LIMIT 10',
  [patientId, sevenDaysAgo]
);

// NEW
const recentVitals = await queryDatabase('vital_signs', {
  match: { patient_id: patientId },
  order: { column: 'recorded_at', ascending: false },
  limit: 10
});
```

## Testing Your Updates

After updating each file:

1. Run the server: `npm run dev`
2. Watch for errors in the console
3. Test the affected endpoints:
   - POST /api/auth/register/patient
   - GET /api/health/vitals
   - GET /api/provider/alerts (if updated)

## Common Mistakes

❌ **Don't:** Use `$1, $2` placeholders
✅ **Do:** Use JavaScript objects with field names

❌ **Don't:** Write raw SQL strings
✅ **Do:** Use Supabase query builder syntax

❌ **Don't:** Forget table names in query calls
✅ **Do:** Pass table name as first argument

## For Complex Queries

If you have very complex SQL queries with multiple joins, consider:

1. Breaking them into separate Supabase queries
2. Combining results in JavaScript
3. Using Supabase's `select` parameter with joined tables

Example:
```typescript
// Get alerts WITH related user and patient data
const alerts = await queryDatabase<any>('anomaly_alerts', {
  select: `
    *,
    users(first_name, last_name, email),
    patients(date_of_birth)
  `,
  match: { provider_id: req.userId },
  order: { column: 'created_at', ascending: false }
});
```

## Still Stuck?

1. Check SUPABASE_SETUP.md for complete SQL schema
2. Review the updated files as examples (auth.ts, health.ts)
3. Check Supabase docs: https://supabase.com/docs/reference/javascript

## Next Steps

1. Update remaining files (provider.ts, aiml.ts, websocket.ts if needed)
2. Run `npm install` to install @supabase/supabase-js
3. Create .env file with Supabase credentials
4. Test locally: `npm run dev`
5. Deploy to Render with env vars
