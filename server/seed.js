// Fills the database with demo users, posts and offers so the app isn't empty.
// Run with:  npm run seed      (safe to run again - it wipes and re-creates the demo data)
import { initDb, closeDb } from './db.js';
import { seedDemo } from './seedData.js';

await initDb();
await seedDemo();
await closeDb();
