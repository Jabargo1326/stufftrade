import { Router } from 'express';
import { all, get, run, getConnection } from '../db.js';
import { wrap } from '../async.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/offers/mine -> offers I sent on other people's posts
router.get('/mine', wrap(async (req, res) => {
  const rows = await all(
    `SELECT o.*, p.title AS post_title, p.photos AS post_photos, p.category AS post_category
     FROM offers o JOIN posts p ON p.id = o.post_id
     WHERE o.user_id = ? ORDER BY o.created_at DESC, o.id DESC`,
    [req.userId]
  );
  res.json({
    offers: rows.map((o) => ({ ...o, photos: JSON.parse(o.photos || '[]'), post_photos: JSON.parse(o.post_photos || '[]') })),
  });
}));

// helper: load an offer + make sure the logged-in user owns the post it's on
async function ownedOffer(req, res) {
  const offer = await get('SELECT * FROM offers WHERE id = ?', [req.params.id]);
  if (!offer) { res.status(404).json({ error: 'Offer not found.' }); return null; }
  const post = await get('SELECT * FROM posts WHERE id = ?', [offer.post_id]);
  if (post.user_id !== req.userId) { res.status(403).json({ error: 'This is not your post.' }); return null; }
  return { offer, post };
}

// POST /api/offers/:id/choose -> accept this offer, decline the rest, mark post as traded
router.post('/:id/choose', wrap(async (req, res) => {
  const found = await ownedOffer(req, res);
  if (!found) return;
  const { offer, post } = found;
  if (post.status !== 'open' || offer.status !== 'pending')
    return res.status(400).json({ error: 'This offer can no longer be chosen.' });

  // a transaction = all three updates happen, or none of them do
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE offers SET status = 'chosen' WHERE id = ?`, [offer.id]);
    await conn.query(`UPDATE offers SET status = 'declined' WHERE post_id = ? AND id != ? AND status = 'pending'`, [post.id, offer.id]);
    await conn.query(`UPDATE posts SET status = 'traded' WHERE id = ?`, [post.id]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  const who = await get('SELECT name, mobile FROM users WHERE id = ?', [offer.user_id]);
  res.json({ ok: true, offerer: { name: who.name, mobile: who.mobile } });
}));

// POST /api/offers/:id/decline
router.post('/:id/decline', wrap(async (req, res) => {
  const found = await ownedOffer(req, res);
  if (!found) return;
  if (found.offer.status !== 'pending') return res.status(400).json({ error: 'Already answered.' });
  await run(`UPDATE offers SET status = 'declined' WHERE id = ?`, [found.offer.id]);
  res.json({ ok: true });
}));

export default router;
