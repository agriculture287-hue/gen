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

## 🔗 GenMusic Link Redirection System (Next.js & Vercel Serverless)

GenMusic shares songs using clean redirect links in the format:
```text
https://genmusics.vercel.app/share/<youtubeVideoId>
```

When a user opens this link:
1. **App Installed**: Opens the song directly in the GenMusic native app.
2. **App Not Installed / Fallback**: Displays a branded, dark-themed page (`#7c3aed` purple accent) with song title, artist/channel, and thumbnail, plus links to Google Play and the App Store.

### ⚙️ Environment Variables

Add these to your `.env.local` or Vercel Project Settings (`Settings` -> `Environment Variables`):

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `GENMUSIC_APP_SCHEME` | No | `genmusic` | Custom URL scheme registered by your mobile app (e.g. `genmusic://play?v=<id>`) |
| `GENMUSIC_PACKAGE_NAME` | No | `in.gen.agrigence` | Android package name for `intent://` URL resolution |
| `GENMUSIC_PLAY_STORE_URL` | No | `https://play.google.com/store/apps/details?id=in.gen.agrigence` | Play Store listing URL used as Android fallback |
| `GENMUSIC_APP_STORE_URL` | No | `https://apps.apple.com/app/genmusic/id123456789` | iOS App Store listing URL |

### 🚀 Deploying to Vercel

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Add GenMusic link redirect system"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository.
   - Add the environment variables listed above if customizing package name or store URLs.
   - Click **Deploy**.

3. **Deploy via Vercel CLI (alternative)**:
   ```bash
   npm i -g vercel
   vercel
   vercel --prod
   ```

### 📱 Deep Link Implementation Details

- **Android Chrome**: Dispatches an `intent://` URI with fallback:
  ```text
  intent://play?v=<id>#Intent;scheme=genmusic;package=in.gen.agrigence;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Din.gen.agrigence;end
  ```
- **iOS Safari**: Triggers the custom scheme `genmusic://play?v=<id>`.
- **Desktop Browsers**: Immediately displays the fallback card with direct store links and "Open in GenMusic".
- **Visibility Detection**: Monitors the `visibilitychange` event. If the browser tab is hidden within ~1.5 seconds, the OS successfully opened the native app. If the tab stays visible, the fallback store card is revealed.
- **Serverless Metadata**: `pages/api/meta.js` and `pages/share/[id].js` utilize YouTube's public oEmbed endpoint and `i.ytimg.com` CDN without requiring any API keys or OAuth.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
