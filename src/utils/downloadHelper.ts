import confetti from 'canvas-confetti';

export const FIRST_CLICK_SPONSOR_URL = 'https://repeattelegraph.com/m8gatcpmum?key=5d6d86607bc6a38ce0c1426aaecfa78f';
const FIRST_CLICK_SESSION_KEY = 'genmusic_download_first_click_opened';

/**
 * Handles opening the sponsor hyperlink on the user's first download click,
 * allowing the original download link to proceed simultaneously.
 */
export function handleFirstClickSponsor(): void {
  if (typeof window === 'undefined') return;

  try {
    const alreadyTriggered = sessionStorage.getItem(FIRST_CLICK_SESSION_KEY);
    if (!alreadyTriggered) {
      sessionStorage.setItem(FIRST_CLICK_SESSION_KEY, 'true');

      // Open sponsor hyperlink in a new tab
      const win = window.open(FIRST_CLICK_SPONSOR_URL, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        const sponsorLink = document.createElement('a');
        sponsorLink.href = FIRST_CLICK_SPONSOR_URL;
        sponsorLink.target = '_blank';
        sponsorLink.rel = 'noopener noreferrer';
        sponsorLink.style.display = 'none';
        document.body.appendChild(sponsorLink);
        sponsorLink.click();
        setTimeout(() => {
          if (document.body.contains(sponsorLink)) {
            document.body.removeChild(sponsorLink);
          }
        }, 500);
      }
    }
  } catch (e) {
    console.warn('First click sponsor notice:', e);
  }
}

/**
 * Initiates a binary file download directly on the current page.
 * Keeps the user on the same page and prevents opening new tabs, windows, or blank pages.
 */
export function triggerSamePageDownload(url: string, filename?: string) {
  if (!url || url === '#' || typeof window === 'undefined') return;

  // On first download click, open sponsor hyperlink in new tab across with the original file download
  handleFirstClickSponsor();

  // Resolve sensible fallback filename from URL if not specified
  const resolvedFilename = filename || url.split('/').pop()?.split('?')[0] || 'GEN-Music-Package';

  // 1. Create a programmatic hidden anchor element
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', resolvedFilename);
  // CRITICAL: Explicitly set target to '_self' so the browser never opens a new tab or window
  link.target = '_self';
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
  }, 400);
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
