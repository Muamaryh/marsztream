# 🎮 MarszLive - IME Roleplay Multi-Stream Hub

**MarszLive** adalah platform livestream hub multi-sudut pandang (Multi-View) khusus server **IME Roleplay GTA V (#imeroleplay / #imerp)** dengan gaya visual **Saweria Neo-Brutalist 2D**, deteksi live otomatis, pengelompokan gang/fraksi cerdas, dan integrasi YouTube Live Chat.

---

## ✨ Fitur Utama

- 🔴 **Auto-Detect Livestream IME Roleplay**: Mendeteksi seluruh streamer YouTube yang sedang live di server IME Roleplay secara real-time.
- ⚔️ **Smart Gang & Faction Grouping**: Otomatis mengekstrak hashtag & mengelompokkan streamer ke kubu masing-masing (*Vagabond, KZN, 4Blood, Olsen, Police/PD, CEO KOPAT, Borgen, Dobrak, dll.*).
- 🎬 **Multi-View Grid (Mabar & War Mode)**: Tonton 1, 2 (Dual Split), 3, atau 4 (Quad Grid) livestream secara bersamaan dalam 1 layar.
- 💬 **Live Chat & Popout Auto-Login**: Live chat terintegrasi dengan latar belakang kontras tinggi + tombol *⚡ Popout Chat* untuk kirim chat tanpa login ulang di browser.
- 🎨 **Neo-Brutalist 2D & Theme Switcher**: Desain retro Saweria dengan dukungan Tema Terang (☀️) dan Tema Gelap (🌙).
- ⚡ **High Performance & GPU Composited**: Beban scroll ringan dan mulus (120Hz/144Hz) tanpa stuttering.

---

## 🚀 Memulai (Local Development)

1. **Clone repository**:
   ```bash
   git clone https://github.com/Muamaryh/marsztream.git
   cd marsztream
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```

4. **Buka di browser**:
   Buka [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Neo-Brutalist 2D Theme)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching & Caching**: SWR + Next.js Route Handlers
- **Typography**: Plus Jakarta Sans & JetBrains Mono

---

## 📄 Lisensi

MIT License. Dibuat untuk komunitas roleplay Indonesia.
