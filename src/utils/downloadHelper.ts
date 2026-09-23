import confetti from 'canvas-confetti';

export const SPONSOR_DOWNLOAD_URL = 'https://omg10.com/4/11864587';
export const SPONSOR_CLICKED_STORAGE_KEY = 'genmusic_sponsor_download_clicked_v1';

let hasOpenedSponsorInSession = false;

/**
 * Checks if the user has clicked download for the first time.
 * If so, opens the sponsor hyperlink across in a new tab/window.
 */
export function openFirstTimeSponsorLink(): boolean {
  if (typeof window === 'undefined') return false;

  let alreadyOpened = false;
  try {
    alreadyOpened = Boolean(sessionStorage.getItem(SPONSOR_CLICKED_STORAGE_KEY)) || hasOpenedSponsorInSession;
  } catch {
    alreadyOpened = hasOpenedSponsorInSession;
  }

  if (!alreadyOpened) {
    hasOpenedSponsorInSession = true;
    try {
      sessionStorage.setItem(SPONSOR_CLICKED_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }

    try {
      const win = window.open(SPONSOR_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Fallback programmatic anchor click if popup was blocked
        const sponsorAnchor = document.createElement('a');
        sponsorAnchor.href = SPONSOR_DOWNLOAD_URL;
        sponsorAnchor.target = '_blank';
        sponsorAnchor.rel = 'noopener noreferrer';
        sponsorAnchor.style.display = 'none';
        document.body.appendChild(sponsorAnchor);
        sponsorAnchor.click();

        setTimeout(() => {
          if (document.body.contains(sponsorAnchor)) {
            document.body.removeChild(sponsorAnchor);
          }
        }, 400);
      }
      return true;
    } catch (e) {
      console.warn('Failed opening sponsor hyperlink:', e);
    }
  }

  return false;
}

/**
 * Initiates an app binary file download.
 * On first click, it opens the sponsor link in a new tab across with opening the GitHub app download link so the app will download.
 */
export function triggerSamePageDownload(url: string, filename?: string) {
  if (!url || url === '#' || typeof window === 'undefined') return;

  // 1. On first download click, open sponsor link in new tab across with the original download
  openFirstTimeSponsorLink();

  // 2. Resolve sensible fallback filename from URL if not specified
  const resolvedFilename = filename || url.split('/').pop()?.split('?')[0] || 'GEN-Music-Package';

  // 3. Open the GitHub app download link in a new tab so the browser directly receives the binary package and starts the download
  try {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', resolvedFilename);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    link.style.position = 'fixed';
    link.style.top = '-9999px';
    link.style.left = '-9999px';
    link.style.opacity = '0';

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 500);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
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
