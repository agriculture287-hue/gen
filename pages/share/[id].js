import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';

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

  // App & store configuration from environment variables with production defaults
  const appScheme = process.env.GENMUSIC_APP_SCHEME || 'genmusic';
  const packageName = process.env.GENMUSIC_PACKAGE_NAME || 'in.gen.agrigence';
  const playStoreUrl =
    process.env.GENMUSIC_PLAY_STORE_URL ||
    'https://play.google.com/store/apps/details?id=in.gen.agrigence';
  const appStoreUrl =
    process.env.GENMUSIC_APP_STORE_URL ||
    'https://apps.apple.com/app/genmusic/id123456789';

  return {
    props: {
      id: videoId,
      meta,
      config: {
        appScheme,
        packageName,
        playStoreUrl,
        appStoreUrl
      }
    }
  };
}

export default function ShareRedirectPage({ id, meta, config }) {
  const [showFallback, setShowFallback] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const appOpenedRef = useRef(false);

  // Compute platform deep link URLs
  const androidIntentUrl = `intent://play?v=${encodeURIComponent(id)}#Intent;scheme=${config.appScheme};package=${config.packageName};S.browser_fallback_url=${encodeURIComponent(config.playStoreUrl)};end`;
  const iosSchemeUrl = `${config.appScheme}://play?v=${encodeURIComponent(id)}`;

  const openApp = () => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (isAndroid) {
      window.location.href = androidIntentUrl;
    } else if (isIOS) {
      window.location.href = iosSchemeUrl;
    } else {
      // Desktop: fallback UI directly
      setShowFallback(true);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isMobile = isAndroid || isIOS;

    if (!isMobile) {
      // Desktop browsers skip directly to fallback UI
      setShowFallback(true);
      return;
    }

    // Detect if app was successfully opened using visibilitychange / pagehide
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        appOpenedRef.current = true;
      }
    };

    const handlePageHide = () => {
      appOpenedRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    // Initial redirect attempt on mount
    setAttempted(true);
    if (isAndroid) {
      window.location.href = androidIntentUrl;
    } else if (isIOS) {
      window.location.href = iosSchemeUrl;
    }

    // After ~1.5 seconds, check if the app opened
    const fallbackTimer = setTimeout(() => {
      if (!appOpenedRef.current && document.visibilityState !== 'hidden') {
        setShowFallback(true);
      }
    }, 1500);

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [id, androidIntentUrl, iosSchemeUrl]);

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
          {/* Card Container */}
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

            {/* Primary Action Button */}
            <button
              onClick={openApp}
              style={styles.primaryButton}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Open in GenMusic
            </button>

            {/* Store Download Options */}
            {showFallback && (
              <div style={styles.storeSection}>
                <p style={styles.storeSubtitle}>
                  Don't have the app yet? Download GenMusic for high-fidelity playback and offline songs.
                </p>

                <div style={styles.storeButtonGroup}>
                  {/* Google Play Button */}
                  <a
                    href={config.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.storeButton}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={styles.storeIcon}>
                      <path d="M3.609 1.814L13.793 12 3.61 22.186c-.352-.338-.61-.83-.61-1.46V3.273c0-.63.258-1.121.61-1.46zm11.3 11.3l2.257-2.257-11.45-6.52 9.193 8.777zm0 1.772l-9.193 8.777 11.45-6.52-2.257-2.257zm1.121-1.121l3.585-2.042c1.026-.585 1.026-1.545 0-2.13l-3.585-2.042-2.008 2.008 2.008 2.006z"/>
                    </svg>
                    <span>Google Play</span>
                  </a>

                  {/* App Store Button */}
                  <a
                    href={config.appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.storeButton}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={styles.storeIcon}>
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.76 1.04-1.82.93-2.88-.9.04-2 .6-2.65 1.36-.58.67-.99 1.74-.88 2.78.99.08 1.98-.5 2.6-1.26z"/>
                    </svg>
                    <span>App Store</span>
                  </a>
                </div>
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

// Clean, mobile-first styles with GenMusic purple (#7c3aed)
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
    objectFit: 'cover'
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
  storeSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    animation: 'fadeIn 0.3s ease-in-out'
  },
  storeSubtitle: {
    margin: '0 0 14px 0',
    fontSize: '12px',
    color: '#9ca3af',
    lineHeight: 1.5
  },
  storeButtonGroup: {
    display: 'flex',
    gap: '10px'
  },
  storeButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 14px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e5e7eb',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    boxSizing: 'border-box'
  },
  storeIcon: {
    color: '#a78bfa'
  },
  footer: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '16px',
    zIndex: 1
  }
};
