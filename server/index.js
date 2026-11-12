import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDb, DB_NAME } from './db.js';
import { uploadDir } from './upload.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import offerRoutes from './routes/offers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

fs.mkdirSync(uploadDir, { recursive: true });

// Connect to MySQL first. If it fails, explain why in plain words.
try {
  await initDb();
  console.log(`Connected to MySQL database "${DB_NAME}"`);
} catch (err) {
  console.error('\n❌ Could not connect to MySQL:', err.code || '', err.message);
  console.error('   1) Is MySQL running? (XAMPP: press Start next to MySQL)');
  console.error('   2) Did you copy server/.env.example to server/.env and set DB_PASSWORD?\n');
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/offers', offerRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Optional: after `npm run build` in /client, the server can serve the finished site too.
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api|uploads).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  // This is the page you see at http://localhost:3001 - the API has no website of its own.
  app.get('/', (req, res) =>
    res.send(`<body style="font-family:sans-serif;max-width:520px;margin:60px auto;line-height:1.5">
      <h2>✅ StuffTrade API is running</h2>
      <p>This is only the <b>backend</b>, so there is no page here.<br>
      Open the website at <a href="http://localhost:5173">http://localhost:5173</a>
      (run <code>npm run client</code> in a second terminal).</p>
      <p>Quick check: <a href="/api/health">/api/health</a></p></body>`)
  );
}

// Friendly error messages (e.g. file too large, wrong file type, database trouble)
app.use((err, req, res, next) => {
  console.error(err);
  let status = err.status || 400;
  let msg = err.message || 'Something went wrong.';
  if (err.code === 'LIMIT_FILE_SIZE') msg = 'Each photo must be 5 MB or smaller.';
  if (err.code === 'ER_DUP_ENTRY') { status = 409; msg = 'That email or mobile number is already registered.'; }
  if (err.sqlMessage) { status = 500; msg = 'Database error. Check the server terminal.'; }
  res.status(status).json({ error: msg });
});

app.listen(PORT, '0.0.0.0', () => console.log(`StuffTrade API running on http://localhost:${PORT}`));
