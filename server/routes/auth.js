import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { get, run } from '../db.js';
import { wrap } from '../async.js';
import { signToken, requireAuth } from '../auth.js';
import { upload, fileUrls } from '../upload.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cleanMobile = (m = '') => m.replace(/[\s-]/g, '');
const MOBILE_RE = /^\+?\d{10,13}$/;

// Store every mobile number in ONE format (+63...), so "0917 123 4567" and "+63 917 123 4567"
// are treated as the same number when signing up and logging in.
const normalizeMobile = (m = '') => {
  const c = cleanMobile(m);
  if (/^0\d{10}$/.test(c)) return '+63' + c.slice(1);
  if (/^63\d{10}$/.test(c)) return '+' + c;
  if (/^9\d{9}$/.test(c)) return '+63' + c;
  return c;
};

export const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  mobile: u.mobile,
  area: u.area,
  photo: u.photo,
  created_at: u.created_at,
});

// POST /api/auth/signup
router.post('/signup', wrap(async (req, res) => {
  const { name = '', email = '', mobile = '', area = '', password = '', confirm = '' } = req.body;
  const errors = {};
  if (!name.trim()) errors.name = 'Enter your full name';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email';
  if (!MOBILE_RE.test(cleanMobile(mobile))) errors.mobile = 'Enter a valid mobile number';
  if (!area.trim()) errors.area = 'Enter your neighborhood or barangay';
  if (password.length < 8) errors.password = 'Use at least 8 characters';
  if (confirm !== password) errors.confirm = 'Passwords do not match';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });

  const mail = email.trim().toLowerCase();
  const phone = normalizeMobile(mobile);
  if (await get('SELECT id FROM users WHERE email = ?', [mail]))
    return res.status(409).json({ error: 'Email already registered.', fields: { email: 'Email already registered' } });
  if (await get('SELECT id FROM users WHERE mobile = ?', [phone]))
    return res.status(409).json({ error: 'Mobile already registered.', fields: { mobile: 'Mobile already registered' } });

  const hash = bcrypt.hashSync(password, 10);
  const info = await run(
    'INSERT INTO users (name, email, mobile, area, password_hash) VALUES (?, ?, ?, ?, ?)',
    [name.trim(), mail, phone, area.trim(), hash]
  );
  const user = await get('SELECT * FROM users WHERE id = ?', [info.insertId]);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

// POST /api/auth/login  (identifier = email OR mobile number)
router.post('/login', wrap(async (req, res) => {
  const identifier = (req.body.identifier || '').trim();
  const password = req.body.password || '';
  const isEmail = EMAIL_RE.test(identifier);
  const isMobile = MOBILE_RE.test(cleanMobile(identifier));
  if (!isEmail && !isMobile)
    return res.status(400).json({ error: 'Enter a valid email or mobile number', field: 'identifier' });

  const user = isEmail
    ? await get('SELECT * FROM users WHERE email = ?', [identifier.toLowerCase()])
    : await get('SELECT * FROM users WHERE mobile IN (?, ?)', [normalizeMobile(identifier), cleanMobile(identifier)]);

  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Incorrect password', field: 'password' });

  res.json({ token: signToken(user), user: publicUser(user) });
}));

// GET /api/auth/me
router.get('/me', requireAuth, wrap(async (req, res) => {
  const user = await get('SELECT * FROM users WHERE id = ?', [req.userId]);
  if (!user) return res.status(401).json({ error: 'Account not found.' });
  res.json({ user: publicUser(user) });
}));

// PUT /api/auth/me  -> edit profile (multipart so a photo can be uploaded)
router.put('/me', requireAuth, upload.single('photo'), wrap(async (req, res) => {
  const { name = '', mobile = '', area = '' } = req.body;
  const phone = normalizeMobile(mobile);
  const errors = {};
  if (!name.trim()) errors.name = 'Enter your full name';
  if (!MOBILE_RE.test(phone)) errors.mobile = 'Enter a valid mobile number';
  if (!area.trim()) errors.area = 'Enter your neighborhood or barangay';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });

  const taken = await get('SELECT id FROM users WHERE mobile = ? AND id != ?', [phone, req.userId]);
  if (taken) return res.status(409).json({ error: 'Mobile already registered.', fields: { mobile: 'Mobile already registered' } });

  if (req.file) await run('UPDATE users SET photo = ? WHERE id = ?', [fileUrls([req.file])[0], req.userId]);
  await run('UPDATE users SET name = ?, mobile = ?, area = ? WHERE id = ?', [name.trim(), phone, area.trim(), req.userId]);
  const user = await get('SELECT * FROM users WHERE id = ?', [req.userId]);
  res.json({ user: publicUser(user) });
}));

export default router;
