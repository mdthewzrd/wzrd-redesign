import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

// Enable CORS for web UI
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Gateway V2 proxy endpoints
app.use('/api/gateway/v2', createProxyMiddleware({
  target: 'http://127.0.0.1:18801',
  changeOrigin: true,
  pathRewrite: {
    '^/api/gateway/v2': ''
  }
}));

// Mock endpoints for web UI
app.get('/api/topics', (req, res) => {
  res.json({
    topics: [
      { id: 'framework', name: 'Framework', is_active: true },
      { id: 'wzrd-redesign', name: 'WZRD Redesign', is_active: true },
      { id: 'testing', name: 'Testing', is_active: true },
      { id: 'docs', name: 'Documentation', is_active: true },
      { id: 'web-ui', name: 'Web UI', is_active: true },
      { id: 'topics', name: 'Topics', is_active: true },
      { id: 'general', name: 'General', is_active: true },
      { id: 'sandbox', name: 'Sandbox', is_active: false }
    ],
    total: 8,
    active: 7
  });
});

app.get('/api/sandboxes', (req, res) => {
  res.json({
    sandboxes: [
      { id: 'sandbox-test-e2e-project', name: 'test-e2e-project', status: 'active' },
      { id: 'sandbox-opencode-plugin-test', name: 'opencode-plugin-test', status: 'active' }
    ]
  });
});

app.get('/api/memory/stats', (req, res) => {
  res.json({
    totalTopics: 8,
    memoryFiles: 42,
    worktrees: 12,
    lastUpdated: new Date().toISOString(),
    memoryUsage: { total: 100, used: 42, percent: 42 }
  });
});

app.get('/api/memory/files', (req, res) => {
  res.json({ count: 42 });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      gatewayV2: true,
      discordBot: true,
      apiServer: true
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log('CORS enabled for http://localhost:5174');
  console.log('Gateway V2 proxy available at /api/gateway/v2/*');
});
