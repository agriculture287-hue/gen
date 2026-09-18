import { SupportedPlatform } from '../types/update';

export interface DeviceInfo {
  platform: 'android' | 'windows' | 'macos' | 'ios' | 'other';
  recommendedFileFormat: '.apk' | '.exe' | '.dmg' | null;
  platformName: string;
  isMobile: boolean;
  rawOS: string;
}

export function detectUserDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      platform: 'android',
      recommendedFileFormat: '.apk',
      platformName: 'Android',
      isMobile: true,
      rawOS: 'unknown',
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator as any).userAgentData?.platform?.toLowerCase() || (navigator.platform || '').toLowerCase();
  const isMobile = /android|iphone|ipad|ipod|mobile|blackberry|iemobile|opera mini/i.test(ua);

  // 1. Android Detection
  if (ua.includes('android') || platform.includes('android')) {
    return {
      platform: 'android',
      recommendedFileFormat: '.apk',
      platformName: 'Android',
      isMobile: true,
      rawOS: 'Android',
    };
  }

  // 2. iOS (iPhone / iPad / iPod)
  if (/iphone|ipad|ipod/.test(ua) || (platform.includes('mac') && navigator.maxTouchPoints > 1)) {
    return {
      platform: 'ios',
      recommendedFileFormat: null,
      platformName: 'iOS (iPhone/iPad)',
      isMobile: true,
      rawOS: 'iOS',
    };
  }

  // 3. Windows Detection
  if (ua.includes('win') || platform.includes('win')) {
    return {
      platform: 'windows',
      recommendedFileFormat: '.exe',
      platformName: 'Windows',
      isMobile: false,
      rawOS: 'Windows',
    };
  }

  // 4. macOS Detection
  if (ua.includes('mac') || platform.includes('mac') || ua.includes('darwin')) {
    return {
      platform: 'macos',
      recommendedFileFormat: '.dmg',
      platformName: 'macOS',
      isMobile: false,
      rawOS: 'macOS',
    };
  }

  // 5. Linux (often Android or desktop linux)
  if (ua.includes('linux') || platform.includes('linux')) {
    if (isMobile) {
      return {
        platform: 'android',
        recommendedFileFormat: '.apk',
        platformName: 'Android',
        isMobile: true,
        rawOS: 'Android / Linux',
      };
    }
    return {
      platform: 'windows',
      recommendedFileFormat: '.exe',
      platformName: 'Windows / Linux',
      isMobile: false,
      rawOS: 'Linux',
    };
  }

  // Default fallback to Android
  return {
    platform: 'android',
    recommendedFileFormat: '.apk',
    platformName: 'Android',
    isMobile: true,
    rawOS: 'Android',
  };
}
