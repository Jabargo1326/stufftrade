import { Router } from 'express';
import { all, get, run } from '../db.js';
import { wrap } from '../async.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/trades -> every trade I'm part of (as the poster or as the person whose offer was chosen)
router.get('/', wrap(async (req, res) => {
  const rows = await all(
    `SELECT t.id, t.status, t.owner_id, t.partner_id, t.created_at, t.completed_at,
            p.title AS post_title, p.category AS post_category, p.photos AS post_photos,
            u.name AS other_name, u.photo AS other_photo
     FROM trades t
     JOIN posts p ON p.id = t.post_id
     JOIN users u ON u.id = IF(t.owner_id = ?, t.partner_id, t.owner_id)
     WHERE t.owner_id = ? OR t.partner_id = ?
     ORDER BY t.created_at DESC, t.id DESC`,
    [req.userId, req.userId, req.userId]
  );
  res.json({
    trades: rows.map((r) => ({
      ...r,
      role: r.owner_id === req.userId ? 'owner' : 'partner',
      post_photos: JSON.parse(r.post_photos || '[]'),
    })),
  });
}));

// loads a trade and checks that the logged-in user is one of the two people in it
async function myTrade(req, res) {
  const t = await get('SELECT * FROM trades WHERE id = ?', [req.params.id]);
  if (!t) { res.status(404).json({ error: 'Trade not found.' }); return null; }
  if (t.owner_id !== req.userId && t.partner_id !== req.userId) {
    res.status(403).json({ error: 'This is not your trade.' });
    return null;
  }
  return { t, role: t.owner_id === req.userId ? 'owner' : 'partner' };
}

// GET /api/trades/:id -> everything for the "Trade details" screen
router.get('/:id', wrap(async (req, res) => {
  const found = await myTrade(req, res);
  if (!found) return;
  const { t, role } = found;

  const post = await get('SELECT id, title, category, description, wants, area, photos FROM posts WHERE id = ?', [t.post_id]);
  const offer = await get('SELECT item, cash, message, photos FROM offers WHERE id = ?', [t.offer_id]);
  // the OTHER person: their mobile number is shown so you can arrange the meet-up
  const other = await get('SELECT id, name, photo, area, mobile FROM users WHERE id = ?', [role === 'owner' ? t.partner_id : t.owner_id]);

  res.json({
    trade: {
      id: t.id,
      status: t.status,
      created_at: t.created_at,
      completed_at: t.completed_at,
      role,
      me_confirmed: !!(role === 'owner' ? t.owner_confirmed : t.partner_confirmed),
      other_confirmed: !!(role === 'owner' ? t.partner_confirmed : t.owner_confirmed),
      post: { ...post, photos: JSON.parse(post.photos || '[]') },
      offer: { ...offer, photos: JSON.parse(offer.photos || '[]') },
      other,
    },
  });
}));

// POST /api/trades/:id/confirm -> "we exchanged the items". The trade is successful once BOTH people confirm.
router.post('/:id/confirm', wrap(async (req, res) => {
  const found = await myTrade(req, res);
  if (!found) return;
  const { t, role } = found;
  if (t.status === 'completed') return res.status(400).json({ error: 'This trade is already completed.' });

  const column = role === 'owner' ? 'owner_confirmed' : 'partner_confirmed';
  await run(`UPDATE trades SET ${column} = 1 WHERE id = ?`, [t.id]);

  const fresh = await get('SELECT owner_confirmed, partner_confirmed FROM trades WHERE id = ?', [t.id]);
  if (fresh.owner_confirmed && fresh.partner_confirmed) {
    await run(`UPDATE trades SET status = 'completed', completed_at = NOW() WHERE id = ?`, [t.id]);
    return res.json({ ok: true, completed: true });
  }
  res.json({ ok: true, completed: false });
}));

export default router;
