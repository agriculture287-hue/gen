/**
 * Deep-linking helpers for GenMusic
 *
 * NOTE ON SIDELOADED APKS:
 * GenMusic is not on the Google Play Store and is distributed directly as an APK.
 * The standard Android intent:// URI with S.browser_fallback_url would attempt to
 * redirect to a non-existent Play Store page on failure.
 *
 * Therefore, buildAndroidIntent() omits browser_fallback_url, allowing client-side
 * JavaScript to cleanly detect app presence via visibility/pagehide timing and
 * display our self-hosted APK download fallback instead.
 */

/**
 * Constructs an Android intent URI for opening a song directly in GenMusic.
 * Formatted as:
 * intent://play?v=<videoId>#Intent;scheme=genmusic;package=in.gen.agrigence;end
 *
 * @param {string} videoId - YouTube/GenMusic song video ID
 * @returns {string} - Complete Android intent URL
 */
export function buildAndroidIntent(videoId) {
  const cleanId = encodeURIComponent((videoId || '').trim());
  return `intent://play?v=${cleanId}#Intent;scheme=genmusic;package=in.gen.agrigence;end`;
}

/**
 * Constructs the standard custom scheme URI for iOS and direct app launches:
 * genmusic://play?v=<videoId>
 *
 * @param {string} videoId - YouTube/GenMusic song video ID
 * @returns {string} - Custom scheme URI
 */
export function buildCustomSchemeUri(videoId) {
  const cleanId = encodeURIComponent((videoId || '').trim());
  return `genmusic://play?v=${cleanId}`;
}
