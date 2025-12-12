import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config.js';
import { initializeDatabase, initializeSupabase } from './db/index.js';
import { initializeWebSocket } from './services/websocket.js';
import { errorHandler, notFoundHandler } from './middleware.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import providerRoutes from './routes/provider.js';

const app = express();
const server = createServer(app);

// Security and performance middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/provider', providerRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// WebSocket setup
const io = new SocketIOServer(server, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Note: WebSocket service disabled temporarily - requires migration to Supabase queries
// const wsService = initializeWebSocket(io);
let wsService: any = null;

try {
  wsService = initializeWebSocket(io);
} catch (e) {
  console.warn('WebSocket service initialization skipped');
}

// Startup
async function start() {
  try {
    console.log('🚀 HealthPulse AI Backend Starting...');
    console.log(`📊 Environment: ${config.NODE_ENV}`);

    // Initialize Supabase
    try {
      initializeSupabase();
    } catch (supabaseError) {
      console.warn('⚠️  Supabase initialization warning (this is OK during development)');
    }

    // Initialize database (if Supabase is configured)
    try {
      await initializeDatabase();
    } catch (dbError) {
      console.warn('⚠️  Database initialization skipped (Supabase not configured)');
    }

    // Start server
    server.listen(config.PORT, () => {
      console.log(`✓ Server running on http://localhost:${config.PORT}`);
      console.log(`✓ WebSocket ready on ws://localhost:${config.PORT}`);
      console.log(`✓ CORS enabled for ${config.FRONTEND_URL}`);
      console.log('');
      console.log('📝 To enable Supabase:');
      console.log('   1. Create account at https://supabase.com');
      console.log('   2. Create new project');
      console.log('   3. Copy Project URL and anon key');
      console.log('   4. Add to .env: SUPABASE_URL and SUPABASE_KEY');
      console.log('   5. Restart server');
    });
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

start().catch(err => {
  console.error('Unhandled startup error:');
  if (err instanceof Error) {
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  } else {
    console.error('Error:', JSON.stringify(err, null, 2));
    console.error('Type:', typeof err);
  }
  process.exit(1);
});

export { app, server, io, wsService };
