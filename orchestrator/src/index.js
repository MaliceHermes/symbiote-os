// Symbiote-OS Orchestrator (Venom)
// Phase 1–5 — minimal functional implementation
// Serves: health check, Hive metadata, chat routing, Carnage audit logging

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, readFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';

// Load .env
dotenv.config({ path: path.resolve(process.env.ENV_PATH || '.env') });

const PORT = process.env.ORCHESTRATOR_PORT || 3030;
const HOST = process.env.ORCHESTRATOR_HOST || 'localhost';
const HIVE_ROOT = process.env.SYMBIOTE_HIVE_ROOT || path.join(process.env.HOME, '.symbiote-brain');

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'symbiote-orchestrator',
    uptime: process.uptime(),
    hive: HIVE_ROOT,
    timestamp: new Date().toISOString()
  });
});

// Orchestrator info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'symbiote-orchestrator',
    version: '0.1.0',
    description: 'Local-first agentic hub for Venom (Debian 13)',
    phase: 'Phase 1–5 in progress',
    components: ['venom', 'tendril', 'toxin'],
    clis: ['hermes', 'codex', 'ollama', 'openai', 'grok'],
    hive_root: HIVE_ROOT,
    orchesterator_port: PORT,
    frontend_port: 5173
  });
});

// Hive endpoints
app.get('/api/hive', (req, res) => {
  const cages = ['Life-OS', 'Business-Private', 'Claude-Brain'];
  const structure = cages.map(cage => ({
    name: cage,
    path: path.join(HIVE_ROOT, cage),
    locked: cage === 'Business-Private',
    exists: existsSync(path.join(HIVE_ROOT, cage))
  }));
  res.json({ cages: structure, root: HIVE_ROOT });
});

// Brain state
app.get('/api/brain-state', async (req, res) => {
  try {
    const statePath = path.join(HIVE_ROOT, 'brain-state.json');
    if (existsSync(statePath)) {
      const data = await readFile(statePath, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json({ error: 'brain-state.json not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat log
app.get('/api/chats', async (req, res) => {
  try {
    const chatPath = path.join(HIVE_ROOT, 'chats.jsonl');
    if (!existsSync(chatPath)) {
      return res.json({ chats: [] });
    }
    const data = await readFile(chatPath, 'utf-8');
    const chats = data.trim().split('\n')
      .filter(line => line)
      .map(line => JSON.parse(line));
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save chat
app.post('/api/chats', async (req, res) => {
  try {
    const chatPath = path.join(HIVE_ROOT, 'chats.jsonl');
    await appendFile(chatPath, JSON.stringify({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...req.body
    }) + '\n');
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Carnage audit log
app.get('/api/carnage', async (req, res) => {
  try {
    const auditPath = path.join(HIVE_ROOT, '.carnage_audit.log');
    if (!existsSync(auditPath)) {
      return res.json({ entries: [] });
    }
    const data = await readFile(auditPath, 'utf-8');
    const entries = data.trim().split('\n')
      .filter(line => line)
      .map(line => JSON.parse(line));
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ollama proxy
app.get('/api/ollama/tags', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Ollama not reachable' });
  }
});

// ─── WebSocket ───────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(chalk.blue('[socket] Client connected:', socket.id));

  // Echo + broadcast
  socket.on('chat', (data) => {
    console.log(chalk.gray('[socket] chat:', data));
    socket.broadcast.emit('chat', data);
  });

  socket.on('disconnect', () => {
    console.log(chalk.blue('[socket] Client disconnected:', socket.id));
  });
});

// ─── Startup ─────────────────────────────────────────────────────────

server.listen(PORT, HOST, () => {
  console.log(chalk.green.bold('======================================='));
  console.log(chalk.green.bold('  Symbiote-OS Orchestrator (Venom)'));
  console.log(chalk.green.bold('======================================='));
  console.log(chalk.gray(`  ${new Date().toISOString()}`));
  console.log(chalk.blue(`  Orchestrator: http://${HOST}:${PORT}`));
  console.log(chalk.blue(`  Frontend:     http://localhost:5173`));
  console.log(chalk.blue(`  Ollama:       http://localhost:11434`));
  console.log(chalk.blue(`  Hive:         ${HIVE_ROOT}`));
  console.log();
  console.log(chalk.gray('  Endpoints:'));
  console.log(chalk.gray('    GET  /api/health       — health check'));
  console.log(chalk.gray('    GET  /api/info         — orchestrator info'));
  console.log(chalk.gray('    GET  /api/hive         — Hive cage structure'));
  console.log(chalk.gray('    GET  /api/brain-state  — brain-state.json'));
  console.log(chalk.gray('    GET  /api/chats        — chat history'));
  console.log(chalk.gray('    POST /api/chats        — save chat entry'));
  console.log(chalk.gray('    GET  /api/carnage      — audit log'));
  console.log(chalk.gray('    GET  /api/ollama/tags  — proxied Ollama'));
  console.log();
});
