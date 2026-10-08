const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

// Serve static frontend files from the Vite build in production
app.use(express.static(path.join(__dirname, '../dist')));

const N8N_URL = process.env.N8N_URL || 'https://n8n-production-83cd.up.railway.app';
const parsedN8N = new URL(N8N_URL);

// Proxy route to get stats from n8n
app.get('/api/n8n/stats', express.json(), async (req, res) => {
  try {
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!N8N_API_KEY) {
      console.warn("N8N_API_KEY is not set. Returning mocked stats.");
      return res.json({ workflows: 12, totalActions: 3450 });
    }

    const workflowsResponse = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    const executionsResponse = await axios.get(`${N8N_URL}/api/v1/executions`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    const activeWorkflows = workflowsResponse.data.data.filter(w => w.active).length;
    const totalExecutions = executionsResponse.data.data.length;

    res.json({
      workflows: activeWorkflows,
      totalActions: totalExecutions * 5
    });
  } catch (error) {
    console.error('Error fetching stats from n8n:', error.message);
    res.status(500).json({ error: 'Failed to fetch n8n stats' });
  }
});

// Headers that must be stripped to allow iframe embedding
const BLOCKED_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'origin-agent-cluster',
  'x-permitted-cross-domain-policies'
];

// Manual reverse proxy for HTTP requests - strips iframe-blocking headers
app.use('/n8n', (req, res) => {
  // Strip the /n8n prefix when proxying to the actual N8N instance
  const targetPath = req.url.replace(/^\/n8n/, '') || '/';
  const targetUrl = new URL(targetPath, N8N_URL);
  const proto = targetUrl.protocol === 'https:' ? https : http;

  const proxyReq = proto.request(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.host,
      origin: targetUrl.origin,
      referer: targetUrl.href,
    }
  }, (proxyRes) => {
    const cleanHeaders = {};
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (!BLOCKED_HEADERS.includes(key.toLowerCase())) {
        cleanHeaders[key] = value;
      }
    }

    res.writeHead(proxyRes.statusCode, cleanHeaders);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy HTTP error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy connection failed' });
    }
  });

  req.pipe(proxyReq, { end: true });
});

// Create HTTP server manually so we can intercept WebSocket upgrades
const server = http.createServer(app);

// WebSocket proxy: handle 'upgrade' events for n8n push connections
server.on('upgrade', (req, socket, head) => {
  if (!req.url.startsWith('/n8n')) {
    return; // Ignore non-n8n websockets
  }

  console.log(`[WS] Upgrade request for: ${req.url}`);
  const targetPath = req.url.replace(/^\/n8n/, '') || '/';

  // Build the target WebSocket URL (wss:// for https://)
  const wsProto = parsedN8N.protocol === 'https:' ? 'wss:' : 'ws:';
  const targetWsUrl = `${wsProto}//${parsedN8N.host}${targetPath}`;

  const targetUrl = new URL(targetPath, N8N_URL);
  const proto = targetUrl.protocol === 'https:' ? https : http;

  const proxyReq = proto.request(targetUrl, {
    method: 'GET',
    headers: {
      ...req.headers,
      host: parsedN8N.host,
      origin: N8N_URL,
    }
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    console.log(`[WS] Connection established to n8n`);

    // Send the HTTP 101 response back to the client
    let rawHeaders = `HTTP/1.1 101 Switching Protocols\r\n`;
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      rawHeaders += `${key}: ${value}\r\n`;
    }
    rawHeaders += '\r\n';

    socket.write(rawHeaders);

    if (proxyHead && proxyHead.length > 0) {
      socket.write(proxyHead);
    }

    // Bi-directional pipe
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);

    proxySocket.on('error', (err) => {
      console.error('[WS] Proxy socket error:', err.message);
      socket.end();
    });

    socket.on('error', (err) => {
      console.error('[WS] Client socket error:', err.message);
      proxySocket.end();
    });
  });

  proxyReq.on('error', (err) => {
    console.error('[WS] Proxy request error:', err.message);
    socket.end();
  });

  proxyReq.end();
});

// Fallback for React Router (SPA) - must be the last route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

server.listen(PORT, () => {
  console.log(`Backend proxy running on http://localhost:${PORT}`);
  console.log(`Proxying HTTP + WebSocket to: ${N8N_URL}`);
});
