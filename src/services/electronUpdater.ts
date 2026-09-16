/**
 * Electron Auto-Update Service for Gen Music (Windows & macOS)
 * Bridges the React frontend with the Electron main process IPC.
 */

export interface ElectronUpdateInfo {
  version: string;
  files: any[];
  path: string;
  sha512: string;
  releaseDate: string;
  releaseNotes?: string | string[];
}

export interface ElectronProgressInfo {
  bytesPerSecond: number;
  percent: number;
  total: number;
  transferred: number;
}

export class ElectronUpdaterBridge {
  /**
   * Check if app is running in an Electron desktop environment
   */
  public static isElectron(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).electronAPI ||
      (window as any).process?.type === 'renderer' ||
      navigator.userAgent.toLowerCase().includes('electron')
    );
  }

  /**
   * Get application version
   */
  public static async getAppVersion(): Promise<string> {
    if (this.isElectron() && (window as any).electronAPI?.getAppVersion) {
      try {
        return await (window as any).electronAPI.getAppVersion();
      } catch (e) {
        console.warn('Error fetching app version from Electron:', e);
      }
    }
    return '1.0.0';
  }

  /**
   * Trigger check for updates via Electron main process
   */
  public static async checkForUpdates(): Promise<void> {
    if (this.isElectron() && (window as any).electronAPI?.checkForUpdates) {
      return (window as any).electronAPI.checkForUpdates();
    }
  }

  /**
   * Start downloading update package in background
   */
  public static async downloadUpdate(): Promise<void> {
    if (this.isElectron() && (window as any).electronAPI?.downloadUpdate) {
      return (window as any).electronAPI.downloadUpdate();
    }
  }

  /**
   * Install and restart application
   */
  public static async quitAndInstall(): Promise<void> {
    if (this.isElectron() && (window as any).electronAPI?.quitAndInstall) {
      return (window as any).electronAPI.quitAndInstall();
    }
  }

  /**
   * Listen for download progress updates from main process
   */
  public static onDownloadProgress(callback: (progress: ElectronProgressInfo) => void): () => void {
    if (this.isElectron() && (window as any).electronAPI?.onDownloadProgress) {
      return (window as any).electronAPI.onDownloadProgress(callback);
    }
    return () => {};
  }

  /**
   * Listen for update available event
   */
  public static onUpdateAvailable(callback: (info: ElectronUpdateInfo) => void): () => void {
    if (this.isElectron() && (window as any).electronAPI?.onUpdateAvailable) {
      return (window as any).electronAPI.onUpdateAvailable(callback);
    }
    return () => {};
  }

  /**
   * Listen for update downloaded & ready to install event
   */
  public static onUpdateDownloaded(callback: (info: ElectronUpdateInfo) => void): () => void {
    if (this.isElectron() && (window as any).electronAPI?.onUpdateDownloaded) {
      return (window as any).electronAPI.onUpdateDownloaded(callback);
    }
    return () => {};
  }
}
