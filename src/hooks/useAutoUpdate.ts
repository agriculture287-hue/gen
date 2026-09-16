import { useState, useEffect, useCallback } from 'react';
import { UpdateCheckResult, SupportedPlatform } from '../types/update';
import {
  checkForAppUpdates,
  executePlatformDownload,
} from '../services/updateService';
import {
  CURRENT_CLIENT_APP_VERSION,
  detectCurrentPlatform,
  getDismissedVersion,
  setDismissedVersion,
} from '../data/versionManifest';
import { ElectronUpdaterBridge } from '../services/electronUpdater';
import { CapacitorUpdater } from '../services/capacitorUpdater';

export interface UseAutoUpdateReturn {
  updateInfo: UpdateCheckResult | null;
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  isUpdateModalOpen: boolean;
  isForceUpdateScreen: boolean;
  detectedPlatform: SupportedPlatform;
  installedVersion: string;
  checkNow: (forceRefresh?: boolean) => Promise<UpdateCheckResult>;
  triggerDownload: () => Promise<void>;
  installAndRestart: () => Promise<void>;
  dismissUpdate: () => void;
  openUpdateModal: () => void;
  closeUpdateModal: () => void;
  simulateVersionCheck: (simulatedInstalledVersion: string) => Promise<UpdateCheckResult>;
}

export function useAutoUpdate(): UseAutoUpdateReturn {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [installedVersion, setInstalledVersion] = useState<string>(CURRENT_CLIENT_APP_VERSION);
  const [detectedPlatform, setDetectedPlatform] = useState<SupportedPlatform>('web');

  // Detect platform and environment version on mount
  useEffect(() => {
    const platform = detectCurrentPlatform();
    setDetectedPlatform(platform);

    const detectRealVersion = async () => {
      if (ElectronUpdaterBridge.isElectron()) {
        const v = await ElectronUpdaterBridge.getAppVersion();
        setInstalledVersion(v);
      } else if (CapacitorUpdater.isCapacitorAndroid()) {
        const v = await CapacitorUpdater.getInstalledVersion();
        setInstalledVersion(v);
      }
    };

    detectRealVersion();
  }, []);

  // Check for updates
  const checkNow = useCallback(
    async (forceRefresh: boolean = false): Promise<UpdateCheckResult> => {
      setIsChecking(true);
      try {
        const result = await checkForAppUpdates({
          currentVersion: installedVersion,
          targetPlatform: detectedPlatform,
          forceRefresh,
        });

        setUpdateInfo(result);

        // If mandatory, force update modal open immediately
        if (result.isMandatory) {
          setIsUpdateModalOpen(true);
        } else if (result.hasUpdate) {
          // If optional update, check if user dismissed this specific version
          const dismissed = getDismissedVersion();
          if (forceRefresh || dismissed !== result.latestVersion) {
            setIsUpdateModalOpen(true);
          }
        }

        return result;
      } finally {
        setIsChecking(false);
      }
    },
    [installedVersion, detectedPlatform]
  );

  // Automatic check on application launch (respects 6-hour cache)
  useEffect(() => {
    checkNow(false);

    // Listen for native Electron progress events if in desktop container
    if (ElectronUpdaterBridge.isElectron()) {
      const unsubProgress = ElectronUpdaterBridge.onDownloadProgress((prog) => {
        setIsDownloading(true);
        setDownloadProgress(prog.percent || 0);
      });

      const unsubDownloaded = ElectronUpdaterBridge.onUpdateDownloaded(() => {
        setIsDownloading(false);
        setDownloadProgress(100);
      });

      return () => {
        unsubProgress();
        unsubDownloaded();
      };
    }
  }, [checkNow]);

  // Trigger Download
  const triggerDownload = async () => {
    if (!updateInfo) return;
    setIsDownloading(true);
    setDownloadProgress(10);

    // Simulated progress tick for web / apk fallback
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    try {
      if (CapacitorUpdater.isCapacitorAndroid()) {
        await CapacitorUpdater.downloadAndInstallApk(updateInfo.downloadUrl);
      } else {
        await executePlatformDownload(updateInfo.downloadUrl, detectedPlatform);
      }
      clearInterval(interval);
      setDownloadProgress(100);
    } catch (e) {
      clearInterval(interval);
      console.error('Download execution error:', e);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    }
  };

  const installAndRestart = async () => {
    if (ElectronUpdaterBridge.isElectron()) {
      await ElectronUpdaterBridge.quitAndInstall();
    } else {
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    if (updateInfo?.isMandatory) {
      // Cannot dismiss mandatory update
      return;
    }
    if (updateInfo?.latestVersion) {
      setDismissedVersion(updateInfo.latestVersion);
    }
    setIsUpdateModalOpen(false);
  };

  const openUpdateModal = () => setIsUpdateModalOpen(true);
  const closeUpdateModal = () => {
    if (!updateInfo?.isMandatory) {
      setIsUpdateModalOpen(false);
    }
  };

  // Test simulation tool for admin/debug
  const simulateVersionCheck = async (simulatedInstalledVersion: string) => {
    setIsChecking(true);
    try {
      const result = await checkForAppUpdates({
        currentVersion: simulatedInstalledVersion,
        targetPlatform: detectedPlatform,
        forceRefresh: true,
      });
      setInstalledVersion(simulatedInstalledVersion);
      setUpdateInfo(result);
      setIsUpdateModalOpen(true);
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  const isForceUpdateScreen = Boolean(updateInfo && updateInfo.isMandatory && isUpdateModalOpen);

  return {
    updateInfo,
    isChecking,
    isDownloading,
    downloadProgress,
    isUpdateModalOpen,
    isForceUpdateScreen,
    detectedPlatform,
    installedVersion,
    checkNow,
    triggerDownload,
    installAndRestart,
    dismissUpdate,
    openUpdateModal,
    closeUpdateModal,
    simulateVersionCheck,
  };
}
