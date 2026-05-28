#!/usr/bin/env node
// ESA Quiz — WebSocket relay + static file server
// Usage: node relay.js
// Env vars: PORT (default 8080)

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = parseInt(process.env.PORT || '8080', 10);
const STATIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
};

const server = http.createServer((req, res) => {
  // Serve static files
  let filePath = path.join(STATIC_DIR, req.url === '/' ? '/control.html' : req.url.split('?')[0]);
  filePath = path.normalize(filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, path: '/ws' });

let clientCount = 0;

function broadcastClientCount() {
  const msg = JSON.stringify({ type: 'clients', count: clientCount });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

wss.on('connection', (ws) => {
  clientCount++;
  console.log(`[WS] Client connected (${clientCount} total)`);
  broadcastClientCount();

  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    if (data.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
      return;
    }
    if (data.type === 'pong') return;

    // Relay all other messages to all OTHER clients
    const msg = JSON.stringify(data);
    for (const client of wss.clients) {
      if (client !== ws && client.readyState === 1) {
        client.send(msg);
      }
    }
  });

  ws.on('close', () => {
    clientCount--;
    console.log(`[WS] Client disconnected (${clientCount} total)`);
    broadcastClientCount();
  });
});

// Keepalive pings
setInterval(() => {
  const msg = JSON.stringify({ type: 'ping' });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}, 30_000);

server.listen(PORT, () => {
  console.log(`[ESA Quiz] Server running on http://localhost:${PORT}`);
  console.log(`  Control panel: http://localhost:${PORT}/control.html`);
  console.log(`  Display:       http://localhost:${PORT}/source.html`);
});
