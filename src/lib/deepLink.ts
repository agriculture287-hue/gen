/**
 * Deep-linking helpers for GenMusic
 *
 * NOTE ON SIDELOADED APKS:
 * GenMusic is distributed directly as a sideloaded APK (not via Google Play Store).
 * The Android intent:// URI deliberately omits S.browser_fallback_url to avoid
 * broken Play Store redirects. Fallback to our hosted APK is handled in JavaScript.
 */

export function buildAndroidIntent(videoId: string): string {
  const cleanId = encodeURIComponent((videoId || '').trim());
  return `intent://play?v=${cleanId}#Intent;scheme=genmusic;package=in.gen.agrigence;end`;
}

export function buildCustomSchemeUri(videoId: string): string {
  const cleanId = encodeURIComponent((videoId || '').trim());
  return `genmusic://play?v=${cleanId}`;
}
