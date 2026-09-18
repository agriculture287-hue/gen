/**
 * Capacitor Update Service for Gen Music Android
 * Handles in-app version checks, APK downloading via native filesystem or intent,
 * and presenting APK installation dialogs.
 */

import { checkForAppUpdates } from './updateService';
import { UpdateCheckResult } from '../types/update';

export interface CapacitorAppInfo {
  version: string;
  build: string;
  name: string;
  id: string;
}

export class CapacitorUpdater {
  private static isInitialized = false;

  /**
   * Check if running in a native Capacitor Android container
   */
  public static isCapacitorAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    const capacitor = (window as any).Capacitor;
    return Boolean(capacitor && capacitor.isNativePlatform && capacitor.getPlatform() === 'android');
  }

  /**
   * Get installed version from Capacitor App plugin or fallback
   */
  public static async getInstalledVersion(): Promise<string> {
    try {
      if ((window as any).Capacitor?.isPluginAvailable('App')) {
        const { App } = await import('@capacitor/app').catch(() => ({ App: null }));
        if (App) {
          const info = await App.getInfo();
          return info.version;
        }
      }
    } catch (e) {
      console.warn('Capacitor App info unavailable:', e);
    }
    return '1.0.0';
  }

  /**
   * Perform version check for Android APK
   */
  public static async checkAndroidUpdate(forceRefresh: boolean = false): Promise<UpdateCheckResult> {
    const currentVersion = await this.getInstalledVersion();
    return checkForAppUpdates({
      currentVersion,
      targetPlatform: 'android',
      forceRefresh,
    });
  }

  /**
   * Download and launch APK installer
   */
  public static async downloadAndInstallApk(
    apkUrl: string,
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. If @capacitor/filesystem and @capacitor/browser or custom intent plugin are installed:
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
        try {
          const { Browser } = await import('@capacitor/browser').catch(() => ({ Browser: null }));
          if (Browser) {
            await Browser.open({ url: apkUrl });
            return { success: true };
          }
        } catch (err) {
          console.warn('Browser open failed, falling back to window.location', err);
        }
      }

      // 2. Web / In-app WebView direct download
      window.location.href = apkUrl;
      return { success: true };
    } catch (error: any) {
      console.error('Failed to trigger APK download:', error);
      return { success: false, error: error?.message || 'Download failed' };
    }
  }
}
