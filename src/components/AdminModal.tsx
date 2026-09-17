import React, { useState, useRef } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Send, 
  Smartphone, 
  Laptop, 
  Monitor, 
  ExternalLink, 
  Check, 
  AlertCircle,
  KeyRound,
  LogOut,
  Layers,
  Sparkles,
  RefreshCw,
  Cloud,
  Database,
  UploadCloud,
  DownloadCloud,
  Copy,
  Terminal,
  FileCode,
  CheckCircle2,
  FileUp,
  HardDrive,
  Package,
  FolderOpen,
  FileCheck,
  Activity,
  Megaphone,
  Bell,
  Radio
} from 'lucide-react';
import { AppPlatformRelease, PlatformType, TelegramChannel, TelegramConfig, UpdateItem, AdSettings } from '../types';
import { ADMIN_CREDENTIALS, verifyAdminCredentials } from '../data/adminStore';
import { VersionManifest } from '../types/update';
import { 
  getLocalVersionManifest, 
  saveLocalVersionManifest, 
  DEFAULT_VERSION_MANIFEST,
  triggerLocalInAppUpdateAlert 
} from '../data/versionManifest';
import { 
  syncAppDataToBlob, 
  loadAppDataFromBlob, 
  syncAllBackendDataToBlob,
  BlobItem,
  checkBlobStatus
} from '../lib/blobStorage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onLogin?: () => void;
  onLoginSuccess?: () => void;
  onLogout: () => void;
  platforms: AppPlatformRelease[];
  onUpdatePlatforms?: (platforms: AppPlatformRelease[]) => void;
  onSavePlatforms?: (platforms: AppPlatformRelease[]) => void;
  telegramConfig: TelegramConfig;
  onUpdateTelegramConfig?: (cfg: TelegramConfig) => void;
  onSaveTelegramConfig?: (cfg: TelegramConfig) => void;
  channels: TelegramChannel[];
  onUpdateChannels?: (channels: TelegramChannel[]) => void;
  onSaveChannels?: (channels: TelegramChannel[]) => void;
  updates?: UpdateItem[];
  onUpdateUpdates?: (updates: UpdateItem[]) => void;
  onSaveUpdates?: (updates: UpdateItem[]) => void;
  adSettings?: AdSettings;
  onUpdateAdSettings?: (cfg: AdSettings) => void;
  onResetDefaults?: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  onLogin,
  onLoginSuccess,
  onLogout,
  platforms,
  onUpdatePlatforms,
  onSavePlatforms,
  telegramConfig,
  onUpdateTelegramConfig,
  onSaveTelegramConfig,
  channels,
  onUpdateChannels,
  onSaveChannels,
  updates = [],
  onUpdateUpdates,
  onSaveUpdates,
  adSettings,
  onUpdateAdSettings,
  onResetDefaults,
  onShowToast,
}) => {
  // Resilient prop fallbacks
  const triggerLogin = onLogin || onLoginSuccess || (() => {});
  const triggerUpdatePlatforms = onUpdatePlatforms || onSavePlatforms || (() => {});
  const triggerUpdateTelegram = onUpdateTelegramConfig || onSaveTelegramConfig || (() => {});
  const triggerUpdateChannels = onUpdateChannels || onSaveChannels || (() => {});
  const triggerUpdateUpdates = onUpdateUpdates || onSaveUpdates || (() => {});
  const triggerResetDefaults = onResetDefaults || (() => {});
  // Login State
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'apps' | 'whatsnew' | 'telegram' | 'channels' | 'version' | 'settings'>('apps');

  // Version Manifest State
  const [versionManifest, setVersionManifest] = useState<VersionManifest>(() => getLocalVersionManifest());
  const [newReleaseNote, setNewReleaseNote] = useState('');
  const [isSavingManifest, setIsSavingManifest] = useState(false);

  // Vercel Blob state
  const [blobStatus, setBlobStatus] = useState<{ configured: boolean; message: string }>({ configured: false, message: 'Not checked' });
  const [isCheckingBlob, setIsCheckingBlob] = useState(false);
  const [isSyncingToBlob, setIsSyncingToBlob] = useState(false);
  const [isSyncingAllBackend, setIsSyncingAllBackend] = useState(false);
  const [isLoadingFromBlob, setIsLoadingFromBlob] = useState(false);

  // Safe empty form initializers to prevent uncontrolled input switching
  const EMPTY_APP_FORM: Partial<AppPlatformRelease> = {
    name: '',
    version: '',
    fileFormat: '.apk',
    fileSize: '',
    releaseDate: '',
    minSystem: '',
    downloadUrl: '',
    mirrorUrl: '',
    architecture: '',
    badge: '',
  };

  const EMPTY_UPDATE_FORM: Partial<UpdateItem> = {
    version: '',
    releaseDate: '',
    tag: '',
    highlights: [],
  };

  const EMPTY_CHANNEL_FORM: Partial<TelegramChannel> = {
    title: '',
    description: '',
    link: '',
    badge: '',
    memberCount: '',
  };

  // Editing state for apps
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [editAppForm, setEditAppForm] = useState<Partial<AppPlatformRelease>>(EMPTY_APP_FORM);

  // Adding new app state
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newAppForm, setNewAppForm] = useState<Partial<AppPlatformRelease>>({
    name: 'GEN MUSIC for Android',
    platform: 'android',
    version: 'v2.5.0',
    fileFormat: '.apk',
    fileSize: '25.0 MB',
    releaseDate: 'September 2026',
    minSystem: 'Android 8.0 or later',
    downloadUrl: 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC.apk',
    mirrorUrl: 'https://t.me/genmusic_apk',
    architecture: 'Universal ARM64',
    badge: 'Direct Download',
  });

  // Editing state for updates / what's new
  const [editingUpdateIndex, setEditingUpdateIndex] = useState<number | null>(null);
  const [editUpdateForm, setEditUpdateForm] = useState<Partial<UpdateItem>>(EMPTY_UPDATE_FORM);
  const [editHighlightsInput, setEditHighlightsInput] = useState('');
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [newUpdateForm, setNewUpdateForm] = useState<Partial<UpdateItem>>({
    version: 'v2.5.1',
    releaseDate: 'October 2026',
    tag: 'Latest Release',
    highlights: ['Added performance optimizations and audio latency reductions.'],
  });
  const [newHighlightsInput, setNewHighlightsInput] = useState(
    'Added next-gen Dolby Audio 3D engine\nBatch offline MP3 downloader up to 320kbps\nZero battery drain background playback'
  );

  // Editing Telegram config
  const [tempTgConfig, setTempTgConfig] = useState<TelegramConfig>(telegramConfig);

  // Editing state for channels
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [editChannelForm, setEditChannelForm] = useState<Partial<TelegramChannel>>(EMPTY_CHANNEL_FORM);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelForm, setNewChannelForm] = useState<Partial<TelegramChannel>>({
    title: '',
    description: '',
    link: 'https://t.me/',
    badge: 'Community',
    memberCount: '10,000+ members',
  });

  // Unified All-in-One App Release Upload Form State
  const [unifiedPlatform, setUnifiedPlatform] = useState<PlatformType>('android');
  const [unifiedAppName, setUnifiedAppName] = useState('GEN MUSIC for Android');
  const [unifiedVersion, setUnifiedVersion] = useState('v2.5.1');
  const [unifiedMinSystem, setUnifiedMinSystem] = useState('Android 8.0 or later');
  const [unifiedArchitecture, setUnifiedArchitecture] = useState('Universal ARM64 & ARM32');
  const [unifiedReleaseDate, setUnifiedReleaseDate] = useState('September 2026');
  const [unifiedBadge, setUnifiedBadge] = useState('Direct APK (Latest)');
  const [unifiedDirectUrl, setUnifiedDirectUrl] = useState('');
  const [unifiedMirrorUrl, setUnifiedMirrorUrl] = useState('https://t.me/genmusic_apk');
  const [unifiedHighlightsText, setUnifiedHighlightsText] = useState(
    'Next-gen Dolby Atmos 3D audio engine\nDirect batch offline MP3 downloader up to 320kbps\nZero battery drain background playback\nFixed minor streaming latency issues'
  );
  const [unifiedAutoUpdateManifest, setUnifiedAutoUpdateManifest] = useState(true);
  const [unifiedAutoUpdateWhatsNew, setUnifiedAutoUpdateWhatsNew] = useState(true);
  const [unifiedAutoSaveBlob, setUnifiedAutoSaveBlob] = useState(true);
  const [isUnifiedPublishing, setIsUnifiedPublishing] = useState(false);
  const [unifiedPublishResult, setUnifiedPublishResult] = useState<{
    success: boolean;
    message?: string;
    url?: string;
    sha256?: string;
    fileSize?: string;
  } | null>(null);

  // Local state for Ads and Monetization editing
  const [adsForm, setAdsForm] = useState<AdSettings>(() => adSettings || {
    directSponsorLink: '',
    adsterraScriptHost: '',
    key728x90: '',
    key468x60: '',
    key320x50: '',
    key300x250: '',
    key160x300: '',
    key160x600: '',
    nativeScriptUrl: '',
    nativeContainerId: '',
    popunderScriptUrl1: '',
    popunderScriptUrl2: '',
    enableAds: true,
  });

  // Keep local adsForm in sync with prop if it loads from server/blob later
  React.useEffect(() => {
    if (adSettings) {
      setAdsForm(adSettings);
    }
  }, [adSettings]);

  const handleSaveAds = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateAdSettings) {
      onUpdateAdSettings(adsForm);
      onShowToast('Ads & monetization configuration saved and synced to cloud!');
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(adminId, adminPassword)) {
      triggerLogin();
      setLoginError('');
      setAdminId('');
      setAdminPassword('');
      onShowToast('Welcome back, Admin! Full control granted.');
    } else {
      setLoginError('Invalid ID or Password. Please check your credentials.');
    }
  };

  // Platform actions
  const handleStartEditApp = (platform: AppPlatformRelease) => {
    setEditingPlatformId(platform.id);
    setEditAppForm({ ...EMPTY_APP_FORM, ...platform });
  };

  const handleSaveEditApp = (id: string) => {
    const updated = platforms.map((p) => (p.id === id ? ({ ...p, ...editAppForm } as AppPlatformRelease) : p));
    triggerUpdatePlatforms(updated);
    setEditingPlatformId(null);
    setEditAppForm(EMPTY_APP_FORM);
    onShowToast('App details and download link updated successfully!');
  };

  const handleDeleteApp = (id: string) => {
    const updated = platforms.filter((p) => p.id !== id);
    triggerUpdatePlatforms(updated);
    onShowToast('App platform removed.');
  };

  const handleCreateNewApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppForm.name || !newAppForm.downloadUrl) {
      onShowToast('Please provide at least App Name and Download Link');
      return;
    }

    const newApp: AppPlatformRelease = {
      id: `app-custom-${Date.now()}`,
      name: newAppForm.name || 'GEN MUSIC App',
      platform: (newAppForm.platform as PlatformType) || 'android',
      version: newAppForm.version || 'v2.5.0',
      fileFormat: newAppForm.fileFormat || '.apk',
      fileSize: newAppForm.fileSize || '30 MB',
      releaseDate: newAppForm.releaseDate || 'September 2026',
      minSystem: newAppForm.minSystem || 'Compatible OS',
      downloadUrl: newAppForm.downloadUrl || '#',
      mirrorUrl: newAppForm.mirrorUrl || '',
      architecture: newAppForm.architecture || 'Universal',
      badge: newAppForm.badge || 'New Release',
      changelog: ['Standard release with full features'],
      isFeatured: true,
    };

    triggerUpdatePlatforms([...platforms, newApp]);
    setIsAddingApp(false);
    onShowToast(`Added "${newApp.name}" with download link!`);
  };

  // Telegram Config Save
  const handleSaveTelegramConfig = (e: React.FormEvent) => {
    e.preventDefault();
    triggerUpdateTelegram(tempTgConfig);
    onShowToast('Telegram Contact & Support link updated successfully!');
  };

  // Auto-fill metadata when platform changes
  const handleUnifiedPlatformChange = (p: PlatformType) => {
    setUnifiedPlatform(p);
    if (p === 'android') {
      setUnifiedAppName('GEN MUSIC for Android');
      setUnifiedMinSystem('Android 8.0 or later (API 26+)');
      setUnifiedArchitecture('Universal ARM64 & ARM32');
      setUnifiedBadge('Direct APK (Latest)');
    } else if (p === 'windows') {
      setUnifiedAppName('GEN MUSIC for Windows');
      setUnifiedMinSystem('Windows 10 / 11 (64-bit)');
      setUnifiedArchitecture('x64 Native');
      setUnifiedBadge('Official Setup (.exe)');
    } else if (p === 'mac') {
      setUnifiedAppName('GEN MUSIC for macOS');
      setUnifiedMinSystem('macOS Monterey 12.0 or later');
      setUnifiedArchitecture('Universal Apple Silicon & Intel');
      setUnifiedBadge('Universal (.dmg)');
    } else if (p === 'linux') {
      setUnifiedAppName('GEN MUSIC for Linux');
      setUnifiedMinSystem('Ubuntu 20.04+ / Debian / Fedora');
      setUnifiedArchitecture('x86_64 AppImage');
      setUnifiedBadge('Official Linux Package');
    } else if (p === 'web') {
      setUnifiedAppName('GEN MUSIC Web Player');
      setUnifiedMinSystem('Modern Web Browser (Chrome, Safari, Firefox)');
      setUnifiedArchitecture('PWA & WebAssembly');
      setUnifiedBadge('Web App');
    }
  };

  const handleUnifiedPublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unifiedDirectUrl.trim()) {
      onShowToast('Please enter a valid download URL.');
      return;
    }

    setIsUnifiedPublishing(true);
    setUnifiedPublishResult(null);

    try {
      let finalDownloadUrl = unifiedDirectUrl.trim();
      let calculatedSha256 = '';
      let calculatedFileSize = '25.0 MB';

      // Format highlights
      const parsedHighlights = unifiedHighlightsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const finalHighlights = parsedHighlights.length > 0 
        ? parsedHighlights 
        : ['Enhanced audio performance and streaming stability.'];

      const fileExtension = unifiedPlatform === 'android' ? '.apk' : unifiedPlatform === 'mac' ? '.dmg' : unifiedPlatform === 'windows' ? '.exe' : '.bin';

      // 2. Update/Add in Platforms list
      const updatedPlatforms = [...platforms];
      const existingPlatformIdx = updatedPlatforms.findIndex(p => p.platform === unifiedPlatform);

      const releasePayload: AppPlatformRelease = {
        id: existingPlatformIdx >= 0 ? updatedPlatforms[existingPlatformIdx].id : `app-${unifiedPlatform}-${Date.now()}`,
        name: unifiedAppName || `GEN MUSIC for ${unifiedPlatform.toUpperCase()}`,
        platform: unifiedPlatform,
        version: unifiedVersion,
        fileFormat: fileExtension,
        fileSize: calculatedFileSize,
        releaseDate: unifiedReleaseDate,
        minSystem: unifiedMinSystem,
        downloadUrl: finalDownloadUrl,
        mirrorUrl: unifiedMirrorUrl,
        architecture: unifiedArchitecture,
        badge: unifiedBadge,
        changelog: finalHighlights,
        isFeatured: true,
      };

      if (existingPlatformIdx >= 0) {
        updatedPlatforms[existingPlatformIdx] = releasePayload;
      } else {
        updatedPlatforms.push(releasePayload);
      }
      triggerUpdatePlatforms(updatedPlatforms);

      // 3. Update Version Manifest & /version.json
      const updatedManifest = { ...versionManifest };
      if (unifiedAutoUpdateManifest) {
        if (unifiedPlatform === 'android') {
          updatedManifest.android = {
            ...updatedManifest.android,
            latestVersion: unifiedVersion,
            downloadUrl: finalDownloadUrl,
            sha256: calculatedSha256 || updatedManifest.android.sha256,
            minimumVersion: unifiedMinSystem,
          };
        } else if (unifiedPlatform === 'windows') {
          updatedManifest.windows = {
            ...updatedManifest.windows,
            latestVersion: unifiedVersion,
            downloadUrl: finalDownloadUrl,
            sha256: calculatedSha256 || updatedManifest.windows.sha256,
          };
        } else if (unifiedPlatform === 'mac') {
          updatedManifest.macos = {
            ...updatedManifest.macos,
            latestVersion: unifiedVersion,
            downloadUrl: finalDownloadUrl,
            sha256: calculatedSha256 || updatedManifest.macos.sha256,
          };
        }

        // Add to release notes
        updatedManifest.releaseNotes = Array.from(new Set([...finalHighlights, ...updatedManifest.releaseNotes]));
        setVersionManifest(updatedManifest);
        saveLocalVersionManifest(updatedManifest);

        // Post to backend /api/admin/update-version-manifest
        fetch('/api/admin/update-version-manifest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedManifest),
        }).catch(() => {});
      }

      // 4. Update What's New list
      let updatedUpdatesList = [...updates];
      if (unifiedAutoUpdateWhatsNew) {
        const newUpdateItem: UpdateItem = {
          version: unifiedVersion,
          releaseDate: unifiedReleaseDate,
          tag: unifiedBadge,
          highlights: finalHighlights,
        };
        // Remove duplicate version entry if exists, then prepend
        updatedUpdatesList = [newUpdateItem, ...updatedUpdatesList.filter(u => u.version !== unifiedVersion)];
        triggerUpdateUpdates(updatedUpdatesList);
      }

      // 5. Automatically Sync Everything to Vercel Blob
      if (unifiedAutoSaveBlob) {
        syncAllBackendDataToBlob({
          platforms: updatedPlatforms,
          telegramConfig,
          channels,
          updates: updatedUpdatesList,
          manifest: updatedManifest,
        }).catch(() => {});
      }

      setUnifiedPublishResult({
        success: true,
        message: `App release ${unifiedVersion} published successfully!`,
        url: finalDownloadUrl,
        sha256: calculatedSha256,
        fileSize: calculatedFileSize,
      });

      onShowToast(`🚀 Published ${unifiedAppName} (${unifiedVersion}) in 1 single step!`);
    } catch (err: any) {
      setUnifiedPublishResult({
        success: false,
        message: err?.message || 'Failed to publish release',
      });
      onShowToast(err?.message || 'Error publishing release');
    } finally {
      setIsUnifiedPublishing(false);
    }
  };

  // Channel actions
  const handleStartEditChannel = (ch: TelegramChannel) => {
    setEditingChannelId(ch.id);
    setEditChannelForm({ ...EMPTY_CHANNEL_FORM, ...ch });
  };

  const handleSaveEditChannel = (id: string) => {
    const updated = channels.map((c) => (c.id === id ? ({ ...c, ...editChannelForm } as TelegramChannel) : c));
    triggerUpdateChannels(updated);
    setEditingChannelId(null);
    setEditChannelForm(EMPTY_CHANNEL_FORM);
    onShowToast('Telegram channel updated!');
  };

  const handleDeleteChannel = (id: string) => {
    const updated = channels.filter((c) => c.id !== id);
    triggerUpdateChannels(updated);
    onShowToast('Channel removed from list.');
  };

  const handleCreateNewChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelForm.title || !newChannelForm.link) {
      onShowToast('Please fill in Channel Title and Link.');
      return;
    }

    const created: TelegramChannel = {
      id: `ch-${Date.now()}`,
      title: newChannelForm.title,
      description: newChannelForm.description || 'Official Telegram channel for GEN MUSIC community.',
      link: newChannelForm.link,
      badge: newChannelForm.badge || 'Community',
      memberCount: newChannelForm.memberCount || '1,000+ members',
      isPrimary: false,
    };

    triggerUpdateChannels([...channels, created]);
    setIsAddingChannel(false);
    setNewChannelForm({
      title: '',
      description: '',
      link: 'https://t.me/',
      badge: 'Community',
      memberCount: '10,000+ members',
    });
    onShowToast(`Added channel "${created.title}"!`);
  };

  // What's New / Updates Handlers
  const handleStartEditUpdate = (update: UpdateItem, index: number) => {
    setEditingUpdateIndex(index);
    setEditUpdateForm({ ...EMPTY_UPDATE_FORM, ...update });
    setEditHighlightsInput((update.highlights || []).join('\n'));
  };

  const handleCancelEditUpdate = () => {
    setEditingUpdateIndex(null);
    setEditUpdateForm(EMPTY_UPDATE_FORM);
    setEditHighlightsInput('');
  };

  const handleSaveEditUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUpdateIndex === null) return;
    const parsedHighlights = editHighlightsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedList = [...updates];
    const prev = updatedList[editingUpdateIndex] || {
      version: 'v2.5.0',
      releaseDate: 'Recent',
      tag: 'Release',
      highlights: [],
    };
    updatedList[editingUpdateIndex] = {
      version: editUpdateForm.version || prev.version,
      releaseDate: editUpdateForm.releaseDate || prev.releaseDate,
      tag: editUpdateForm.tag || prev.tag,
      highlights: parsedHighlights.length > 0 ? parsedHighlights : prev.highlights,
    };

    triggerUpdateUpdates(updatedList);
    setEditingUpdateIndex(null);
    setEditUpdateForm(EMPTY_UPDATE_FORM);
    setEditHighlightsInput('');
    onShowToast(`Updated What's New for ${updatedList[editingUpdateIndex].version}!`);
  };

  const handleDeleteUpdate = (index: number) => {
    const target = updates[index];
    const updatedList = updates.filter((_, idx) => idx !== index);
    triggerUpdateUpdates(updatedList);
    onShowToast(`Deleted update note ${target?.version || ''}!`);
  };

  const handleCreateNewUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateForm.version) return;
    const parsedHighlights = newHighlightsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const created: UpdateItem = {
      version: newUpdateForm.version,
      releaseDate: newUpdateForm.releaseDate || 'Current Release',
      tag: newUpdateForm.tag || 'Latest Release',
      highlights: parsedHighlights.length > 0 ? parsedHighlights : ['Various stability fixes and enhancements.'],
    };

    triggerUpdateUpdates([created, ...updates]);
    setIsAddingUpdate(false);
    setNewUpdateForm({
      version: '',
      releaseDate: '',
      tag: 'Latest Release',
      highlights: [],
    });
    setNewHighlightsInput('');
    onShowToast(`Published new What's New announcement ${created.version}!`);
  };

  // Vercel Blob Handlers
  const handleRefreshBlobStatus = async () => {
    setIsCheckingBlob(true);
    try {
      const status = await checkBlobStatus();
      setBlobStatus({ configured: status.configured, message: status.message || '' });
    } catch (e: any) {
      setBlobStatus({ configured: false, message: e?.message || 'Error checking status' });
    } finally {
      setIsCheckingBlob(false);
    }
  };
  const handleSyncToVercelBlob = async () => {
    setIsSyncingToBlob(true);
    try {
      const payload = {
        platforms,
        telegramConfig,
        channels,
        updates,
        adSettings,
        savedAt: new Date().toISOString(),
      };
      const res = await syncAppDataToBlob(payload);
      if (res.success) {
        onShowToast('Synchronized all app releases & data to Vercel Blob (app/genmusic-data.json)!');
      } else {
        onShowToast(res.error || 'Sync failed. Ensure BLOB_READ_WRITE_TOKEN is set.');
      }
    } catch (e: any) {
      onShowToast(e?.message || 'Error syncing data');
    } finally {
      setIsSyncingToBlob(false);
    }
  };

  const handleRestoreFromVercelBlob = async () => {
    setIsLoadingFromBlob(true);
    try {
      const res = await loadAppDataFromBlob();
      if (res.success && res.data) {
        const cloudData = res.data;
        if (cloudData.platforms) triggerUpdatePlatforms(cloudData.platforms);
        if (cloudData.telegramConfig) triggerUpdateTelegram(cloudData.telegramConfig);
        if (cloudData.channels) triggerUpdateChannels(cloudData.channels);
        if (cloudData.updates) triggerUpdateUpdates(cloudData.updates);
        if (cloudData.adSettings && onUpdateAdSettings) onUpdateAdSettings(cloudData.adSettings);
        onShowToast('Successfully loaded and imported app data from Vercel Blob!');
      } else {
        onShowToast(res.error || 'No saved cloud data found in Vercel Blob.');
      }
    } catch (e: any) {
      onShowToast(e?.message || 'Error restoring from blob');
    } finally {
      setIsLoadingFromBlob(false);
    }
  };

  const handleSyncAllBackend = async () => {
    setIsSyncingAllBackend(true);
    try {
      const payload = {
        platforms,
        telegramConfig,
        channels,
        updates,
        adSettings,
        manifest: versionManifest,
      };
      const res = await syncAllBackendDataToBlob(payload);
      if (res.success) {
        onShowToast('All app files, version manifests & backend data synced to Blob Storage!');
      } else {
        onShowToast(res.error || 'Backend sync failed. Verify BLOB_READ_WRITE_TOKEN.');
      }
    } catch (e: any) {
      onShowToast(e?.message || 'Error syncing backend data');
    } finally {
      setIsSyncingAllBackend(false);
    }
  };

  const handleSaveVersionManifest = async () => {
    setIsSavingManifest(true);
    try {
      saveLocalVersionManifest(versionManifest);

      // Sync into platforms state for download hub
      const updatedPlatforms = platforms.map(p => {
        if (p.platform === 'android' && versionManifest.android.downloadUrl) {
          return { ...p, version: versionManifest.android.latestVersion, downloadUrl: versionManifest.android.downloadUrl };
        }
        if (p.platform === 'windows' && versionManifest.windows.downloadUrl) {
          return { ...p, version: versionManifest.windows.latestVersion, downloadUrl: versionManifest.windows.downloadUrl };
        }
        if (p.platform === 'mac' && versionManifest.macos.downloadUrl) {
          return { ...p, version: versionManifest.macos.latestVersion, downloadUrl: versionManifest.macos.downloadUrl };
        }
        return p;
      });
      triggerUpdatePlatforms(updatedPlatforms);

      // 1. Push to backend /api/admin/update-version-manifest
      await fetch('/api/admin/update-version-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(versionManifest),
      });

      // 2. Persist full state to Vercel Blob
      await syncAllBackendDataToBlob({
        platforms: updatedPlatforms,
        telegramConfig,
        channels,
        updates,
        adSettings,
        manifest: versionManifest,
      });

      onShowToast('Version manifest & download links saved and synchronized everywhere!');
    } catch (e: any) {
      saveLocalVersionManifest(versionManifest);
      onShowToast('Saved version manifest locally.');
    } finally {
      setIsSavingManifest(false);
    }
  };

  const handleAddReleaseNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleaseNote.trim()) return;
    setVersionManifest((prev) => ({
      ...prev,
      releaseNotes: [...prev.releaseNotes, newReleaseNote.trim()],
    }));
    setNewReleaseNote('');
  };

  const handleRemoveReleaseNote = (idx: number) => {
    setVersionManifest((prev) => ({
      ...prev,
      releaseNotes: prev.releaseNotes.filter((_, i) => i !== idx),
    }));
  };

  const [isTriggeringAlert, setIsTriggeringAlert] = useState(false);
  const [alertTargetPlatform, setAlertTargetPlatform] = useState<string>('all');
  const [alertIsMandatory, setAlertIsMandatory] = useState<boolean>(false);

  const handleBroadcastInAppUpdate = async () => {
    setIsTriggeringAlert(true);
    try {
      const version = versionManifest.android.latestVersion || '2.5.0';
      const alertPayload = {
        id: `alert-${Date.now()}`,
        version,
        title: `GEN MUSIC v${version} Update Available!`,
        releaseNotes: versionManifest.releaseNotes.length > 0 
          ? versionManifest.releaseNotes 
          : [
              'Lossless 320kbps MP3 offline saver & audio cache',
              'Equalizer & 3D Dolby Surround enhancements',
              'Zero audio commercials and uninterrupted playback'
            ],
        platform: alertTargetPlatform,
        isMandatory: alertIsMandatory,
        minSupportedVersion: versionManifest.android.minimumVersion || '1.0.0',
        downloadUrls: {
          android: versionManifest.android.downloadUrl,
          windows: versionManifest.windows.downloadUrl,
          macos: versionManifest.macos.downloadUrl,
        },
        triggeredAt: Date.now(),
      };

      // 1. Broadcast locally
      triggerLocalInAppUpdateAlert(alertPayload);

      // 2. Synchronize to server broadcast endpoint
      try {
        await fetch('/api/admin/trigger-update-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertPayload),
        });
      } catch (srvErr) {
        console.warn('Could not post to /api/admin/trigger-update-alert', srvErr);
      }

      // 3. Update active platform releases if matching
      const updatedPlatforms = platforms.map(p => {
        if (p.platform === 'android' && versionManifest.android.downloadUrl) {
          return { ...p, version: versionManifest.android.latestVersion, downloadUrl: versionManifest.android.downloadUrl };
        }
        if (p.platform === 'windows' && versionManifest.windows.downloadUrl) {
          return { ...p, version: versionManifest.windows.latestVersion, downloadUrl: versionManifest.windows.downloadUrl };
        }
        if (p.platform === 'mac' && versionManifest.macos.downloadUrl) {
          return { ...p, version: versionManifest.macos.latestVersion, downloadUrl: versionManifest.macos.downloadUrl };
        }
        return p;
      });
      triggerUpdatePlatforms(updatedPlatforms);

      onShowToast(`🚀 In-App Update Notice triggered for v${version}! Users will see the in-app update modal.`);
    } catch (err: any) {
      onShowToast('Error triggering in-app update: ' + err.message);
    } finally {
      setIsTriggeringAlert(false);
    }
  };

  const handlePreviewInAppUpdate = () => {
    const version = versionManifest.android.latestVersion || '2.5.0';
    const alertPayload = {
      id: `alert-preview-${Date.now()}`,
      version,
      title: `GEN MUSIC v${version} Update Available!`,
      releaseNotes: versionManifest.releaseNotes,
      platform: alertTargetPlatform,
      isMandatory: alertIsMandatory,
      minSupportedVersion: versionManifest.android.minimumVersion || '1.0.0',
      downloadUrls: {
        android: versionManifest.android.downloadUrl,
        windows: versionManifest.windows.downloadUrl,
        macos: versionManifest.macos.downloadUrl,
      },
      triggeredAt: Date.now(),
    };
    triggerLocalInAppUpdateAlert(alertPayload);
    onShowToast('In-App Update Modal triggered for preview!');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  GEN MUSIC Admin Control Center
                </h3>
                {isAdminLoggedIn && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                    Live Session Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isAdminLoggedIn 
                  ? 'Administrator Session Active'
                  : 'Authorized Personnel Access'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isAdminLoggedIn ? (
            /* LOGIN SCREEN */
            <div className="max-w-md mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 font-heading">
                  Admin Verification
                </h4>
                <p className="text-xs sm:text-sm text-slate-500">
                  Enter your administrator ID and password to access the management portal.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Admin ID / Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={adminId || ''}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="Enter Admin ID"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={adminPassword || ''}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter Password"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Access Admin Panel</span>
                </button>
              </form>
            </div>
          ) : (
            /* ADMIN LOGGED IN DASHBOARD */
            <div className="space-y-6">
              {/* Cloud Persistence Status Banner */}
              <div className="p-3 px-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                  </span>
                  <p className="text-xs font-semibold text-slate-700">
                    <span className="text-blue-700 font-bold">Vercel Blob Cloud Persistence:</span> Everything managed from this panel is automatically saved to Vercel Blob storage.
                  </p>
                </div>
                <button
                  onClick={handleSyncAllBackend}
                  disabled={isSyncingAllBackend}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer shadow-xs disabled:opacity-50"
                  title="Manual 1-click cloud sync"
                >
                  <Cloud className={`w-3.5 h-3.5 ${isSyncingAllBackend ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAllBackend ? 'Syncing...' : 'Sync to Blob'}</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setActiveTab('apps')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'apps'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Apps & Download Links ({platforms.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('whatsnew')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'whatsnew'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>What's New ({updates.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('telegram')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'telegram'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram Contact Link</span>
                </button>

                <button
                  onClick={() => setActiveTab('channels')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'channels'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Channel List ({channels.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('version')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'version'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>App Updates & In-App Alerts</span>
                </button>

                <button
                  onClick={() => setActiveTab('ads')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'ads'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Ads & Monetization</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset / Logout</span>
                </button>
              </div>

              {/* TAB 1: APPS & PLATFORMS */}
              {activeTab === 'apps' && (
                <div className="space-y-6">
                  {/* UNIFIED ALL-IN-ONE APP RELEASE & BINARY UPLOADER */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-white border-2 border-blue-200/80 shadow-md space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-base font-heading">
                            All-in-One App Release & Binary Uploader
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                            1-Click Save
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 max-w-2xl">
                          Upload your application installer file (.apk, .exe, .dmg, .zip) or enter a download link, specify the version and changelog, and save everywhere in one single step.
                        </p>
                      </div>

                      {/* Mode Toggle */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-blue-700 shadow-xs">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Direct Link</span>
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleUnifiedPublishRelease} className="space-y-5">
                      {/* Step 1: File URL input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Step 1: Primary Download Link / Direct CDN URL (GitHub Release Link)
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={unifiedDirectUrl || ''}
                            onChange={(e) => setUnifiedDirectUrl(e.target.value)}
                            placeholder="https://github.com/genmusic/releases/download/v2.5.1/GEN_MUSIC.apk"
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Provide a direct downloadable link (GitHub Releases, Cloudflare R2, AWS S3, or direct CDN).
                        </p>
                      </div>

                      {/* Step 2: Version & Platform Metadata in One Clean Grid */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Step 2: App Release Specifications
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                          {/* Platform Selector */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              Platform
                            </label>
                            <select
                              value={unifiedPlatform || ''}
                              onChange={(e) => handleUnifiedPlatformChange(e.target.value as PlatformType)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            >
                              <option value="android">📱 Android (.apk)</option>
                              <option value="windows">🪟 Windows (.exe)</option>
                              <option value="mac">🍏 macOS (.dmg)</option>
                              <option value="linux">🐧 Linux (.deb / AppImage)</option>
                              <option value="web">🌐 Web App</option>
                            </select>
                          </div>

                          {/* App Name */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              App Display Name
                            </label>
                            <input
                              type="text"
                              value={unifiedAppName || ''}
                              onChange={(e) => setUnifiedAppName(e.target.value)}
                              placeholder="e.g. GEN MUSIC for Android"
                              required
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* App Version */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              Version Number
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={unifiedVersion || ''}
                                onChange={(e) => setUnifiedVersion(e.target.value)}
                                placeholder="e.g. v2.5.1"
                                required
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-blue-600 font-mono focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          {/* Release Badge */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              Badge / Release Tag
                            </label>
                            <input
                              type="text"
                              value={unifiedBadge || ''}
                              onChange={(e) => setUnifiedBadge(e.target.value)}
                              placeholder="e.g. Direct APK (Latest)"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Min OS */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              Min OS Requirement
                            </label>
                            <input
                              type="text"
                              value={unifiedMinSystem || ''}
                              onChange={(e) => setUnifiedMinSystem(e.target.value)}
                              placeholder="e.g. Android 8.0 or later"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Architecture */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              Architecture / CPU
                            </label>
                            <input
                              type="text"
                              value={unifiedArchitecture || ''}
                              onChange={(e) => setUnifiedArchitecture(e.target.value)}
                              placeholder="e.g. Universal ARM64 & ARM32"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Release Date */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              Release Date
                            </label>
                            <input
                              type="text"
                              value={unifiedReleaseDate || ''}
                              onChange={(e) => setUnifiedReleaseDate(e.target.value)}
                              placeholder="e.g. September 2026"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Telegram / Mirror Link */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              Telegram / Backup Mirror
                            </label>
                            <input
                              type="text"
                              value={unifiedMirrorUrl || ''}
                              onChange={(e) => setUnifiedMirrorUrl(e.target.value)}
                              placeholder="https://t.me/genmusic_apk"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 3: What's New / Highlights */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Step 3: What's New & Changelog Highlights
                          </label>
                          <span className="text-[11px] text-slate-500">
                            1 bullet point per line
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={unifiedHighlightsText || ''}
                          onChange={(e) => setUnifiedHighlightsText(e.target.value)}
                          placeholder="Added next-gen Dolby Audio engine&#10;Batch offline MP3 downloader up to 320kbps&#10;Zero battery drain background playback"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-sans focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {/* Step 4: 1-Click Save Sync Destinations */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          1-Click Save & Sync Destinations
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={true}
                              disabled
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="font-semibold text-slate-800">
                              Website Download Cards
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={unifiedAutoUpdateManifest}
                              onChange={(e) => setUnifiedAutoUpdateManifest(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                            <span className="font-semibold text-slate-800">
                              Update Server (/version.json)
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={unifiedAutoUpdateWhatsNew}
                              onChange={(e) => setUnifiedAutoUpdateWhatsNew(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                            <span className="font-semibold text-slate-800">
                              What's New Announcements
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={unifiedAutoSaveBlob}
                              onChange={(e) => setUnifiedAutoSaveBlob(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                            <span className="font-semibold text-slate-800">
                              Cloud Store (@vercel/blob)
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Result Box if Published */}
                      {unifiedPublishResult && (
                        <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          unifiedPublishResult.success 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5">
                              {unifiedPublishResult.success ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                              )}
                              {unifiedPublishResult.message}
                            </span>
                          </div>

                          {unifiedPublishResult.url && (
                            <div className="space-y-1 pt-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[11px] text-slate-700">Live Download Link:</span>
                                <input
                                  type="text"
                                  readOnly
                                  value={unifiedPublishResult.url || ''}
                                  className="flex-grow px-2 py-1 bg-white rounded-lg border border-slate-300 text-[11px] font-mono text-blue-700 select-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(unifiedPublishResult.url || '');
                                    onShowToast('Download link copied to clipboard!');
                                  }}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1 text-slate-700 cursor-pointer shadow-xs"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </button>
                              </div>

                              {unifiedPublishResult.sha256 && (
                                <p className="text-[10px] text-slate-500 font-mono truncate">
                                  SHA-256 Checksum: {unifiedPublishResult.sha256}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Submit Button */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>Publishing updates website downloads, OTA updates, and cloud storage at once.</span>
                        </div>

                        <button
                          type="submit"
                          disabled={isUnifiedPublishing || !unifiedDirectUrl.trim()}
                          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                          {isUnifiedPublishing ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Uploading & Publishing Release...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4" />
                              <span>Upload & Publish App Release (1-Click Everywhere)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Section: Manage Existing Platform Download Cards */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        Current Active Platform Releases ({platforms.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        View, edit individual parameters, or test download links for current platforms.
                      </p>
                    </div>
                  </div>

                  {/* List of Current Apps */}
                  <div className="space-y-4">
                    {platforms.map((platform) => {
                      const isEditing = editingPlatformId === platform.id;

                      return (
                        <div
                          key={platform.id}
                          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
                        >
                          {isEditing ? (
                            /* Editing Card */
                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-blue-200">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-blue-800">
                                  Editing: {platform.name}
                                </span>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                  {platform.platform}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">App Name</label>
                                  <input
                                    type="text"
                                    value={editAppForm.name || ''}
                                    onChange={(e) => setEditAppForm({ ...editAppForm, name: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs mt-0.5"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">Version (e.g. v2.5.0)</label>
                                  <input
                                    type="text"
                                    value={editAppForm.version || ''}
                                    onChange={(e) => setEditAppForm({ ...editAppForm, version: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-blue-600 mt-0.5"
                                  />
                                </div>

                                <div className="sm:col-span-2">
                                  <label className="text-[11px] font-semibold text-slate-700">Direct Download Link</label>
                                  <input
                                    type="text"
                                    value={editAppForm.downloadUrl || ''}
                                    onChange={(e) => setEditAppForm({ ...editAppForm, downloadUrl: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono mt-0.5"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">File Size</label>
                                  <input
                                    type="text"
                                    value={editAppForm.fileSize || ''}
                                    onChange={(e) => setEditAppForm({ ...editAppForm, fileSize: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs mt-0.5"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">Min OS Requirement</label>
                                  <input
                                    type="text"
                                    value={editAppForm.minSystem || ''}
                                    onChange={(e) => setEditAppForm({ ...editAppForm, minSystem: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs mt-0.5"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">Release Date</label>
                                  <input
                                    type="text"
                                    value={editAppForm.releaseDate || ''}
                                    onChange={(e) => setEditAppForm({ ...editAppForm, releaseDate: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs mt-0.5"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">Telegram / Mirror URL</label>
                                  <input
                                    type="text"
                                    value={editAppForm.mirrorUrl || ''}
                                    onChange={(e) => setEditAppForm({ ...editAppForm, mirrorUrl: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs mt-0.5"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPlatformId(null);
                                    setEditAppForm(EMPTY_APP_FORM);
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditApp(platform.id)}
                                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save Changes</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Read-only Platform Card with Edit/Delete triggers */
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-3 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                                  {platform.platform === 'android' ? (
                                    <Smartphone className="w-5 h-5 text-emerald-600" />
                                  ) : platform.platform === 'mac' ? (
                                    <Laptop className="w-5 h-5 text-purple-600" />
                                  ) : (
                                    <Monitor className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                                      {platform.name}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[11px] font-bold">
                                      {platform.version}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                                      {platform.fileSize} ({platform.fileFormat})
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {platform.minSystem} • Released {platform.releaseDate}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono truncate max-w-md">
                                    <span className="text-slate-400">URL:</span>
                                    <span className="truncate text-blue-600">{platform.downloadUrl}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                  onClick={() => handleStartEditApp(platform)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteApp(platform.id)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                  title="Delete Platform"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: WHAT'S NEW & ANNOUNCEMENTS */}
              {activeTab === 'whatsnew' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Manage What's New & Release Notes
                      </h4>
                      <p className="text-xs text-slate-500">
                        Add, edit, or delete release notes and changelog bullet points displayed in the What's New section.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingUpdate(!isAddingUpdate)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Release Announcement</span>
                    </button>
                  </div>

                  {/* Add New Announcement Form */}
                  {isAddingUpdate && (
                    <form onSubmit={handleCreateNewUpdate} className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-blue-300 space-y-4">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-blue-600" />
                        Create New Release Announcement
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Version</label>
                          <input
                            type="text"
                            value={newUpdateForm.version || ''}
                            onChange={(e) => setNewUpdateForm({ ...newUpdateForm, version: e.target.value })}
                            placeholder="e.g. v2.6.0"
                            required
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700">Release Date</label>
                          <input
                            type="text"
                            value={newUpdateForm.releaseDate || ''}
                            onChange={(e) => setNewUpdateForm({ ...newUpdateForm, releaseDate: e.target.value })}
                            placeholder="e.g. October 2026"
                            required
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700">Tag / Badge</label>
                          <input
                            type="text"
                            value={newUpdateForm.tag || ''}
                            onChange={(e) => setNewUpdateForm({ ...newUpdateForm, tag: e.target.value })}
                            placeholder="e.g. Latest Release"
                            required
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Changelog Bullet Points (one per line)
                        </label>
                        <textarea
                          rows={4}
                          value={newHighlightsInput || ''}
                          onChange={(e) => setNewHighlightsInput(e.target.value)}
                          placeholder="Added next-gen Dolby Audio engine&#10;Zero latency playback&#10;Improved equalizer stability"
                          required
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                        />
                        <span className="text-[11px] text-slate-400">
                          Each line will be saved as an individual highlight item.
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingUpdate(false)}
                          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
                        >
                          Publish Announcement
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Announcements */}
                  <div className="space-y-4">
                    {updates.map((item, index) => {
                      const isEditing = editingUpdateIndex === index;

                      return (
                        <div
                          key={`update-${index}`}
                          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
                        >
                          {isEditing ? (
                            <form onSubmit={handleSaveEditUpdate} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-blue-200">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-blue-800">
                                  Editing: {item.version}
                                </span>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                  {item.tag}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">Version</label>
                                  <input
                                    type="text"
                                    value={editUpdateForm.version || ''}
                                    onChange={(e) => setEditUpdateForm({ ...editUpdateForm, version: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">Release Date</label>
                                  <input
                                    type="text"
                                    value={editUpdateForm.releaseDate || ''}
                                    onChange={(e) => setEditUpdateForm({ ...editUpdateForm, releaseDate: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-semibold text-slate-700">Tag / Badge</label>
                                  <input
                                    type="text"
                                    value={editUpdateForm.tag || ''}
                                    onChange={(e) => setEditUpdateForm({ ...editUpdateForm, tag: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[11px] font-semibold text-slate-700">
                                  Changelog Bullet Points (one per line)
                                </label>
                                <textarea
                                  rows={4}
                                  value={editHighlightsInput || ''}
                                  onChange={(e) => setEditHighlightsInput(e.target.value)}
                                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                                  required
                                />
                              </div>

                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={handleCancelEditUpdate}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save Changes</span>
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                    {item.version}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                    {item.tag}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    Released: {item.releaseDate}
                                  </span>
                                </div>

                                <ul className="space-y-1.5 pt-2">
                                  {item.highlights.map((hl, hIdx) => (
                                    <li key={hIdx} className="text-xs text-slate-700 flex items-start gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                      <span>{hl}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex sm:flex-col items-center gap-1.5 self-end sm:self-start">
                                <button
                                  onClick={() => handleStartEditUpdate(item, index)}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                  title="Edit Changelog"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUpdate(index)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                  title="Delete Announcement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: TELEGRAM CONTACT LINK */}
              {activeTab === 'telegram' && (
                <div className="space-y-6">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      Admin Direct Telegram Contact Link
                    </h4>
                    <p className="text-xs text-slate-500">
                      Edit the direct Telegram handle and contact URL. This link is linked across the navbar, contact sections, and download help buttons.
                    </p>
                  </div>

                  <form onSubmit={handleSaveTelegramConfig} className="space-y-4 max-w-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Telegram Username
                      </label>
                      <input
                        type="text"
                        value={tempTgConfig.contactUsername || ''}
                        onChange={(e) => setTempTgConfig({ ...tempTgConfig, contactUsername: e.target.value })}
                        placeholder="@genmusic_admin"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Full Telegram Direct Link (t.me)
                      </label>
                      <input
                        type="url"
                        value={tempTgConfig.contactUrl || ''}
                        onChange={(e) => setTempTgConfig({ ...tempTgConfig, contactUrl: e.target.value })}
                        placeholder="https://t.me/genmusic_admin"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Support Availability Note
                      </label>
                      <input
                        type="text"
                        value={tempTgConfig.supportHours || ''}
                        onChange={(e) => setTempTgConfig({ ...tempTgConfig, supportHours: e.target.value })}
                        placeholder="Admin Direct Support • Available 24/7"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Announcement Note
                      </label>
                      <textarea
                        rows={2}
                        value={tempTgConfig.announcementText || ''}
                        onChange={(e) => setTempTgConfig({ ...tempTgConfig, announcementText: e.target.value })}
                        placeholder="Contact admin directly on Telegram for fast assistance..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update Telegram Contact Link</span>
                      </button>

                      <a
                        href={tempTgConfig.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: CHANNEL LIST */}
              {activeTab === 'channels' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        Telegram Channel List
                      </h4>
                      <p className="text-xs text-slate-500">
                        Add, edit, or remove official Telegram channels for announcements, APK downloads, and beta testing.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingChannel(!isAddingChannel)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Channel</span>
                    </button>
                  </div>

                  {/* Add New Channel Form */}
                  {isAddingChannel && (
                    <form onSubmit={handleCreateNewChannel} className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-blue-300 space-y-4">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-blue-600" />
                        Add Telegram Channel to Community Directory
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Channel Title</label>
                          <input
                            type="text"
                            value={newChannelForm.title || ''}
                            onChange={(e) => setNewChannelForm({ ...newChannelForm, title: e.target.value })}
                            placeholder="e.g. GEN MUSIC Official Channel"
                            required
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700">Telegram Link</label>
                          <input
                            type="url"
                            value={newChannelForm.link || ''}
                            onChange={(e) => setNewChannelForm({ ...newChannelForm, link: e.target.value })}
                            placeholder="https://t.me/genmusic_official"
                            required
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-700">Description</label>
                          <input
                            type="text"
                            value={newChannelForm.description || ''}
                            onChange={(e) => setNewChannelForm({ ...newChannelForm, description: e.target.value })}
                            placeholder="Official announcements, APK releases, and server status."
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700">Badge / Tag</label>
                          <input
                            type="text"
                            value={newChannelForm.badge || ''}
                            onChange={(e) => setNewChannelForm({ ...newChannelForm, badge: e.target.value })}
                            placeholder="e.g. Announcements or Direct Downloads"
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700">Member Count</label>
                          <input
                            type="text"
                            value={newChannelForm.memberCount || ''}
                            onChange={(e) => setNewChannelForm({ ...newChannelForm, memberCount: e.target.value })}
                            placeholder="e.g. 50,000+ members"
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingChannel(false)}
                          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                        >
                          Save Channel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Channels List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {channels.map((ch) => {
                      const isEditing = editingChannelId === ch.id;

                      return (
                        <div
                          key={ch.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative"
                        >
                          {isEditing ? (
                            <div className="space-y-2 bg-slate-50 p-3 rounded-xl">
                              <input
                                type="text"
                                value={editChannelForm.title || ''}
                                onChange={(e) => setEditChannelForm({ ...editChannelForm, title: e.target.value })}
                                placeholder="Channel Title"
                                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={editChannelForm.link || ''}
                                onChange={(e) => setEditChannelForm({ ...editChannelForm, link: e.target.value })}
                                placeholder="https://t.me/..."
                                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-mono"
                              />
                              <input
                                type="text"
                                value={editChannelForm.description || ''}
                                onChange={(e) => setEditChannelForm({ ...editChannelForm, description: e.target.value })}
                                placeholder="Description"
                                className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editChannelForm.badge || ''}
                                  onChange={(e) => setEditChannelForm({ ...editChannelForm, badge: e.target.value })}
                                  placeholder="Tag"
                                  className="px-2 py-1 rounded bg-white border border-slate-300 text-xs"
                                />
                                <input
                                  type="text"
                                  value={editChannelForm.memberCount || ''}
                                  onChange={(e) => setEditChannelForm({ ...editChannelForm, memberCount: e.target.value })}
                                  placeholder="Members"
                                  className="px-2 py-1 rounded bg-white border border-slate-300 text-xs"
                                />
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingChannelId(null);
                                    setEditChannelForm(EMPTY_CHANNEL_FORM);
                                  }}
                                  className="px-2.5 py-1 text-xs text-slate-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditChannel(ch.id)}
                                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 text-sm">{ch.title}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                      {ch.badge}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 line-clamp-2">
                                    {ch.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleStartEditChannel(ch)}
                                    className="p-1 text-slate-400 hover:text-slate-700"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChannel(ch.id)}
                                    className="p-1 text-rose-400 hover:text-rose-600"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                <span className="font-semibold text-slate-600">{ch.memberCount}</span>
                                <a
                                  href={ch.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                                >
                                  <span>Open Link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: APP UPDATES & IN-APP ALERTS (/version.json) */}
              {activeTab === 'version' && (
                <div className="space-y-6">
                  
                  {/* IN-APP UPDATE ALERT BROADCAST CONSOLE */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-5 border border-blue-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold border border-blue-400/30">
                          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                          <span>Live In-App Broadcast Engine</span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black tracking-tight font-heading text-white">
                          Trigger In-App Update Notification
                        </h4>
                        <p className="text-xs text-blue-200/80 max-w-xl">
                          Broadcast a pop-up update notification with release highlights and direct download buttons to all active visitors and app users immediately.
                        </p>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handlePreviewInAppUpdate}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
                        >
                          <span>👁️ Preview In-App Modal</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleBroadcastInAppUpdate}
                          disabled={isTriggeringAlert}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-pink-500/20 transition cursor-pointer disabled:opacity-60"
                        >
                          <Megaphone className="w-4 h-4" />
                          <span>{isTriggeringAlert ? 'Broadcasting...' : '🚀 Trigger In-App Update Notice'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Broadcast Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                      <div>
                        <span className="text-blue-300 block font-semibold mb-1">Target Version to Broadcast:</span>
                        <span className="font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg inline-block">
                          v{versionManifest.android.latestVersion || '2.5.0'}
                        </span>
                      </div>

                      <div>
                        <label className="text-blue-300 block font-semibold mb-1">Platform Filter:</label>
                        <select
                          value={alertTargetPlatform}
                          onChange={(e) => setAlertTargetPlatform(e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-800 text-white rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-blue-400 cursor-pointer"
                        >
                          <option value="all">All Platforms (Android, Windows, Mac)</option>
                          <option value="android">Android Only</option>
                          <option value="windows">Windows Only</option>
                          <option value="macos">macOS Only</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={alertIsMandatory}
                            onChange={(e) => setAlertIsMandatory(e.target.checked)}
                            className="w-4 h-4 text-pink-600 rounded cursor-pointer"
                          />
                          <span className="font-semibold text-blue-200">
                            Mandatory (Force Update - Cannot Dismiss)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Central Update Server Manifest & Save Bar */}
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span>Central Update Server Manifest (/version.json)</span>
                      </h4>
                      <p className="text-xs text-blue-800 mt-1">
                        Control latest versions, minimum required versions, and direct download links for Android (.apk), Windows (.exe), and macOS (.dmg).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="/version.json"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                      >
                        <span>View JSON</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={handleSaveVersionManifest}
                        disabled={isSavingManifest}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSavingManifest ? 'Saving...' : 'Save & Sync Everywhere'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Platforms Version Matrix Forms */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Android */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          Android APK
                        </span>
                        <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          v{versionManifest?.android?.latestVersion || '1.0.1'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Latest Version</label>
                        <input
                          type="text"
                          value={versionManifest?.android?.latestVersion ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            android: { ...(prev?.android || {}), latestVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Minimum Version (Force Update)</label>
                        <input
                          type="text"
                          value={versionManifest?.android?.minimumVersion ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            android: { ...(prev?.android || {}), minimumVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Download URL</label>
                        <input
                          type="text"
                          value={versionManifest?.android?.downloadUrl ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            android: { ...(prev?.android || {}), downloadUrl: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Windows */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Monitor className="w-4 h-4 text-blue-600" />
                          Windows EXE
                        </span>
                        <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          v{versionManifest?.windows?.latestVersion || '1.0.1'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Latest Version</label>
                        <input
                          type="text"
                          value={versionManifest?.windows?.latestVersion ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            windows: { ...(prev?.windows || {}), latestVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Minimum Version (Force Update)</label>
                        <input
                          type="text"
                          value={versionManifest?.windows?.minimumVersion ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            windows: { ...(prev?.windows || {}), minimumVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Download URL</label>
                        <input
                          type="text"
                          value={versionManifest?.windows?.downloadUrl ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            windows: { ...(prev?.windows || {}), downloadUrl: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* macOS */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Laptop className="w-4 h-4 text-indigo-600" />
                          macOS DMG
                        </span>
                        <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          v{versionManifest?.macos?.latestVersion || '1.0.1'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Latest Version</label>
                        <input
                          type="text"
                          value={versionManifest?.macos?.latestVersion ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            macos: { ...(prev?.macos || {}), latestVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Minimum Version (Force Update)</label>
                        <input
                          type="text"
                          value={versionManifest?.macos?.minimumVersion ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            macos: { ...(prev?.macos || {}), minimumVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Download URL</label>
                        <input
                          type="text"
                          value={versionManifest?.macos?.downloadUrl ?? ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            macos: { ...(prev?.macos || {}), downloadUrl: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Release Notes Editor */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Shared Release Notes ({versionManifest.releaseNotes.length} bullet points)
                    </h5>

                    <div className="space-y-2">
                      {versionManifest.releaseNotes.map((note, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                          <span className="text-slate-700">{note}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReleaseNote(index)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddReleaseNote} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={newReleaseNote || ''}
                        onChange={(e) => setNewReleaseNote(e.target.value)}
                        placeholder="Add new release note highlight..."
                        className="flex-grow px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {/* TAB: ADS & MONETIZATION */}
              {activeTab === 'ads' && adsForm && (
                <form onSubmit={handleSaveAds} className="space-y-6 max-w-3xl">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Megaphone className="w-5 h-5 text-blue-600" />
                          <span>Ads & Monetization Config</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Control site-wide ad delivery, Adsterra scripts, banner placement keys, popunder URLs, and direct sponsor redirection links.
                        </p>
                      </div>
                      
                      {/* Master Switch */}
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={adsForm.enableAds}
                          onChange={(e) => setAdsForm({ ...adsForm, enableAds: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-xs font-bold text-slate-700">
                          {adsForm.enableAds ? 'MONETIZATION ON' : 'MONETIZATION OFF'}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Sponsor Redirect Link */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <span>Sponsor Redirect Link (Direct Link URL)</span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">Required</span>
                        </label>
                        <input
                          type="url"
                          value={adsForm.directSponsorLink || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, directSponsorLink: e.target.value })}
                          placeholder="e.g. https://www.profitablecpmrate.com/abcdef"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                        <p className="text-[10px] text-slate-400">
                          When users click ad units, download mirrors, or sponsor links, they will redirect via <code className="bg-slate-100 p-0.5 rounded font-mono">/api/sponsor-click</code> to this address.
                        </p>
                      </div>

                      {/* Adsterra Script Host */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Adsterra Global Script Host
                        </label>
                        <input
                          type="text"
                          value={adsForm.adsterraScriptHost || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, adsterraScriptHost: e.target.value })}
                          placeholder="e.g. www.profitablecpmrate.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                        <p className="text-[10px] text-slate-400">
                          Main domain/host used by Adsterra script execution (safely proxies script downloads to avoid browser blockages).
                        </p>
                      </div>

                      {/* Popunder Script URLs */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Popunder / Social Bar URL 1
                        </label>
                        <input
                          type="url"
                          value={adsForm.popunderScriptUrl1 || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, popunderScriptUrl1: e.target.value })}
                          placeholder="Popunder javascript URL"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Popunder / Social Bar URL 2
                        </label>
                        <input
                          type="url"
                          value={adsForm.popunderScriptUrl2 || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, popunderScriptUrl2: e.target.value })}
                          placeholder="Second popunder javascript URL"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                      </div>

                      {/* Slot Keys Heading */}
                      <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">
                          Banner Placement Keys / Tag Hashes
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          Configure hashes generated by your Adsterra publisher dashboard for standard slots.
                        </p>
                      </div>

                      {/* Banner Slots keys */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Leaderboard (728x90) Key
                        </label>
                        <input
                          type="text"
                          value={adsForm.key728x90 || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, key728x90: e.target.value })}
                          placeholder="32-char slot hash"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Standard (468x60) Key
                        </label>
                        <input
                          type="text"
                          value={adsForm.key468x60 || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, key468x60: e.target.value })}
                          placeholder="32-char slot hash"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Mobile Banner (320x50) Key
                        </label>
                        <input
                          type="text"
                          value={adsForm.key320x50 || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, key320x50: e.target.value })}
                          placeholder="32-char slot hash"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Medium Rectangle (300x250) Key
                        </label>
                        <input
                          type="text"
                          value={adsForm.key300x250 || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, key300x250: e.target.value })}
                          placeholder="32-char slot hash"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Vertical Skyscraper (160x300) Key
                        </label>
                        <input
                          type="text"
                          value={adsForm.key160x300 || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, key160x300: e.target.value })}
                          placeholder="32-char slot hash"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Vertical Skyscraper (160x600) Key
                        </label>
                        <input
                          type="text"
                          value={adsForm.key160x600 || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, key160x600: e.target.value })}
                          placeholder="32-char slot hash"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                        />
                      </div>

                      {/* Native Ad Setup Section */}
                      <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">
                          Sponsored Native In-Feed Banner Config
                        </h5>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Native Script Url
                        </label>
                        <input
                          type="text"
                          value={adsForm.nativeScriptUrl || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, nativeScriptUrl: e.target.value })}
                          placeholder="Native ad network javascript url"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Native Container Div ID
                        </label>
                        <input
                          type="text"
                          value={adsForm.nativeContainerId || ''}
                          onChange={(e) => setAdsForm({ ...adsForm, nativeContainerId: e.target.value })}
                          placeholder="Container ID (e.g. container-abcdef)"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                        />
                      </div>

                    </div>

                    <div className="border-t border-slate-100 pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm animate-pulse-subtle"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Ads Configuration</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB: SETTINGS & CLOUD SYNC */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Section 2: Backend Data & Releases Sync */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Database className="w-4 h-4 text-indigo-600" />
                          <span>Backend Data & Manifest Synchronization</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Persist all release definitions, Telegram channels, and version matrices to Vercel Blob storage.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-blue-600" />
                            Push to Cloud Storage
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            Saves complete snapshot to <code className="text-blue-600 font-mono">app/genmusic-data.json</code> and updates version endpoints.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSyncToVercelBlob}
                          disabled={isSyncingToBlob}
                          className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{isSyncingToBlob ? 'Syncing...' : 'Save App State to Blob'}</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <DownloadCloud className="w-4 h-4 text-emerald-600" />
                            Restore from Cloud Storage
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            Loads the latest application data snapshot from Vercel Blob into the active session.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRestoreFromVercelBlob}
                          disabled={isLoadingFromBlob}
                          className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>{isLoadingFromBlob ? 'Restoring...' : 'Restore State from Blob'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS & LOGOUT */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-xl">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Admin Session Status
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      You are authenticated as <strong className="text-slate-900">{ADMIN_CREDENTIALS.id}</strong>. Any changes you make are instantly synchronized to the site and saved in local memory.
                    </p>
                    <button
                      onClick={() => {
                        onLogout();
                        onShowToast('Admin logged out securely.');
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Admin</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                      Reset to Default Site Configuration
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Reset all platform links, Android/Mac/Windows apps, version numbers, and Telegram channels back to default initial values.
                    </p>
                    <button
                      onClick={() => {
                        triggerResetDefaults();
                        onShowToast('Reset all configurations to factory defaults!');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset All to Defaults</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
