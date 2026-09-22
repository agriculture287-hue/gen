import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { buildAndroidIntent, buildCustomSchemeUri } from '../../lib/deepLink';

/**
 * Server-side metadata fetcher via public YouTube oEmbed and i.ytimg.com CDN.
 * No API keys or OAuth required.
 */
export async function getServerSideProps(context) {
  const { id } = context.params || {};
  const videoId = (id || '').toString().trim();

  const fallback = {
    title: 'Shared Song',
    author: 'GenMusic',
    thumbnailHQ: videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : 'https://genmusics.vercel.app/logo.png'
  };

  let meta = { ...fallback };

  if (videoId && /^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(oembedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GenMusic-LinkBot/1.0 (+https://genmusics.vercel.app)'
        }
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        meta = {
          title: data.title || fallback.title,
          author: data.author_name || fallback.author,
          thumbnailHQ: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
      }
    } catch {
      // Graceful fallback if oEmbed is unreachable
    }
  }

  // App & hosted APK configuration
  // Note: GenMusic is NOT on the Google Play Store; it is distributed directly as an APK.
  const appScheme = process.env.GENMUSIC_APP_SCHEME || 'genmusic';
  const packageName = process.env.GENMUSIC_PACKAGE_NAME || 'in.gen.agrigence';
  const apkUrl =
    process.env.GENMUSIC_APK_URL ||
    'https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music-v2.0.4.apk';

  return {
    props: {
      id: videoId,
      meta,
      config: {
        appScheme,
        packageName,
        apkUrl
      }
    }
  };
}

export default function ShareRedirectPage({ id, meta, config }) {
  const [showFallback, setShowFallback] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const appOpenedRef = useRef(false);

  // Manual trigger / retry function
  const handleOpenApp = () => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    setIsOpening(true);

    if (isAndroid) {
      window.location.href = buildAndroidIntent(id);
    } else if (isIOS) {
      window.location.href = buildCustomSchemeUri(id);
    } else {
      setShowFallback(true);
    }

    setTimeout(() => {
      setIsOpening(false);
    }, 2000);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isMobile = isAndroid || isIOS;

    // Desktop browsers don't have the mobile app; skip directly to fallback UI
    if (!isMobile) {
      setShowFallback(true);
      return;
    }

    // Detect if native app took foreground via visibilitychange / pagehide
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' || document.hidden) {
        appOpenedRef.current = true;
      }
    };

    const handlePageHide = () => {
      appOpenedRef.current = true;
    };

    const handleWindowBlur = () => {
      // Blur can indicate Chrome system dialog ("Open with GenMusic") or app launch
      appOpenedRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleWindowBlur);

    // Initial silent launch attempt on mount
    if (isAndroid) {
      // Use intent:// without browser_fallback_url to avoid broken Play Store redirect
      window.location.href = buildAndroidIntent(id);
    } else if (isIOS) {
      window.location.href = buildCustomSchemeUri(id);
    }

    // After ~1400ms, check if user remains in browser with page visible.
    // If the Chrome "Open with" system dialog is displayed or the app launched,
    // document.hidden / blur will be triggered, preventing unwanted UI flash.
    const fallbackTimer = setTimeout(() => {
      if (!appOpenedRef.current && !document.hidden && document.visibilityState === 'visible') {
        setShowFallback(true);
      }
    }, 1400);

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [id]);

  const pageTitle = `${meta.title} • GenMusic`;
  const pageDescription = `Listen to ${meta.title} by ${meta.author} on GenMusic.`;
  const shareUrl = `https://genmusics.vercel.app/share/${id}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0a0c" />

        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="music.song" />
        <meta property="og:site_name" content="GenMusic" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={meta.thumbnailHQ} />
        <meta property="og:url" content={shareUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={meta.thumbnailHQ} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={styles.container}>
        {/* Ambient Glow */}
        <div style={styles.ambientGlow} />

        {/* Header Branding */}
        <header style={styles.header}>
          <div style={styles.logoBadge}>
            <span style={styles.logoG}>G</span>
          </div>
          <div>
            <h1 style={styles.brandTitle}>GenMusic</h1>
            <p style={styles.brandTagline}>Play smarter. Listen better.</p>
          </div>
        </header>

        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.card}>
            {/* Song Thumbnail */}
            <div style={styles.thumbnailWrapper}>
              <img
                src={meta.thumbnailHQ}
                alt={meta.title}
                style={styles.thumbnail}
                loading="eager"
              />
              <div style={styles.thumbnailOverlay} />
            </div>

            {/* Song Info */}
            <div style={styles.songInfo}>
              <h2 style={styles.songTitle}>{meta.title}</h2>
              <p style={styles.songAuthor}>{meta.author}</p>
            </div>

            {/* Primary Action: Open in GenMusic */}
            <button
              onClick={handleOpenApp}
              style={styles.primaryButton}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {isOpening ? 'Opening GenMusic...' : 'Open in GenMusic'}
            </button>

            {/* Fallback Card: Shown if app is not installed or tab remains visible */}
            {showFallback && (
              <div style={styles.fallbackSection}>
                <div style={styles.fallbackDivider} />

                <div style={styles.fallbackHeader}>
                  <h3 style={styles.fallbackTitle}>Get the GenMusic App</h3>
                  <p style={styles.fallbackSubtitle}>
                    GenMusic is distributed as a direct APK download for high-fidelity audio and offline listening.
                  </p>
                </div>

                {/* Prominent Download APK Button */}
                <a
                  href={config.apkUrl}
                  download="GenMusic.apk"
                  style={styles.downloadApkButton}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download APK (Direct)</span>
                </a>

                {/* Secondary: Retry Opening App for Users who already have it */}
                <button
                  onClick={handleOpenApp}
                  style={styles.retryButton}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>Already have the app? Open it</span>
                </button>

                {/* Sideload Hint */}
                <p style={styles.sideloadNote}>
                  * Note: Sideloading requires allowing "Install unknown apps" for your browser when prompted on Android 8+.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© 2026 GenMusic. Free unlimited music & spatial audio.</p>
        </footer>
      </div>
    </>
  );
}

// Clean, mobile-first styling with GenMusic purple (#7c3aed)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0c',
    color: '#f3f4f6',
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  ambientGlow: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    filter: 'blur(110px)',
    pointerEvents: 'none',
    zIndex: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1,
    marginTop: '8px'
  },
  logoBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)'
  },
  logoG: {
    color: '#ffffff',
    fontWeight: 900,
    fontSize: '18px',
    letterSpacing: '-0.5px'
  },
  brandTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: '#ffffff'
  },
  brandTagline: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 500,
    color: '#a78bfa'
  },
  main: {
    width: '100%',
    maxWidth: '440px',
    zIndex: 1,
    margin: 'auto 0',
    padding: '20px 0'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '24px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
    textAlign: 'center'
  },
  thumbnailWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#181924',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '18px'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  thumbnailOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(10, 10, 12, 0.8) 0%, transparent 60%)'
  },
  songInfo: {
    marginBottom: '20px',
    textAlign: 'center'
  },
  songTitle: {
    margin: '0 0 6px 0',
    fontSize: '19px',
    fontWeight: 700,
    lineHeight: 1.35,
    color: '#ffffff',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  songAuthor: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#a78bfa'
  },
  primaryButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 20px',
    borderRadius: '14px',
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35)',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  fallbackSection: {
    marginTop: '20px',
    animation: 'fadeIn 0.3s ease-in-out'
  },
  fallbackDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: '18px'
  },
  fallbackHeader: {
    marginBottom: '16px'
  },
  fallbackTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#ffffff',
    margin: '0 0 6px 0'
  },
  fallbackSubtitle: {
    fontSize: '12px',
    color: '#9ca3af',
    lineHeight: 1.5,
    margin: 0
  },
  downloadApkButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 20px',
    borderRadius: '14px',
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    border: '1.5px solid #7c3aed',
    color: '#c4b5fd',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)',
    transition: 'all 0.2s ease',
    marginBottom: '10px'
  },
  retryButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    borderRadius: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    boxSizing: 'border-box'
  },
  sideloadNote: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '12px',
    lineHeight: 1.4,
    textAlign: 'center'
  },
  footer: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '16px',
    zIndex: 1
  }
};
