// server.js — REST API + SQLite storage for the Safety & Health Information Tool.
//
// The front-end stores each record as a self-contained JSON object with an
// `id`. The server mirrors that: one table per collection holding (id, data,
// updated_at). This keeps the API generic and the front-end model unchanged.
//
// Env vars:
//   PORT         (default 8080)
//   API_KEY      shared key required in the `x-api-key` header (optional)
//   CORS_ORIGIN  allowed origin(s), default "*"
//   DB_FILE      sqlite file path, default ./data/safety.db

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.API_KEY || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'safety.db');

const COLLECTIONS = ['visits', 'accidents', 'actions', 'photos', 'meta'];

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
for (const c of COLLECTIONS) {
  db.prepare(`CREATE TABLE IF NOT EXISTS ${c} (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT)`).run();
}

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '20mb' })); // photos are base64 data URLs

// Optional shared-key auth (health check stays open).
app.use('/api', (req, res, next) => {
  if (!API_KEY || req.path === '/health') return next();
  if (req.get('x-api-key') === API_KEY) return next();
  res.status(401).json({ error: 'unauthorized' });
});

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString(), collections: COLLECTIONS }));

function guard(c, res) {
  if (!COLLECTIONS.includes(c)) { res.status(404).json({ error: 'unknown collection' }); return false; }
  return true;
}

// List all records of a collection.
app.get('/api/:c', (req, res) => {
  const c = req.params.c; if (!guard(c, res)) return;
  const rows = db.prepare(`SELECT data FROM ${c}`).all();
  res.json(rows.map((r) => JSON.parse(r.data)));
});

// Get one record.
app.get('/api/:c/:id', (req, res) => {
  const c = req.params.c; if (!guard(c, res)) return;
  const row = db.prepare(`SELECT data FROM ${c} WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(JSON.parse(row.data));
});

// Upsert a record (full object in the body).
app.put('/api/:c/:id', (req, res) => {
  const c = req.params.c; if (!guard(c, res)) return;
  const obj = req.body || {};
  obj.id = req.params.id;
  db.prepare(`INSERT INTO ${c} (id, data, updated_at) VALUES (?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`)
    .run(obj.id, JSON.stringify(obj), new Date().toISOString());
  res.json(obj);
});

// Delete a record.
app.delete('/api/:c/:id', (req, res) => {
  const c = req.params.c; if (!guard(c, res)) return;
  db.prepare(`DELETE FROM ${c} WHERE id = ?`).run(req.params.id);
  res.status(204).end();
});

// Optionally serve the front-end if its files are copied into ./public
// (lets you host API + app from a single container).
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Safety & Health backend listening on :${PORT} (db: ${DB_FILE})`));
