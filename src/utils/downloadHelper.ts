import confetti from 'canvas-confetti';

export const OMG10_SPONSOR_URL = 'https://omg10.com/4/11864587';
export const SPONSOR_DOWNLOAD_URL = OMG10_SPONSOR_URL;
export const SPONSOR_LAST_CLICKED_TIMESTAMP_KEY = 'genmusic_sponsor_last_timestamp_v2';
export const SPONSOR_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface DownloadHandlerOptions {
  filename?: string;
  isDeepLink?: boolean;
}

export interface CooldownStatus {
  isActive: boolean; // True if within the 5-minute window
  remainingMs: number;
  remainingSeconds: number;
}

/**
 * Returns whether the sponsor hyperlink is currently on a 5-minute cooldown.
 * When on cooldown, clicks trigger the real application download directly without opening the sponsor link.
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
 * Centralized download handler function:
 * 1. If not on 5-minute cooldown:
 *    - Opens the 'omg10' advertisement link in a new tab.
 *    - Activates 5-minute cooldown timestamp.
 *    - Advises user to come back and click again to download their app.
 *    - Also initiates direct download as preparatory action.
 * 2. If within 5-minute cooldown ("in bw"):
 *    - The sponsor hyperlink DOES NOT open.
 *    - The REAL download link works directly on every click!
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

  const cooldown = getSponsorCooldownStatus();

  if (cooldown.isActive) {
    // WITHIN 5-MINUTE COOLDOWN:
    // Real download link works directly without opening sponsor hyperlink!
    executeRealDownload(targetUrl, resolvedFilename, isDeepLink);

    // Dispatch real download event so UI shows success feedback
    try {
      window.dispatchEvent(
        new CustomEvent('genmusic-real-download-started', {
          detail: {
            targetUrl,
            filename: resolvedFilename,
            remainingSeconds: cooldown.remainingSeconds,
          },
        })
      );
    } catch {
      // ignore
    }
  } else {
    // COOLDOWN EXPIRED OR FIRST CLICK:
    // 1. Activate 5-minute cooldown timestamp in localStorage
    try {
      localStorage.setItem(SPONSOR_LAST_CLICKED_TIMESTAMP_KEY, Date.now().toString());
    } catch {
      // ignore
    }

    // 2. Open the 'omg10' sponsor advertisement link in a new tab
    try {
      const sponsorWin = window.open(OMG10_SPONSOR_URL, '_blank', 'noopener,noreferrer');
      if (!sponsorWin || sponsorWin.closed || typeof sponsorWin.closed === 'undefined') {
        const sponsorAnchor = document.createElement('a');
        sponsorAnchor.href = OMG10_SPONSOR_URL;
        sponsorAnchor.target = '_blank';
        sponsorAnchor.rel = 'noopener noreferrer';
        sponsorAnchor.style.display = 'none';
        document.body.appendChild(sponsorAnchor);
        sponsorAnchor.click();
        setTimeout(() => {
          if (document.body.contains(sponsorAnchor)) {
            document.body.removeChild(sponsorAnchor);
          }
        }, 500);
      }
    } catch (e) {
      console.warn('Error opening sponsor link:', e);
    }

    // 3. Initiate real download directly so user gets the package
    executeRealDownload(targetUrl, resolvedFilename, isDeepLink);

    // 4. Dispatch event advising user to come back and click again to download
    // Direct downloads are now unlocked for 5 minutes!
    try {
      window.dispatchEvent(
        new CustomEvent('genmusic-sponsor-opened', {
          detail: {
            targetUrl,
            filename: resolvedFilename,
            isDeepLink,
            cooldownSeconds: 300,
          },
        })
      );
      window.dispatchEvent(new CustomEvent('genmusic-cooldown-change'));
    } catch {
      // ignore
    }
  }
}

// Aliases for backwards compatibility
export const openBothDownloadAndHyperlink = handleDownloadWithSponsor;
export const triggerSamePageDownload = handleDownloadWithSponsor;

export function openFirstTimeSponsorLink(): boolean {
  try {
    window.open(OMG10_SPONSOR_URL, '_blank', 'noopener,noreferrer');
    return true;
  } catch {
    return false;
  }
}

/**
 * Opens the sponsor hyperlink in a new tab/window, activates cooldown,
 * and optionally runs a callback (such as entering the music player or starting playback).
 */
export function triggerSponsorHyperlink(callback?: () => void) {
  if (typeof window === 'undefined') {
    if (callback) callback();
    return;
  }

  // 1. Activate cooldown timestamp in localStorage
  try {
    localStorage.setItem(SPONSOR_LAST_CLICKED_TIMESTAMP_KEY, Date.now().toString());
  } catch {}

  // 2. Open sponsor hyperlink
  try {
    const sponsorWin = window.open(OMG10_SPONSOR_URL, '_blank', 'noopener,noreferrer');
    if (!sponsorWin || sponsorWin.closed || typeof sponsorWin.closed === 'undefined') {
      const anchor = document.createElement('a');
      anchor.href = OMG10_SPONSOR_URL;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (document.body.contains(anchor)) {
          document.body.removeChild(anchor);
        }
      }, 500);
    }
  } catch (e) {
    console.warn('Error opening sponsor hyperlink:', e);
  }

  // 3. Dispatch event for UI notifications/cooldown badges
  try {
    window.dispatchEvent(
      new CustomEvent('genmusic-sponsor-opened', {
        detail: {
          targetUrl: OMG10_SPONSOR_URL,
          cooldownSeconds: 300,
        },
      })
    );
    window.dispatchEvent(new CustomEvent('genmusic-cooldown-change'));
  } catch {}

  // 4. Execute callback after a brief tick to ensure hyperlink event dispatched
  if (callback) {
    setTimeout(() => {
      try {
        callback();
      } catch (err) {
        console.warn('Error in sponsor callback:', err);
      }
    }, 120);
  }
}

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
