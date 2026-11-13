import { Router } from 'express';
import { get } from '../db.js';
import { wrap } from '../async.js';

const router = Router();

// GET /api/images/:id  -> the photo itself (public, so <img> tags can load it)
router.get('/:id', wrap(async (req, res) => {
  const img = await get('SELECT mime, data FROM images WHERE id = ?', [req.params.id]);
  if (!img) return res.status(404).end();
  res.set('Content-Type', img.mime);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(img.data);
}));

export default router;
