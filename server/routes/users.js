import { Router } from 'express';
import { all, get } from '../db.js';
import { wrap } from '../async.js';
import { requireAuth } from '../auth.js';
import { POST_SELECT, shape } from './posts.js';

const router = Router();
router.use(requireAuth);

// GET /api/users/:id  -> a PUBLIC profile: name, area, member since, trade count + their open posts.
// (email and mobile number are NOT shared here)
router.get('/:id', wrap(async (req, res) => {
  const user = await get('SELECT id, name, area, photo, created_at FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const done = await get(
    `SELECT COUNT(*) AS c FROM trades WHERE status = 'completed' AND (owner_id = ? OR partner_id = ?)`,
    [user.id, user.id]
  );
  const rows = await all(
    `${POST_SELECT} WHERE p.user_id = ? AND p.status = 'open' ORDER BY p.created_at DESC, p.id DESC`,
    [req.userId, user.id]
  );
  res.json({
    user: { ...user, completed_trades: Number(done.c), open_posts: rows.length },
    posts: rows.map(shape),
  });
}));

export default router;
