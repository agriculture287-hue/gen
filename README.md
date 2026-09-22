# GenMusic Smart-Link Redirector

A minimal, zero-dependency Next.js Pages Router application deployed on Vercel that redirects shared music links (`https://genmusics.vercel.app/share/<videoId>`) to the native GenMusic Android/iOS app or provides a direct APK download fallback.

---

## 🚀 Key Features

1. **No API Keys or Secrets Required**:
   - Fetches video title and artist via YouTube's public oEmbed endpoint (`https://www.youtube.com/oembed?url=...&format=json`).
   - Retrieves high-res thumbnails directly from YouTube's public image CDN (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`).
   - Graceful fallback on network timeout or invalid video IDs.

2. **Smart App Detection & Deep Linking**:
   - On Android and iOS, attempts to open the app immediately via the custom URI scheme `genmusic://play?v=<videoId>`.
   - Listens to `visibilitychange`, `pagehide`, and `blur` events. If the tab goes to the background within 1.5 seconds, the native app launched.
   - If the tab remains in the foreground, or on desktop browsers, it displays the branded dark fallback UI.
   - Shows a clean spinner while detecting the app rather than flashing the fallback UI prematurely.

3. **Pure Direct APK Distribution (No Play Store / App Store)**:
   - "Download APK" is styled as the primary call to action.
   - No dead links or redirects to non-existent Play Store listings.
   - Includes a secondary "Open in GenMusic" button so users who already have the app can manually retry if the automatic launch was blocked by OEM browsers.
   - Transparent disclaimer: *"GenMusic isn't on the Play Store yet — download directly to install."*

4. **Zero Ad Traffic**:
   - Clean redirect with no background ad scripts or hidden network requests.

5. **Edge Cache Headers**:
   - Metadata responses are cached for 24 hours at Vercel's edge network (`s-maxage=86400, stale-while-revalidate=43200`).

---

## ⚙️ Constants to Configure Before Going Live

All editable placeholders are declared at the very top of `pages/share/[id].js`:

```javascript
// ============================================================================
// CONFIGURATION & PLACEHOLDERS (Edit these constants directly)
// ============================================================================
/** Custom URI scheme registered by the native GenMusic app (e.g. genmusic://play?v=<id>) */
const APP_SCHEME = 'genmusic';

/** Direct URL to your hosted GenMusic .apk file (Replace with your actual APK URL) */
const DOWNLOAD_URL = 'https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music-v2.0.4.apk';

/** Base site domain for canonical URL & Open Graph links */
const SITE_URL = 'https://genmusics.vercel.app';
// ============================================================================
```

### What to Fill In:
- `APP_SCHEME`: Set to the URI scheme defined in your Android app's `AndroidManifest.xml` (e.g., `genmusic`).
- `DOWNLOAD_URL`: Set to the direct download link for your hosted `.apk` file (e.g., on GitHub Releases, Cloudflare R2, AWS S3, or your own server).
- `SITE_URL`: Set to your production Vercel domain (e.g., `https://genmusics.vercel.app`).

---

## 📦 Deployment to Vercel

### Option 1: Git Integration (Recommended)
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the repository and select **Next.js** framework preset.
4. Click **Deploy** (no environment variables or build overrides needed).

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

---

## 🧪 Testing Shared Links

Test with any valid YouTube video ID:
```
https://genmusics.vercel.app/share/dQw4w9WgXcQ
```

- **OpenGraph Test**: Share in WhatsApp, Telegram, Discord, or Slack to verify the rich preview card with thumbnail, title, and artist.
- **Mobile Test**:
  - If installed: Directly launches GenMusic playback.
  - If not installed: Shows the spinner for 1.5s, then displays the song info with the "Download APK" button.
