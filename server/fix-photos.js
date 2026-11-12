// Adds the demo pictures to the demo posts that are ALREADY in your database,
// without deleting anything (your own accounts and posts stay untouched).
// Run with:  npm run fix-photos
import { initDb, get, run, closeDb } from './db.js';

await initDb();

// [post title, owner's email, picture file in client/public/demo/]
const demo = [
  ['Mountain bike', 'mika@email.com', '/demo/mountain-bike.jpg'],
  ['Acoustic guitar', 'ken@email.com', '/demo/acoustic-guitar.jpg'],
  ['Nursing books', 'ana@email.com', '/demo/nursing-books.jpg'],
  ['Rice cooker', 'jun@email.com', '/demo/rice-cooker.jpg'],
  ['Study lamp', 'tony@email.com', '/demo/study-lamp.jpg'],
  ['Road bike helmet', 'tony@email.com', '/demo/road-bike-helmet.jpg'],
  ['Old novels', 'tony@email.com', '/demo/old-novels.jpg'],
];

let updated = 0;
for (const [title, email, file] of demo) {
  const res = await run(
    `UPDATE posts p JOIN users u ON u.id = p.user_id
     SET p.photos = ? WHERE p.title = ? AND u.email = ? AND p.photos = '[]'`,
    [JSON.stringify([file]), title, email]
  );
  updated += res.affectedRows;
}
console.log(`Added pictures to ${updated} existing post(s).`);

// two extra demo posts that use the new pictures (only added if they don't exist yet)
const extra = [
  ['ana@email.com', 'Electric fan', 'Home', 'Stand fan with 3 speeds and remote. Works great.', 'Rice cooker', 'Buhangin', '/demo/electric-fan.jpg'],
  ['jun@email.com', 'iPhone 13', 'Gadgets', 'Starlight, 128GB, battery health 89%. With case.', 'Laptop or cash', 'Lanang', '/demo/iphone-13.jpg'],
];
let added = 0;
for (const [email, title, category, description, wants, area, photo] of extra) {
  const user = await get('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) continue;
  if (await get('SELECT id FROM posts WHERE user_id = ? AND title = ?', [user.id, title])) continue;
  await run(
    'INSERT INTO posts (user_id,title,category,description,wants,area,photos) VALUES (?,?,?,?,?,?,?)',
    [user.id, title, category, description, wants, area, JSON.stringify([photo])]
  );
  added++;
}
console.log(`Added ${added} new demo post(s). Done!`);
await closeDb();
