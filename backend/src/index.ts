/**
 * OffShift — Express Backend Server
 */

import express from 'express';
import cors from 'cors';
import riderRoutes from './routes/riders';
import policyRoutes from './routes/policies';
import claimRoutes from './routes/claims';
import webhookRoutes from './routes/webhooks';
import { db } from './data/store';
import { addSSEClient, removeSSEClient } from './services/cron';
import { v4 as uuid } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  if (req.method !== 'GET' || !req.url.includes('/events')) {
    console.log(`📡 ${req.method} ${req.url}`);
  }
  next();
});

// ─── API Routes ────────────────────────────────────────────────────────────

app.use('/api/riders', riderRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/webhooks', webhookRoutes);

// ─── Dashboard Analytics ───────────────────────────────────────────────────

app.get('/api/analytics/dashboard', (_req, res) => {
  const stats = db.getDashboardStats();
  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
});

// ─── SSE (Server-Sent Events) for real-time updates ────────────────────────

app.get('/api/events', (req, res) => {
  const clientId = uuid();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);

  addSSEClient({ id: clientId, res });

  req.on('close', () => {
    removeSSEClient(clientId);
  });
});

// ─── Health Check ──────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'OffShift Backend',
    version: '1.0.0',
    riders: db.riders.length,
    active_policies: db.policies.filter(p => p.status === 'active').length,
    timestamp: new Date().toISOString(),
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🛡️  OffShift Backend — Smart Income Shield');
  console.log('   "When the storm hits — the money hits first."');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   🚀 Server running on http://localhost:${PORT}`);
  console.log(`   📊 Dashboard API: http://localhost:${PORT}/api/analytics/dashboard`);
  console.log(`   🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`   📡 SSE events: http://localhost:${PORT}/api/events`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   👥 ${db.riders.length} riders loaded`);
  console.log(`   📋 ${db.policies.filter(p => p.status === 'active').length} active policies`);
  console.log(`   💰 ${db.claims.filter(c => c.status === 'paid').length} claims paid`);
  console.log('═══════════════════════════════════════════════════════════\n');
});

export default app;
