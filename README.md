# Seavy

Telegram Mini App untuk mencatat mood harian, dengan kalender visual (mirip GitHub
contribution graph), statistik streak, dan grafik tren mood mingguan.

- **Backend**: Node.js + Express, dijalankan sebagai satu serverless function di Vercel (`/api`)
- **Frontend**: React (Vite) + Tailwind CSS
- **Database**: Supabase (Postgres)
- **Bot**: node-telegram-bot-api, mode webhook (bukan polling)
- **Chart**: Recharts

Semua request dari mini app ke API divalidasi menggunakan `initData` dari Telegram
WebApp SDK (HMAC-SHA256 dengan bot token) — lihat [api/_lib/telegramAuth.js](api/_lib/telegramAuth.js).
Tidak ada endpoint yang bisa diakses tanpa `initData` yang valid dan baru (maks. 24 jam).

---

## 1. Struktur project

```
/api                     → Express app, jalan sebagai 1 serverless function di Vercel
  index.js                 route: /api/mood, /api/stats, /api/bot-webhook, /api/health
  _lib/
    telegramAuth.js         validasi initData (HMAC dengan bot token)
    supabase.js              Supabase client (service role key)
    db.js                    query ke tabel users & mood_entries
    stats.js                 hitung mood terbanyak & streak
    moods.js                 daftar emoji mood yang valid
    bot.js                   logic bot: /start, handler webhook

/src                      → Frontend React
  components/
    MoodPicker.jsx           pilih emoji + catatan, submit mood hari ini
    Calendar.jsx              grid kalender bulanan + navigasi bulan
    DayModal.jsx               popup detail mood saat tanggal diklik
    StatsCard.jsx              mood terbanyak & streak
    MoodChart.jsx              grafik tren 7 hari terakhir
  lib/
    telegram.js               helper Telegram WebApp SDK (initData, theme, dst)
    api.js                    fetch wrapper ke /api dengan header initData
    moods.js, date.js          util bersama
  App.jsx, main.jsx, index.css

/supabase/schema.sql      → schema database (jalankan di Supabase SQL editor)
/scripts
  setWebhook.js             daftarkan webhook bot ke Telegram
  generateTestInitData.js    generate initData palsu (bertanda tangan valid) untuk test lokal via curl

vercel.json                → rewrite semua /api/* ke satu function api/index.js
.env.example               → semua environment variable yang dibutuhkan
```

---

## 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (gratis).
2. Buka **SQL Editor** → **New query**, paste isi file [supabase/schema.sql](supabase/schema.sql), lalu **Run**.
   Ini membuat tabel `users`, `mood_entries`, constraint unique (1 entry per user per tanggal), dan mengaktifkan RLS.
3. Buka **Project Settings → API**, catat:
   - `Project URL` → jadi `SUPABASE_URL`
   - `anon public` key → jadi `SUPABASE_ANON_KEY` (tidak dipakai langsung oleh server, disimpan untuk keperluan lain)
   - `service_role` key → jadi `SUPABASE_SERVICE_ROLE_KEY` — **rahasia**, jangan pernah taruh di kode frontend atau commit ke git. Hanya dipakai oleh `/api` di server.

---

## 3. Setup Bot via BotFather

1. Buka chat [@BotFather](https://t.me/BotFather) di Telegram.
2. Kirim `/newbot`, ikuti instruksi (nama bot, username harus diakhiri `bot`, mis. `mooddiary_bot`).
3. BotFather akan memberikan **token** — ini jadi `TELEGRAM_BOT_TOKEN`. Simpan baik-baik, jangan dibagikan.
4. (Opsional tapi disarankan) Kirim `/setdescription` dan `/setuserpic` untuk mempercantik profil bot.

Web App URL dan webhook akan didaftarkan **setelah** deploy ke Vercel (langkah 6 & 7), karena butuh URL publik.

---

## 4. Install & konfigurasi lokal

```bash
npm install
cp .env.example .env
```

Isi `.env` dengan `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN` dari langkah 2 & 3.
`WEBAPP_URL` dan `API_URL` bisa diisi setelah deploy (langkah 6).

---

## 5. Test backend secara lokal (sebelum sentuh frontend)

Jalankan API sebagai Express server biasa di `localhost:3001`:

```bash
npm run dev:api
```

Cek health check:

```bash
curl http://localhost:3001/api/health
# {"ok":true}
```

Endpoint `/api/mood` dan `/api/stats` menolak request tanpa `initData` Telegram yang valid
(ini disengaja — lihat catatan keamanan di atas). Untuk test dari curl tanpa harus buka Telegram,
generate `initData` palsu tapi **bertanda tangan valid** menggunakan `TELEGRAM_BOT_TOKEN` di `.env`:

```bash
npm run gen-test-initdata
# cetak string initData, mis: user=%7B...%7D&auth_date=...&hash=...

curl "http://localhost:3001/api/mood?month=2026-07" \
  -H "X-Telegram-Init-Data: <paste hasil di atas>"

curl -X POST http://localhost:3001/api/mood \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Init-Data: <paste hasil di atas>" \
  -d '{"date":"2026-07-27","mood_emoji":"😄","note":"Hari yang bagus"}'
```

Kalau `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` di `.env` sudah benar, user baru otomatis
dibuat di tabel `users` saat request pertama, dan entry mood tersimpan di `mood_entries`.

---

## 6. Test frontend secara lokal

```bash
npm run dev
```

Buka `http://localhost:5173`. Karena `window.Telegram.WebApp` tidak tersedia di browser biasa,
kamu akan melihat pesan "buka dari bot Telegram" — ini normal (mini app memang dirancang
hanya berjalan di dalam Telegram). Untuk uji end-to-end sungguhan, lanjut ke langkah 7–9
(deploy dulu, baru buka lewat bot).

`vite.config.js` sudah di-set agar `/api/*` di-proxy ke `localhost:3001`, jadi `npm run dev`
+ `npm run dev:api` bisa jalan bersamaan kalau kamu ingin coba UI dengan data asli (meski
tetap butuh trik untuk menyuntik `initData`, mis. lewat DevTools — untuk kebanyakan kasus
lebih gampang langsung test di Telegram setelah deploy).

---

## 7. Deploy ke Vercel

1. Install Vercel CLI kalau belum: `npm i -g vercel`
2. Dari root project: `vercel` (ikuti prompt untuk link/create project), lalu `vercel --prod` untuk deploy production.
   Atau: push project ini ke GitHub, lalu import repo-nya di [vercel.com/new](https://vercel.com/new) — Vercel otomatis
   mendeteksi Vite untuk frontend, dan `vercel.json` sudah mengatur semua request `/api/*` masuk ke `api/index.js`.
3. Di **Vercel Project → Settings → Environment Variables**, tambahkan semua variabel dari `.env.example`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `WEBAPP_URL` → isi dengan domain Vercel kamu, mis. `https://mooddiary.vercel.app`
   - `API_URL` → sama dengan `WEBAPP_URL`
   - `TELEGRAM_WEBHOOK_SECRET` → string acak, mis. hasil dari `openssl rand -hex 32`
4. Redeploy setelah menambah env var (`vercel --prod` lagi, atau klik "Redeploy" di dashboard).
5. Update `.env` lokal kamu juga dengan `WEBAPP_URL`/`API_URL` yang sama, dipakai oleh script di langkah 8.

---

## 8. Daftarkan webhook bot ke Telegram

Setelah deploy sukses dan `.env` lokal berisi `API_URL` yang benar:

```bash
npm run set-webhook
```

Script ini memanggil `setWebhook` Telegram API dengan `https://<domain-kamu>/api/bot-webhook`
dan `secret_token` dari `TELEGRAM_WEBHOOK_SECRET` (kalau diisi). Cek hasilnya:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

`url` harus menunjuk ke `/api/bot-webhook` dan `pending_update_count` idealnya 0.

---

## 9. Daftarkan Mini App URL ke BotFather

Ini yang membuat tombol "Buka Seavy" di `/start` benar-benar bisa membuka web app, dan
juga (opsional) memasang tombol menu di pojok kiri bawah chat.

1. Chat @BotFather → `/mybots` → pilih bot kamu.
2. **Bot Settings → Menu Button → Configure menu button** → masukkan URL Vercel kamu
   (mis. `https://mooddiary.vercel.app`) dan judul, mis. "Buka Seavy".
3. (Opsional, untuk Mini App terdaftar penuh dengan nama & ikon di direktori Telegram)
   `/newapp` → pilih bot kamu → isi nama, deskripsi, foto/gif, lalu masukkan URL yang sama.

---

## 10. Coba end-to-end

1. Buka bot kamu di Telegram, kirim `/start`.
2. Bot membalas welcome message dengan tombol **"📔 Buka Seavy"**.
3. Tap tombol → mini app terbuka, tema otomatis mengikuti dark/light Telegram kamu.
4. Pilih emoji mood, isi catatan (opsional), submit → tombol berubah jadi "Sudah diisi hari ini ✓".
5. Cek kalender bulan ini menampilkan emoji di tanggal hari ini.
6. Klik tanggal yang sudah ada datanya → modal menampilkan emoji + catatan.
7. Isi mood beberapa hari (ubah tanggal sistem untuk test streak, atau tunggu beberapa hari
   sungguhan) untuk melihat statistik streak & grafik tren 7 hari berjalan.

---

## Troubleshooting

- **401 "Unauthorized: missing initData" / "hash mismatch"** — pastikan `TELEGRAM_BOT_TOKEN` di
  Vercel sama persis dengan token bot yang membuka mini app itu, dan mini app dibuka dari dalam
  Telegram (bukan browser biasa / URL di-share manual).
- **401 di webhook bot** — pastikan `TELEGRAM_WEBHOOK_SECRET` di Vercel sama dengan yang dipakai
  saat `npm run set-webhook` dijalankan terakhir kali.
- **Bot tidak balas `/start`** — cek `getWebhookInfo` (langkah 8), lihat field `last_error_message`.
  Biasanya karena `TELEGRAM_BOT_TOKEN` salah atau webhook belum terdaftar.
- **Data mood tidak muncul di kalender** — cek log function di Vercel dashboard; error paling
  umum adalah `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_URL` salah atau schema belum dijalankan.
- **Streak/statistik terlihat aneh dekat pergantian bulan/hari** — perhitungan streak & "hari
  ini" memakai tanggal lokal perangkat pengguna (dikirim oleh frontend), bukan waktu server.

## Catatan keamanan

- `SUPABASE_SERVICE_ROLE_KEY` dan `TELEGRAM_BOT_TOKEN` **hanya** boleh berada di environment
  variable server (Vercel), tidak pernah di kode frontend (`/src`) atau ter-commit ke git.
- Setiap request ke `/api/mood` dan `/api/stats` wajib membawa header `X-Telegram-Init-Data`
  yang valid; server memverifikasi tanda tangannya dengan bot token sebelum memproses apa pun
  (lihat `requireTelegramAuth` di [api/index.js](api/index.js)).
- RLS di Supabase aktif di kedua tabel tanpa policy publik — hanya `service_role` key (dipegang
  server) yang bisa membaca/menulis, jadi kalau `anon key` bocor pun database tetap aman.
#   f e e l a n d a r  
 