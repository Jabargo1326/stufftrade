import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadDir = path.join(__dirname, 'uploads'); // only used for older photos saved as files

// Photos are kept in memory just long enough to save them in the database.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 }, // 5 MB each, max 3 photos
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

// Saves uploaded photos in the "images" table and returns their urls (e.g. "/api/images/12").
export async function saveImages(files = []) {
  const urls = [];
  for (const f of files) {
    const info = await run('INSERT INTO images (mime, data) VALUES (?, ?)', [f.mimetype, f.buffer]);
    urls.push(`/api/images/${info.insertId}`);
  }
  return urls;
}
