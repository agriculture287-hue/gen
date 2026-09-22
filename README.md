# GenMusic App - Official Cross-Platform Music & Media Portal

An AI-powered cross-platform music streaming and downloading ecosystem built with **React**, **TypeScript**, **Tailwind CSS**, and **Express**.

---

## 🌟 Key Features

- **Multi-Platform Support**: Downloads and releases for Android (`.apk`), Windows (`.exe`), macOS (`.dmg`), and Linux (`.AppImage`).
- **Live Version Manifests & Cloud Storage**: Real-time sync of updates, platform release binaries, and "What's New" release notes powered by **Vercel Blob Storage**.
- **Monetized Sponsored Content**:
  - Integrated 60-second auto-refreshing ad banners (Leaderboard 728x90, Banner 468x60, Mobile 320x50, Rectangle 300x250, Vertical 160x300, Skyscraper 160x600, and Native containers).
  - High-revenue direct sponsor link integration on download actions.
- **Interactive Downloads Hub**: Clear user guidelines, mirror download links, checksum verification, and "close ad to complete download" notifications.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/your-username/genmusic-app.git
   cd genmusic-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root (refer to `.env.example`):
   ```env
   # Optional: Vercel Blob Read/Write Token for Cloud Storage Sync
   BLOB_READ_WRITE_TOKEN=
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`.

---

## 🛠️ Scripts & Build Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs Express server with Vite middleware on port 3000 |
| `npm run build` | Compiles client assets (`dist/`) and bundles `server.ts` into CommonJS (`dist/server.cjs`) |
| `npm start` | Launches the production bundled server |
| `npm run lint` | Runs TypeScript and ESLint code validation |

---

## 📁 Project Architecture

```
├── server.ts                   # Express server entry point with Vite middleware & REST endpoints
├── src/
│   ├── App.tsx                 # Main application controller & router
│   ├── components/             # React UI components
│   │   ├── AdBanners.tsx       # Auto-refreshing 60s ad banners & sponsor link helper
│   │   ├── AdminModal.tsx      # App release & version management console
│   │   ├── DownloadAppSection.tsx # Primary download modal & platform cards
│   │   ├── DownloadsPage.tsx   # Full downloads page hub
│   │   ├── HeroSection.tsx     # Hero banner with scroll to download triggers
│   │   ├── UpdatesSection.tsx  # "What's New" release notes timeline
│   │   └── ...
│   ├── data/
│   │   └── versionManifest.ts  # Default version manifest state
│   ├── lib/
│   │   └── blobStorage.ts      # Vercel Blob storage client & sync handlers
│   └── types/                  # Shared TypeScript interfaces & types
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore specifications
└── package.json                # Node.js dependencies & scripts
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
