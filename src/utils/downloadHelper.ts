import confetti from 'canvas-confetti';

export const OMG10_SPONSOR_URL = 'https://omg10.com/4/11864587';
export const SPONSOR_DOWNLOAD_URL = OMG10_SPONSOR_URL;
export const SPONSOR_LAST_CLICKED_TIMESTAMP_KEY = 'genmusic_sponsor_last_timestamp_v2';
export const SPONSOR_COOLDOWN_MS = 60 * 1000; // 1 minute active refresh cycle

export interface DownloadHandlerOptions {
  filename?: string;
  isDeepLink?: boolean;
}

export interface CooldownStatus {
  isActive: boolean;
  remainingMs: number;
  remainingSeconds: number;
}

/**
 * Returns whether the sponsor ad was clicked recently.
 */
export function getSponsorCooldownStatus(): CooldownStatus {
  if (typeof window === 'undefined') {
    return { isActive: false, remainingMs: 0, remainingSeconds: 0 };
  }

  try {
    const raw = localStorage.getItem(SPONSOR_LAST_CLICKED_TIMESTAMP_KEY);
    if (!raw) return { isActive: false, remainingMs: 0, remainingSeconds: 0 };

    const lastTime = parseInt(raw, 10);
    if (isNaN(lastTime)) return { isActive: false, remainingMs: 0, remainingSeconds: 0 };

    const elapsed = Date.now() - lastTime;
    if (elapsed < SPONSOR_COOLDOWN_MS) {
      const remainingMs = SPONSOR_COOLDOWN_MS - elapsed;
      return {
        isActive: true,
        remainingMs,
        remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
      };
    }

    return { isActive: false, remainingMs: 0, remainingSeconds: 0 };
  } catch {
    return { isActive: false, remainingMs: 0, remainingSeconds: 0 };
  }
}

/**
 * Actively triggers all ad networks (Popunder, Direct Sponsor Smartlink, and In-Page events).
 */
export function triggerActiveAd(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Open the direct high-yield sponsor ad link in a separate tab
    const win = window.open(OMG10_SPONSOR_URL, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const adAnchor = document.createElement('a');
      adAnchor.href = OMG10_SPONSOR_URL;
      adAnchor.target = '_blank';
      adAnchor.rel = 'noopener noreferrer';
      adAnchor.style.display = 'none';
      document.body.appendChild(adAnchor);
      adAnchor.click();
      setTimeout(() => {
        if (document.body.contains(adAnchor)) {
          document.body.removeChild(adAnchor);
        }
      }, 500);
    }

    // 2. Record ad interaction timestamp
    localStorage.setItem(SPONSOR_LAST_CLICKED_TIMESTAMP_KEY, Date.now().toString());

    // 3. Dispatch ad activated event for UI components and banners
    window.dispatchEvent(
      new CustomEvent('genmusic-ad-activated', {
        detail: {
          sponsorUrl: OMG10_SPONSOR_URL,
          timestamp: Date.now(),
        },
      })
    );

    return true;
  } catch (err) {
    console.warn('Error activating ad link:', err);
    return false;
  }
}

/**
 * Initiates the real application download or deep link in the current window.
 */
export function executeRealDownload(
  targetUrl: string,
  filename?: string,
  isDeepLink?: boolean
) {
  if (!targetUrl || targetUrl === '#' || typeof window === 'undefined') return;

  const resolvedFilename =
    filename || targetUrl.split('/').pop()?.split('?')[0] || 'GEN-Music.apk';

  const isSchemeOrIntent =
    isDeepLink ||
    targetUrl.startsWith('intent:') ||
    targetUrl.startsWith('genmusic:') ||
    targetUrl.startsWith('market:');

  if (isSchemeOrIntent) {
    try {
      window.location.href = targetUrl;
    } catch (e) {
      console.warn('Error executing deep link redirect:', e);
    }
  } else {
    // 1. Programmatic direct anchor click
    try {
      const directAnchor = document.createElement('a');
      directAnchor.href = targetUrl;
      directAnchor.setAttribute('download', resolvedFilename);
      directAnchor.target = '_self';
      directAnchor.style.display = 'none';
      document.body.appendChild(directAnchor);
      directAnchor.click();
      setTimeout(() => {
        if (document.body.contains(directAnchor)) {
          document.body.removeChild(directAnchor);
        }
      }, 1000);
    } catch (e) {
      console.warn('Error executing download anchor:', e);
    }

    // 2. Direct location navigation for Content-Disposition attachment downloads
    setTimeout(() => {
      try {
        window.location.href = targetUrl;
      } catch {
        // Fallback
      }
    }, 120);

    // 3. Fallback invisible iframe trigger
    setTimeout(() => {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = targetUrl;
        document.body.appendChild(iframe);
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      } catch {
        // ignore
      }
    }, 300);

    // Celebration feedback
    triggerDownloadCelebration();
  }
}

/**
 * Centralized download handler function with ALL ADS ACTIVE:
 * 1. Actively triggers and opens the OMG10 sponsor ad in a new window/tab.
 * 2. Simultaneously initiates the direct application binary download in the current window.
 * 3. Dispatches visual notices and celebration confetti so user knows download is in progress.
 */
export function handleDownloadWithSponsor(
  targetUrl: string,
  options?: DownloadHandlerOptions | string
) {
  if (!targetUrl || targetUrl === '#' || typeof window === 'undefined') return;

  const filename = typeof options === 'string' ? options : options?.filename;
  const isDeepLink = typeof options === 'object' && Boolean(options?.isDeepLink);
  const resolvedFilename =
    filename || targetUrl.split('/').pop()?.split('?')[0] || 'GEN-Music.apk';

  // 1. ALWAYS ACTIVE: Trigger and open the sponsor ad
  triggerActiveAd();

  // 2. Execute the actual application file download
  executeRealDownload(targetUrl, resolvedFilename, isDeepLink);

  // 3. Dispatch notification event so the UI shows active download & ad support feedback
  try {
    window.dispatchEvent(
      new CustomEvent('genmusic-real-download-started', {
        detail: {
          targetUrl,
          filename: resolvedFilename,
          remainingSeconds: 60,
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent('genmusic-sponsor-opened', {
        detail: {
          targetUrl,
          filename: resolvedFilename,
          isDeepLink,
          cooldownSeconds: 60,
        },
      })
    );
    window.dispatchEvent(new CustomEvent('genmusic-cooldown-change'));
  } catch {
    // ignore
  }
}

// Aliases for backwards compatibility
export const openBothDownloadAndHyperlink = handleDownloadWithSponsor;
export const triggerSamePageDownload = handleDownloadWithSponsor;
export const openFirstTimeSponsorLink = triggerActiveAd;

/**
 * Fires celebration particle confetti to give positive visual feedback right on the page.
 */
export function triggerDownloadCelebration() {
  try {
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00f0ff', '#3b82f6', '#a855f7', '#ec4899', '#10b981'],
    });
  } catch {
    // Non-blocking fallback
  }
}
