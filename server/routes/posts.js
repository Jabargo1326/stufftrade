import { Router } from 'express';
import { all, get, run } from '../db.js';
import { wrap } from '../async.js';
import { requireAuth } from '../auth.js';
import { upload, fileUrls } from '../upload.js';

const router = Router();
router.use(requireAuth);

export const CATEGORIES = ['Gadgets', 'Clothes', 'Books', 'Home', 'Sports', 'Toys', 'Music', 'Other'];

// One query that returns everything a post card/detail needs.
const POST_SELECT = `
  SELECT p.*, u.name AS owner_name, u.photo AS owner_photo,
    (SELECT COUNT(*) FROM offers o WHERE o.post_id = p.id) AS offers_count,
    (SELECT COUNT(*) FROM offers o WHERE o.post_id = p.id AND o.status = 'pending') AS pending_count,
    (SELECT COUNT(*) FROM posts t WHERE t.user_id = p.user_id AND t.status = 'traded') AS owner_trades,
    EXISTS (SELECT 1 FROM saved s WHERE s.post_id = p.id AND s.user_id = ?) AS is_saved
  FROM posts p JOIN users u ON u.id = p.user_id
`;

const shape = (row) => ({
  ...row,
  photos: JSON.parse(row.photos || '[]'),
  is_saved: !!row.is_saved,
});

const validate = (b) => {
  const errors = {};
  if (!(b.title || '').trim()) errors.title = 'Enter a title';
  if (!CATEGORIES.includes(b.category)) errors.category = 'Select a category';
  if (!(b.wants || '').trim()) errors.wants = 'Tell people what you want in return';
  if (!(b.area || '').trim()) errors.area = 'Enter your neighborhood or barangay';
  return errors;
};

// GET /api/posts?q=bike&category=Gadgets  -> open posts from OTHER people
router.get('/', wrap(async (req, res) => {
  const { q = '', category = '' } = req.query;
  const where = [`p.status = 'open'`, 'p.user_id != ?'];
  const params = [req.userId, req.userId];
  if (q.trim()) {
    where.push('(p.title LIKE ? OR p.description LIKE ? OR p.wants LIKE ?)');
    const like = `%${q.trim()}%`;
    params.push(like, like, like);
  }
  if (category && category !== 'All') {
    where.push('p.category = ?');
    params.push(category);
  }
  const rows = await all(`${POST_SELECT} WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC, p.id DESC`, params);
  res.json({ posts: rows.map(shape) });
}));

// GET /api/posts/categories
router.get('/categories', (req, res) => res.json({ categories: CATEGORIES }));

// GET /api/posts/mine
router.get('/mine', wrap(async (req, res) => {
  const rows = await all(`${POST_SELECT} WHERE p.user_id = ? ORDER BY p.created_at DESC, p.id DESC`, [req.userId, req.userId]);
  res.json({ posts: rows.map(shape) });
}));

// GET /api/posts/saved
router.get('/saved', wrap(async (req, res) => {
  const rows = await all(
    `${POST_SELECT} WHERE p.id IN (SELECT post_id FROM saved WHERE user_id = ?) ORDER BY p.created_at DESC`,
    [req.userId, req.userId]
  );
  res.json({ posts: rows.map(shape) });
}));

// GET /api/posts/:id
router.get('/:id', wrap(async (req, res) => {
  const row = await get(`${POST_SELECT} WHERE p.id = ?`, [req.userId, req.params.id]);
  if (!row) return res.status(404).json({ error: 'Post not found.' });
  res.json({ post: shape(row) });
}));

// POST /api/posts  (multipart: photos[] + text fields)
router.post('/', upload.array('photos', 3), wrap(async (req, res) => {
  const errors = validate(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });
  const { title, category, description = '', wants, area } = req.body;
  const info = await run(
    'INSERT INTO posts (user_id, title, category, description, wants, area, photos) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.userId, title.trim(), category, description.trim(), wants.trim(), area.trim(), JSON.stringify(fileUrls(req.files))]
  );
  const row = await get(`${POST_SELECT} WHERE p.id = ?`, [req.userId, info.insertId]);
  res.status(201).json({ post: shape(row) });
}));

// PUT /api/posts/:id  (owner only). "keep" = JSON array of existing photo urls to keep.
router.put('/:id', upload.array('photos', 3), wrap(async (req, res) => {
  const post = await get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (post.user_id !== req.userId) return res.status(403).json({ error: 'This is not your post.' });
  const errors = validate(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });

  let keep = [];
  try { keep = JSON.parse(req.body.keep || '[]'); } catch { keep = []; }
  const existing = JSON.parse(post.photos || '[]');
  keep = keep.filter((u) => existing.includes(u));
  const photos = [...keep, ...fileUrls(req.files)].slice(0, 3);

  const { title, category, description = '', wants, area } = req.body;
  await run('UPDATE posts SET title=?, category=?, description=?, wants=?, area=?, photos=? WHERE id=?',
    [title.trim(), category, description.trim(), wants.trim(), area.trim(), JSON.stringify(photos), post.id]);
  const row = await get(`${POST_SELECT} WHERE p.id = ?`, [req.userId, post.id]);
  res.json({ post: shape(row) });
}));

// DELETE /api/posts/:id (owner only; offers + saves are removed automatically)
router.delete('/:id', wrap(async (req, res) => {
  const post = await get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (post.user_id !== req.userId) return res.status(403).json({ error: 'This is not your post.' });
  await run('DELETE FROM posts WHERE id = ?', [post.id]);
  res.json({ ok: true });
}));

// POST /api/posts/:id/save  -> toggles the heart
router.post('/:id/save', wrap(async (req, res) => {
  const post = await get('SELECT id FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  const has = await get('SELECT 1 AS x FROM saved WHERE user_id = ? AND post_id = ?', [req.userId, post.id]);
  if (has) await run('DELETE FROM saved WHERE user_id = ? AND post_id = ?', [req.userId, post.id]);
  else await run('INSERT INTO saved (user_id, post_id) VALUES (?, ?)', [req.userId, post.id]);
  res.json({ saved: !has });
}));

// GET /api/posts/:id/offers  (owner only) -> the offers screen for one post
router.get('/:id/offers', wrap(async (req, res) => {
  const post = await get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (post.user_id !== req.userId) return res.status(403).json({ error: 'This is not your post.' });
  const rows = await all(
    `SELECT o.*, u.name AS offerer_name, u.photo AS offerer_photo, u.mobile AS offerer_mobile
     FROM offers o JOIN users u ON u.id = o.user_id
     WHERE o.post_id = ? ORDER BY o.created_at DESC, o.id DESC`,
    [post.id]
  );
  res.json({ offers: rows.map((o) => ({ ...o, photos: JSON.parse(o.photos || '[]') })) });
}));

// POST /api/posts/:id/offers  (multipart: photos[] + item, cash, message)
router.post('/:id/offers', upload.array('photos', 3), wrap(async (req, res) => {
  const post = await get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (post.user_id === req.userId) return res.status(400).json({ error: "You can't make an offer on your own post." });
  if (post.status !== 'open') return res.status(400).json({ error: 'This trade is already done.' });

  const item = (req.body.item || '').trim();
  const cash = Math.max(0, parseInt(req.body.cash, 10) || 0);
  if (!item && !cash) return res.status(400).json({ error: 'Offer an item, some cash, or both.', fields: { item: 'What are you offering?' } });

  const dup = await get(`SELECT id FROM offers WHERE post_id = ? AND user_id = ? AND status = 'pending'`, [post.id, req.userId]);
  if (dup) return res.status(409).json({ error: 'You already sent an offer on this post.' });

  const info = await run(
    'INSERT INTO offers (post_id, user_id, item, cash, message, photos) VALUES (?, ?, ?, ?, ?, ?)',
    [post.id, req.userId, item, cash, (req.body.message || '').trim(), JSON.stringify(fileUrls(req.files))]
  );
  res.status(201).json({ offer: { id: info.insertId } });
}));

export default router;
