import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';

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

/**
 * Server-side metadata fetcher:
 * Calls YouTube's public oEmbed service and builds the thumbnail URL.
 * Generates OpenGraph and Twitter tags for social previews.
 * No API keys or credentials required.
 */
export async function getServerSideProps(context) {
  const rawId = context.params?.id || '';
  const id = Array.isArray(rawId) ? rawId[0] : String(rawId).trim();

  const thumbnail = id
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : `${SITE_URL}/logo.png`;

  let meta = {
    id,
    title: 'Shared Song',
    author: 'GenMusic',
    thumbnail
  };

  if (id && /^[a-zA-Z0-9_-]{6,15}$/.test(id)) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(id)}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(oembedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GenMusic-SmartLink/1.0'
        }
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        meta = {
          id,
          title: data.title || meta.title,
          author: data.author_name || meta.author,
          thumbnail
        };
      }
    } catch {
      // Graceful fallback if oEmbed fails or times out
    }
  }

  return {
    props: {
      id,
      meta
    }
  };
}

export default function SharePage({ id, meta }) {
  // 'detecting' = attempting deep link & waiting on visibility change
  // 'fallback' = app didn't open within timer or user is on desktop
  const [viewState, setViewState] = useState('detecting');
  const appOpenedRef = useRef(false);

  // Construct custom deep link URI: genmusic://play?v=<id>
  const deepLinkUri = `${APP_SCHEME}://play?v=${encodeURIComponent(id)}`;

  // Manual trigger / retry button handler
  const handleOpenApp = () => {
    if (typeof window === 'undefined') return;
    window.location.href = deepLinkUri;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isMobile = isAndroid || isIOS;

    // Desktop browsers have no native mobile app — skip straight to fallback UI
    if (!isMobile) {
      setViewState('fallback');
      return;
    }

    // Tab visibility signals whether the app opened
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' || document.hidden) {
        appOpenedRef.current = true;
      }
    };

    const handlePageHide = () => {
      appOpenedRef.current = true;
    };

    const handleBlur = () => {
      appOpenedRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleBlur);

    // Initial attempt to open native app via custom URI scheme
    window.location.href = deepLinkUri;

    // After ~1.5s, if tab never went hidden, assume app is not installed
    const timer = setTimeout(() => {
      if (!appOpenedRef.current && !document.hidden && document.visibilityState === 'visible') {
        setViewState('fallback');
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('blur', handleBlur);
    };
  }, [deepLinkUri]);

  const pageTitle = `${meta.title} • GenMusic`;
  const pageDescription = `Listen to ${meta.title} by ${meta.author} on GenMusic.`;
  const shareUrl = `${SITE_URL}/share/${id}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0a0c" />

        {/* Open Graph / Social sharing card */}
        <meta property="og:type" content="music.song" />
        <meta property="og:site_name" content="GenMusic" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={meta.thumbnail} />
        <meta property="og:url" content={shareUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={meta.thumbnail} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={styles.container}>
        {/* Subtle purple background ambient glow */}
        <div style={styles.ambientGlow} />

        {/* Header Branding */}
        <header style={styles.header}>
          <div style={styles.logoBadge}>
            <span style={styles.logoText}>G</span>
          </div>
          <div>
            <h1 style={styles.brandTitle}>GenMusic</h1>
            <p style={styles.brandSubtitle}>Play smarter. Listen better.</p>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={styles.main}>
          {viewState === 'detecting' ? (
            /* Lightweight Spinner / Loading State */
            <div style={styles.loadingCard}>
              <div style={styles.spinnerWrapper}>
                <div style={styles.spinnerRing} />
              </div>
              <p style={styles.loadingTitle}>Opening GenMusic...</p>
              <p style={styles.loadingSubtitle}>Checking if the app is installed</p>
            </div>
          ) : (
            /* Branded Dark-Theme Fallback Card */
            <div style={styles.card}>
              {/* Song Thumbnail */}
              <div style={styles.thumbnailWrapper}>
                <img
                  src={meta.thumbnail}
                  alt={meta.title}
                  style={styles.thumbnail}
                  loading="eager"
                />
                <div style={styles.thumbnailOverlay} />
              </div>

              {/* Song Metadata */}
              <div style={styles.metaContainer}>
                <h2 style={styles.songTitle}>{meta.title}</h2>
                <p style={styles.songAuthor}>{meta.author}</p>
              </div>

              {/* Primary Call to Action: Download APK */}
              <a
                href={DOWNLOAD_URL}
                download="GenMusic.apk"
                style={styles.downloadApkButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download APK
              </a>

              {/* Secondary Call to Action: Retry Open in GenMusic */}
              <button
                onClick={handleOpenApp}
                type="button"
                style={styles.openAppButton}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Open in GenMusic
              </button>

              {/* Sideload / Play Store Notice */}
              <p style={styles.storeNotice}>
                GenMusic isn't on the Play Store yet — download directly to install.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© 2026 GenMusic. Free unlimited music & spatial audio.</p>
        </footer>

        {/* Embedded Keyframes for the spinner */}
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}

// Plain inline styles adhering to strict minimal dependencies
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
  logoText: {
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
  brandSubtitle: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 500,
    color: '#a78bfa'
  },
  main: {
    width: '100%',
    maxWidth: '420px',
    zIndex: 1,
    margin: 'auto 0',
    padding: '20px 0'
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '40px 24px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  spinnerWrapper: {
    marginBottom: '20px'
  },
  spinnerRing: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(124, 58, 237, 0.2)',
    borderTop: '3px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loadingTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#ffffff',
    margin: '0 0 4px 0'
  },
  loadingSubtitle: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '24px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    boxSizing: 'border-box'
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
  metaContainer: {
    marginBottom: '22px',
    textAlign: 'center'
  },
  songTitle: {
    margin: '0 0 6px 0',
    fontSize: '18px',
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
  downloadApkButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '15px 20px',
    borderRadius: '14px',
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    textDecoration: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
    marginBottom: '12px',
    transition: 'background-color 0.2s ease, transform 0.1s ease'
  },
  openAppButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '13px 20px',
    borderRadius: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e5e7eb',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'background-color 0.2s ease'
  },
  storeNotice: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '16px',
    marginBottom: 0,
    lineHeight: 1.5,
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
