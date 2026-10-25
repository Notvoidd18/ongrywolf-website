# Ongrywolf — Official Startup Website & Bot Management Platform

A high-performance, dark-themed technology studio website and private administrative portal built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **PostgreSQL**.

---

## 🎨 Theme & Visual Direction

- **Sharp Blue and Black Aesthetic**: Deep obsidian backgrounds (`#06090F`), dark navy surface cards (`#0B111E`), midnight borders (`#1C2A42`), and sharp electric blue / cyan accents (`#0EA5E9`, `#0284C7`, `#38BDF8`).
- **Zero purple gradients**: Minimal, technical, gaming/developer studio identity.
- **Micro-Interactions**: Real-time role switcher widget, interactive Discord `.env` self-hosting generator, and status indicators.

---

## 🚀 Available Routes

### 1. Public Showcase
- `/` — Homepage: Hero (*"Built for worlds beyond ordinary."*), 4 featured service verticals, selected work, studio philosophy, and project request CTA.
- `/products` — Products & Services hub.
- `/products/plugins` — Minecraft Plugins & Custom Mobs (Paper 1.20-1.21+, MythicMobs, TPS optimization).
- `/products/discord-bots` — Ongrywolf Multi-Bot Platform showcase (Main & Bot A concurrent runtime).
- `/products/client` — Custom Minecraft Client (FPS optimizations, clean blue HUD, closed beta status).
- `/products/builds` — High-Quality Builds (spawns, arenas, dungeons, FAWE schematics).
- `/work` — Portfolio with technical milestones and tags.
- `/contact` — Project request form with validation, loading states, and database storage.

### 2. User Discord Bot Dashboard (Protected)
- `/dashboard` — Overview, current plan & 7-day trial status indicator, feature availability.
- `/dashboard/bots` — Bot configuration builder (Application ID, prefix, status preset, logging channel) + **1-click Self-Host Export Generator (`.env`)**.
- `/dashboard/settings` — Account profile, linked Discord account, session details.

### 3. Private Admin Panel (RBAC Protected: OWNER, ADMIN, SUPPORT)
- `/admin` — System Overview (real user count, active/expired trials, registered bot templates, recent activity).
- `/admin/users` — User management (search/filter, roles: OWNER / ADMIN / SUPPORT / USER, account suspend/restore).
- `/admin/permissions` — Granular feature capability matrix per user.
- `/admin/trials` — 7-day trial management (extend +7 days, revoke, auto-expiry).
- `/admin/bots` — Registered bot configurations manager (inspect and purge invalid profiles).
- `/admin/audit-logs` — Tamper-evident ledger of administrative events.

---

## 🔐 Security & Self-Hosting Standard

- **No Bot Token Custody**: We never ask users for Discord bot tokens on the website. Tokens remain exclusively in the user's hosting environment.
- **Application IDs Only**: Users input public Application IDs to build configurations.
- **Server-Side RBAC**: Protected admin routes and APIs (`/admin/*`, `/api/admin/*`) enforce authorization on the server.

---

## 🛠️ Quickstart

### 1. Install & Run Locally
```bash
# From website directory
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build
```bash
npm run build
npm start
```

### 3. Environment Variables (Optional)
If connecting to an existing PostgreSQL database:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```
*(If unset, the application automatically uses its seeded memory store for instant preview and development).*
