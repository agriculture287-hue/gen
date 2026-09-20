import confetti from 'canvas-confetti';

/**
 * Initiates a binary file download directly on the current page.
 * Keeps the user on the same page and prevents opening new tabs, windows, or blank pages.
 */
export function triggerSamePageDownload(url: string, filename?: string) {
  if (!url || url === '#' || typeof window === 'undefined') return;

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
