import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';

// Configure logger
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Auto-updater configuration
autoUpdater.autoDownload = false; // User controls download or forced update controls it
autoUpdater.autoInstallOnAppQuit = true;

export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // Feed URL for Vercel / GitHub releases
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'https://genmugic.vercel.app/updates',
  });

  // IPC Handlers from Renderer
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, result };
    } catch (error: any) {
      log.error('Failed to check for updates:', error);
      return { success: false, error: error?.message };
    }
  });

  ipcMain.handle('start-download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error: any) {
      log.error('Failed to start update download:', error);
      return { success: false, error: error?.message };
    }
  });

  ipcMain.handle('install-and-restart', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  // AutoUpdater Event Listeners
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...');
    mainWindow.webContents.send('update-status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    mainWindow.webContents.send('update-available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
    mainWindow.webContents.send('update-not-available', info);
  });

  autoUpdater.on('error', (err) => {
    log.error('AutoUpdater error:', err);
    mainWindow.webContents.send('update-error', { error: err.message });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('download-progress', {
      bytesPerSecond: progressObj.bytesPerSecond,
      percent: Math.round(progressObj.percent),
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded and ready to install:', info);
    mainWindow.webContents.send('update-downloaded', info);
  });

  // Background check every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.warn('Background update check failed:', err);
    });
  }, 4 * 60 * 60 * 1000);
}
