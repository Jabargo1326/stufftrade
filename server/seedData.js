// The demo users, posts and offers. Used by `npm run seed` and by SEED_DEMO=true (see index.js).
import bcrypt from 'bcryptjs';
import { run } from './db.js';

// Wipes everything and re-creates the demo data.
export async function seedDemo() {

  // children first, then parents (foreign keys)
  for (const t of ['saved', 'trades', 'offers', 'posts', 'users']) {
    await run(`DELETE FROM ${t}`);
    if (t !== 'saved') await run(`ALTER TABLE ${t} AUTO_INCREMENT = 1`).catch(() => {}); // not every host allows this; harmless to skip
  }

  const hash = bcrypt.hashSync('password123', 10);
  const addUser = async (name, email, mobile, area) =>
    (await run('INSERT INTO users (name,email,mobile,area,password_hash) VALUES (?,?,?,?,?)', [name, email, mobile, area, hash])).insertId;

  const tony = await addUser('Tony Reyes', 'tony@email.com', '+639000000000', 'Matina');
  const mika = await addUser('Mika Santos', 'mika@email.com', '+639111111111', 'Matina');
  const ken  = await addUser('Ken Lopez',  'ken@email.com',  '+639222222222', 'Toril');
  const ana  = await addUser('Ana Cruz',   'ana@email.com',  '+639333333333', 'Buhangin');
  const jun  = await addUser('Jun Dela Cruz', 'jun@email.com', '+639444444444', 'Lanang');

  // photos = list of image urls. The demo pictures live in client/public/demo/ (served as /demo/...).
  // To use your own: put your jpg in that folder and change the file name here.
  const addPost = async (user, title, category, description, wants, area, status = 'open', photos = []) =>
    (await run(
      'INSERT INTO posts (user_id,title,category,description,wants,area,status,photos) VALUES (?,?,?,?,?,?,?,?)',
      [user, title, category, description, wants, area, status, JSON.stringify(photos)]
    )).insertId;

  const bike   = await addPost(mika, 'Mountain bike', 'Sports', '21-speed, new tires. Small scratches on the frame.', 'Laptop or cash', 'Matina', 'open', ['/demo/mountain-bike.jpg']);
  const guitar = await addPost(ken, 'Acoustic guitar', 'Music', 'Beginner guitar with a soft case and extra strings.', 'Keyboard', 'Toril', 'open', ['/demo/acoustic-guitar.jpg']);
  const books  = await addPost(ana, 'Nursing books', 'Books', 'Set of 8 nursing textbooks, good condition.', 'Any gadget', 'Buhangin', 'open', ['/demo/nursing-books.jpg']);
  const rice   = await addPost(jun, 'Rice cooker', 'Home', '1.8L rice cooker, works perfectly.', 'Electric fan', 'Lanang', 'open', ['/demo/rice-cooker.jpg']);

  await addPost(ana, 'Electric fan', 'Home', 'Stand fan with 3 speeds and remote. Works great.', 'Rice cooker', 'Buhangin', 'open', ['/demo/electric-fan.jpg']);
  await addPost(jun, 'iPhone 13', 'Gadgets', 'Starlight, 128GB, battery health 89%. With case.', 'Laptop or cash', 'Lanang', 'open', ['/demo/iphone-13.jpg']);

  const lamp   = await addPost(tony, 'Study lamp', 'Home', 'LED desk lamp, three brightness levels, works well.', 'Books', 'Matina', 'open', ['/demo/study-lamp.jpg']);
  const helmet = await addPost(tony, 'Road bike helmet', 'Sports', 'Size M, barely used.', 'Cycling gloves', 'Matina', 'open', ['/demo/road-bike-helmet.jpg']);
  const novels = await addPost(tony, 'Old novels', 'Books', 'Box of 12 paperback novels.', 'Board game', 'Matina', 'traded', ['/demo/old-novels.jpg']);

  const addOffer = (post, user, item, cash, message = '', status = 'pending') =>
    run('INSERT INTO offers (post_id,user_id,item,cash,message,photos,status) VALUES (?,?,?,?,?,?,?)',
      [post, user, item, cash, message, '[]', status]);

  await addOffer(lamp, mika, 'Two novels and a phone stand', 100);
  await addOffer(lamp, ken, '', 300, 'Cash only');
  await addOffer(lamp, ana, 'Reading light and a book', 0);
  await addOffer(helmet, ken, 'Cycling gloves', 0, 'Can meet at the plaza');
  const novelsOffer = (await addOffer(novels, mika, 'Board game (Uno + Monopoly)', 0, '', 'chosen')).insertId;
  // a finished trade, so the "completed trades" numbers and "My trades" aren't empty
  await run(
    `INSERT INTO trades (post_id, offer_id, owner_id, partner_id, owner_confirmed, partner_confirmed, status, completed_at)
     VALUES (?, ?, ?, ?, 1, 1, 'completed', NOW())`,
    [novels, novelsOffer, tony, mika]
  );
  await addOffer(bike, tony, 'Old keyboard, barely used', 500, 'Can meet at the plaza on Saturday');
  await addOffer(bike, ken, 'Used laptop', 0, 'Slow but works');
  await addOffer(bike, ana, 'Gaming headset', 800);
  await addOffer(rice, tony, 'Electric fan', 0);

  console.log('Demo data added. Log in with  tony@email.com  /  password123');
}
