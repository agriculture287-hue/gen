# GEN MUSIC - Production Multi-Platform Update System Guide

This document describes the complete architecture, endpoints, client integrations, and release pipelines for the **GEN MUSIC** automatic update system across **Android (.apk)**, **Windows (.exe)**, and **macOS (.dmg)**.

---

## 1. System Architecture Overview

```
                     ┌────────────────────────┐
                     │ https://genmugic.vercel.app │
                     │     /version.json      │
                     └───────────┬────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│   Android Client   │ │   Windows Client   │ │    macOS Client    │
│    (Capacitor)     │ │  (Electron NSIS)   │ │  (Electron DMG)    │
│  - 6hr cache       │ │  - 6hr cache       │ │  - 6hr cache       │
│  - In-app check    │ │  - electron-updater│ │  - electron-updater│
│  - Direct APK inst │ │  - Silent BG check │ │  - Silent BG check │
│  - Force update UI │ │  - Force update UI │ │  - Force update UI │
└────────────────────┘ └────────────────────┘ └────────────────────┘
```

---

## 2. Manifest Schema (`/version.json`)

The server exposes `https://genmugic.vercel.app/version.json`:

```json
{
  "android": {
    "latestVersion": "1.0.1",
    "minimumVersion": "1.0.0",
    "downloadUrl": "https://genmugic.vercel.app/download/genmusic.apk"
  },
  "windows": {
    "latestVersion": "1.0.1",
    "minimumVersion": "1.0.0",
    "downloadUrl": "https://genmugic.vercel.app/download/genmusic-setup.exe"
  },
  "macos": {
    "latestVersion": "1.0.1",
    "minimumVersion": "1.0.0",
    "downloadUrl": "https://genmugic.vercel.app/download/genmusic.dmg"
  },
  "releaseNotes": [
    "Improved streaming engine",
    "Better audio quality",
    "Playback bug fixes",
    "UI enhancements"
  ]
}
```

---

## 3. Platform Specific Behavior

### A. Android (Capacitor)
1. Fetches `/version.json` via `CapacitorUpdater.checkAndroidUpdate()`.
2. Compares `latestVersion` and `minimumVersion` with installed `App.getInfo().version`.
3. If `installed < minimumVersion`, triggers **Mandatory Fullscreen Update Screen**. App playback and controls are locked until updated.
4. If `installed < latestVersion`, triggers **Optional Update Dialog** with "Update Now" and "Later".
5. When user clicks "Update Now", downloads APK from `/download/genmusic.apk` and initiates Android Package Installer intent.

### B. Windows & macOS (Electron)
1. Integrates `electron-updater` with background timer checks every 4 hours.
2. Renderer process listens via `ElectronUpdaterBridge`.
3. Progress bar renders real-time download throughput (`bytesPerSecond` and percentage).
4. Emits `update-downloaded` event offering **Install & Restart** instant application restart.

### C. 6-Hour Caching & Graceful Offline Mode
- Update check responses are cached in `localStorage` for **6 hours** (`6 * 60 * 60 * 1000 ms`).
- When offline (`navigator.onLine === false` or network timeout), the app falls back silently to local storage without throwing disruptive errors or blocking users.

---

## 4. Direct Download Endpoints
- Android APK: `https://genmugic.vercel.app/download/genmusic.apk`
- Windows EXE: `https://genmugic.vercel.app/download/genmusic-setup.exe`
- macOS DMG: `https://genmugic.vercel.app/download/genmusic.dmg`

---

## 5. Security & Integrity Considerations
1. **HTTPS Only**: All endpoints enforce TLS 1.3 and HSTS.
2. **SHA-256 Verification**: Package fingerprints are published and verified.
3. **CORS & Rate Limiting**: `/version.json` includes `Access-Control-Allow-Origin: *` and Edge caching headers (`s-maxage=300`).
4. **Code Signing**:
   - Windows: Sign with EV Code Signing Certificate using SignTool in CI.
   - macOS: Apple Developer ID Application certificate + `notarize` tool via Apple Notary service.
   - Android: Sign with release keystore using `apksigner`.
