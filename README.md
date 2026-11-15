# StuffTrade 🔁

A local trading mobile website: post something you want to trade, browse what people nearby are offering,
make offers (an item, cash, or both), and choose the offer you like best.

| Part      | Tech                                   | Folder    |
|-----------|----------------------------------------|-----------|
| Frontend  | React 18 + React Router, built with Vite | `client/` |
| Backend   | Node.js + Express (REST API, JWT login) | `server/` |
| Database  | MySQL (via the `mysql2` package)       | `server/db.js` |

## Requirements
* **Node.js 18 or newer** (https://nodejs.org → LTS). Check with `node -v`.
* **MySQL** running on your computer. Easiest: **XAMPP** (https://www.apachefriends.org) → open the XAMPP
  Control Panel → press **Start** next to **MySQL**. (MySQL Installer / MySQL Workbench also works.)
* **VS Code** (or any editor) and **GitHub Desktop**.

## One-time database setup
1. Start MySQL (XAMPP → Start next to MySQL).
2. In the `server` folder, copy `.env.example` and rename the copy to **`.env`**.
3. Open `.env` and set `DB_PASSWORD`. XAMPP's default is **empty** (leave it blank); with MySQL Installer use the
   password you chose. You do NOT need to create the database or tables yourself — the server creates the
   `stufftrade` database and all tables the first time it starts.
4. To look at your data: XAMPP → **Admin** next to MySQL (phpMyAdmin), or MySQL Workbench.

## Run it (two terminals)

```bash
# 1) once: install everything
npm run install-all

# 2) once: create demo users/posts (optional but recommended)
npm run seed

# 3) Terminal A - backend  (http://localhost:3001)
npm run server

# 4) Terminal B - frontend (http://localhost:5173)
npm run client
```

Open **http://localhost:5173** and press **F12 → device toolbar** to see the phone view.
Demo login: `tony@email.com` / `password123` (others: mika@, ken@, ana@, jun@ — same password).

**Anyone can use the app:** on the Log In screen tap **Sign up**, create an account, and you're in. Every account
has its own posts, offers, saved list and profile. The demo accounts only exist to make the app look full.
(To test two people on one computer: log out first, or use a private/incognito window for the second person.)

**Test on your real phone:** connect the phone to the same Wi-Fi as your laptop and open
`http://<your-laptop-ip>:5173` (the terminal prints it as "Network").

## How the project is organised

```
stufftrade/
├─ server/
│  ├─ index.js          starts Express, mounts the routes
│  ├─ db.js             connects to MySQL + creates the tables (users, posts, offers, saved)
│  ├─ .env.example      copy to .env and put your MySQL password in it
│  ├─ auth.js           JWT login check
│  ├─ upload.js         photo uploads (multer) -> server/uploads/
│  ├─ seed.js           demo data
│  └─ routes/           auth.js · posts.js · offers.js
└─ client/
   ├─ index.html        has the responsive <meta viewport> tag
   └─ src/
      ├─ styles.css     ALL the styling + responsive breakpoints
      ├─ api.js         every call to the backend
      ├─ App.jsx        the list of pages (routes)
      ├─ pages/         one file per screen in your Figma
      └─ components/    reusable pieces (nav bar, cards, modal, ...)
```

## Figma screen → page file

| Figma screens | File |
|---|---|
| Splash / Onboarding 1-4 | `pages/Splash.jsx`, `pages/Onboarding.jsx` |
| Log In (+ error) / Sign Up | `pages/Login.jsx`, `pages/Signup.jsx` |
| Home / Search / No Results | `pages/Home.jsx` |
| Trade Post / Saved / Make Offer | `pages/PostDetail.jsx` |
| Offer Sent / Post Published / Offer Chosen | `pages/Done.jsx` |
| Saved (empty) | `pages/Saved.jsx` |
| Create Post / Edit Post / Delete Confirm | `pages/PostForm.jsx` |
| Profile / Log Out Dialog | `pages/Profile.jsx` |
| My Posts / Post Deleted | `pages/MyPosts.jsx` |
| My Post Detail (owner view) | `pages/PostDetail.jsx` |
| Offers on My Post / Choose Offer Confirm | `pages/PostOffers.jsx` |
| Offers tabs / Empty | `pages/Offers.jsx` |
| Edit Profile | `pages/EditProfile.jsx` |

## Photos
* **Posts made in the app:** *Create post* → tap the **+** square → pick up to 3 pictures. A preview shows right
  away. Photos are shrunk automatically and saved inside the database (table `images`).
* **Demo posts (from `npm run seed`):** their pictures are in `client/public/demo/`. To use your own photo, put the
  jpg in that folder and change the file name in `server/seed.js`, then run `npm run seed` again.
* Demo posts show no picture? Run `npm run fix-photos` (adds them, and two extra demo posts, without deleting anything).
  `npm run seed` also adds them, but it **wipes the whole database**, including accounts people created.
* A post with no picture (or a missing file) shows an emoji tile instead.

## Responsive design (where to look)
`client/src/styles.css`, top comment explains it. In short:
* `index.html` has `width=device-width` so phones don't zoom out.
* Phones: 2-column card grid, bottom navigation bar (exactly like the Figma).
* ≥ 640px (tablet): more columns, bigger padding, pop-ups become centered boxes.
* ≥ 1024px (laptop): the bottom bar becomes a left sidebar; post page shows photo + details side by side.
* Grids use `repeat(auto-fill, minmax(...))`, so they adapt on their own.

## Main API routes
`POST /api/auth/signup` · `POST /api/auth/login` · `GET/PUT /api/auth/me` ·
`GET/POST /api/posts` · `GET/PUT/DELETE /api/posts/:id` · `POST /api/posts/:id/save` ·
`GET/POST /api/posts/:id/offers` · `GET /api/offers/mine` · `POST /api/offers/:id/choose|decline`

## Deploying to the internet

### Option A: Railway - website + MySQL in one dashboard (paid after a ~30 day trial, about $5/month)
1. Push the project to GitHub (GitHub Desktop → Commit → Push origin).
2. railway.com → log in with GitHub → **New Project → Deploy from GitHub repo** → pick `stufftrade`.
3. In the project: **+ Create → Database → Add MySQL**.
4. Click your app service → **Variables**, add:
   * `DATABASE_URL` = `${{MySQL.MYSQL_URL}}`   (links the app to the database)
   * `JWT_SECRET` = any long random text
   * `SEED_DEMO` = `true`   (adds the demo users/posts, only when the database is empty)
5. App service → **Settings**: Build Command `npm run build`, Start Command `npm start`.
   Then **Networking → Generate Domain**.
6. Wait for the deploy to finish, then open the generated link.

### Option B (FREE, recommended): Render (free website) + TiDB Cloud (free MySQL)
Render hosts the website + API as ONE web service. Render has no MySQL, so the database lives on
**TiDB Cloud Starter** (free, MySQL-compatible). Photos are stored inside the database, so they survive restarts.
1. Push the project to GitHub.
2. TiDB Cloud (tidbcloud.com): create a free **Starter** instance (MySQL-compatible) → **Connect** →
   copy host, port (4000), user, password. The database name is `test`.
3. Render (render.com) → **New → Web Service** → pick your repo.
   * Build Command: `npm run build`   * Start Command: `npm start`   * Instance Type: **Free**
   * Environment variables: `DB_HOST`, `DB_PORT` (4000), `DB_USER`, `DB_PASSWORD`, `DB_NAME` (test),
     `DB_SSL` (true), `JWT_SECRET` (any long random text), `SEED_DEMO` (true). Do NOT set `PORT`.
4. **Create Web Service**, wait for "Your service is live", open the `onrender.com` link.
Free Render services fall asleep after 15 minutes without visitors; the next visit takes about a minute.

## Troubleshooting
* **"Cannot GET /" at http://localhost:3001** → normal! That port is only the backend (API). The website is at
  **http://localhost:5173**. (The backend now shows a small info page there.)
* "Could not connect to MySQL" / `ECONNREFUSED` → MySQL isn't running (start it in XAMPP).
* `Access denied for user 'root'` → wrong `DB_PASSWORD` in `server/.env`.
* "Cannot reach the server" in the app → the backend terminal isn't running or crashed (read its error).
* Port already in use → close the old terminal, or run `PORT=3002 npm run server` (and change the port in `client/vite.config.js`).
* Want a fresh database? Run `npm run seed` again (it wipes and re-creates the demo data), or drop the `stufftrade` database in phpMyAdmin.
