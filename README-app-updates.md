# GEN MUSIC — App Release & Update Process

This guide explains how to release new updates for the **GEN MUSIC** Flutter / multi-platform app (Android, Windows, macOS) using the update endpoint hosted on Vercel at `https://genmugic.vercel.app/app-version.json`.

---

## 1. Build the App Binaries

Compile release packages for each platform from your Flutter codebase:

- **Android**:
  ```bash
  flutter build apk --release
  # Output: build/app/outputs/flutter-apk/app-release.apk
  ```
- **Windows**:
  ```bash
  flutter build windows --release
  # Package with Inno Setup or NSIS to generate genmusic-X.X.X-setup.exe
  ```
- **macOS**:
  ```bash
  flutter build macos --release
  # Package with create-dmg or Xcode to generate genmusic-X.X.X.dmg
  ```

---

## 2. Place or Host Installer Binaries

### Option A: Small Binaries (< 50MB)
Place the compiled files directly into `public/downloads/`:
- `public/downloads/genmusic-1.0.0.apk`
- `public/downloads/genmusic-1.0.0-setup.exe`
- `public/downloads/genmusic-1.0.0.dmg`

### Option B: Large Binaries (> 50MB) — Recommended
Git repositories and Vercel static deployments have repository size constraints. If any installer binary is over ~50MB, host it on an external storage provider:
- **GitHub Releases** (e.g., `https://github.com/<your-org>/genmusic/releases/download/v1.0.0/...`)
- **Vercel Blob / AWS S3 / Cloudflare R2**

Then point the corresponding URL in `public/app-version.json` to that external URL.

---

## 3. Update `public/app-version.json`

Open `public/app-version.json` and update the manifest:

```json
{
  "latest_version": "1.0.1",
  "min_supported_version": "1.0.0",
  "force_update": false,
  "whats_new": [
    "Added offline downloads",
    "New EQ presets",
    "Fixed playback bugs"
  ],
  "download_url": {
    "android": "https://genmugic.vercel.app/downloads/genmusic-1.0.1.apk",
    "windows": "https://genmugic.vercel.app/downloads/genmusic-1.0.1-setup.exe",
    "macos": "https://genmugic.vercel.app/downloads/genmusic-1.0.1.dmg"
  }
}
```

### Fields Explanation:
- `latest_version`: The newest released version string. The Flutter app compares its current version against this.
- `min_supported_version`: The minimum version allowed to run without updating.
- `force_update`: Set to `true` **only** for critical, security, or breaking API changes. When `true` (or when the client is below `min_supported_version`), the Flutter app should block usage until updated.
- `whats_new`: List of bullet points displayed in the app's update dialog.
- `download_url`: Direct download links for each supported platform.

---

## 4. Commit and Push to Deploy

Deploy the update by committing and pushing to your repository connected to Vercel:

```bash
git add public/app-version.json public/downloads/ README-app-updates.md
git commit -m "chore(release): bump app version to 1.0.1 and update release notes"
git push origin main
```

Vercel will automatically build and deploy within seconds. The endpoint will be immediately accessible at:
`https://genmugic.vercel.app/app-version.json`
