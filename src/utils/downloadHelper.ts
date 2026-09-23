import confetti from 'canvas-confetti';

export const SPONSOR_DOWNLOAD_URL = 'https://omg10.com/4/11864587';
export const SPONSOR_CLICKED_STORAGE_KEY = 'genmusic_sponsor_download_clicked_v1';

/**
 * Opens BOTH the GitHub download link and the sponsor hyperlink at the exact same click,
 * guaranteeing that the app binary package begins downloading and the sponsor hyperlink opens simultaneously.
 */
export function openBothDownloadAndHyperlink(downloadUrl: string, filename?: string) {
  if (!downloadUrl || downloadUrl === '#' || typeof window === 'undefined') return;

  const resolvedFilename = filename || downloadUrl.split('/').pop()?.split('?')[0] || 'GEN-Music.apk';

  // 1. Open the sponsor hyperlink in a new tab
  try {
    const sponsorWin = window.open(SPONSOR_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
    if (!sponsorWin || sponsorWin.closed || typeof sponsorWin.closed === 'undefined') {
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
      }, 500);
    }
  } catch (e) {
    console.warn('Error opening sponsor link:', e);
  }

  // 2. Open GitHub download link in a new tab/window as requested
  try {
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  } catch (e) {
    console.warn('Error opening download tab:', e);
  }

  // 3. Directly trigger the file download on the current page so that even if the browser
  // blocks the second tab/popup, the binary file (.apk / .exe / .dmg) is 100% downloaded!
  try {
    const directDlAnchor = document.createElement('a');
    directDlAnchor.href = downloadUrl;
    directDlAnchor.setAttribute('download', resolvedFilename);
    directDlAnchor.target = '_self';
    directDlAnchor.style.display = 'none';
    document.body.appendChild(directDlAnchor);
    directDlAnchor.click();
    setTimeout(() => {
      if (document.body.contains(directDlAnchor)) {
        document.body.removeChild(directDlAnchor);
      }
    }, 1000);
  } catch (e) {
    console.warn('Error triggering direct download:', e);
  }

  // 4. Secondary fallback: hidden iframe trigger to ensure download manager catches the file
  setTimeout(() => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 4000);
    } catch {
      // ignore
    }
  }, 250);
}

/**
 * Backward-compatible helper that triggers both download and sponsor hyperlink.
 */
export function openFirstTimeSponsorLink(): boolean {
  try {
    window.open(SPONSOR_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
    return true;
  } catch {
    return false;
  }
}

/**
 * Triggers both the file download and the hyperlink at the same click.
 */
export function triggerSamePageDownload(url: string, filename?: string) {
  openBothDownloadAndHyperlink(url, filename);
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
