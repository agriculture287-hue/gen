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
  Activity
} from 'lucide-react';
import { BlobDiagnosticModal } from './BlobDiagnosticModal';
import { AppPlatformRelease, PlatformType, TelegramChannel, TelegramConfig, UpdateItem } from '../types';
import { ADMIN_CREDENTIALS, verifyAdminCredentials } from '../data/adminStore';
import { VersionManifest } from '../types/update';
import { getLocalVersionManifest, saveLocalVersionManifest, DEFAULT_VERSION_MANIFEST } from '../data/versionManifest';
import { 
  checkBlobStatus, 
  putBlob, 
  testArticleBlobPut, 
  syncAppDataToBlob, 
  loadAppDataFromBlob, 
  listBlobs, 
  uploadAppFileToBlob,
  syncAllBackendDataToBlob,
  BlobItem 
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
  const [activeTab, setActiveTab] = useState<'apps' | 'whatsnew' | 'telegram' | 'channels' | 'version' | 'blob' | 'settings'>('apps');

  // Version Manifest State
  const [versionManifest, setVersionManifest] = useState<VersionManifest>(() => getLocalVersionManifest());
  const [newReleaseNote, setNewReleaseNote] = useState('');
  const [isSavingManifest, setIsSavingManifest] = useState(false);

  // Vercel Blob state
  const [blobStatus, setBlobStatus] = useState<{ configured: boolean; message: string }>({ configured: false, message: 'Not checked' });
  const [isCheckingBlob, setIsCheckingBlob] = useState(false);
  const [articlePath, setArticlePath] = useState('articles/blob.txt');
  const [articleText, setArticleText] = useState('Hello World!');
  const [articleAccess, setArticleAccess] = useState<'private' | 'public'>('private');
  const [isTestingArticle, setIsTestingArticle] = useState(false);
  const [testArticleResult, setTestArticleResult] = useState<any>(null);
  const [isSyncingToBlob, setIsSyncingToBlob] = useState(false);
  const [isLoadingFromBlob, setIsLoadingFromBlob] = useState(false);
  const [blobList, setBlobList] = useState<BlobItem[]>([]);
  const [loadingBlobList, setLoadingBlobList] = useState(false);

  // File Upload State for Blob storage
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<'android' | 'windows' | 'macos' | 'generic'>('android');
  const [customBlobPath, setCustomBlobPath] = useState('');
  const [isUploadingBinary, setIsUploadingBinary] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFeedback, setUploadFeedback] = useState<{ success?: boolean; message?: string; url?: string } | null>(null);
  const [isSyncingAllBackend, setIsSyncingAllBackend] = useState(false);
  const [blobSearchFilter, setBlobSearchFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing state for apps
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [editAppForm, setEditAppForm] = useState<Partial<AppPlatformRelease>>({});

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
  const [editUpdateForm, setEditUpdateForm] = useState<Partial<UpdateItem>>({});
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
  const [editChannelForm, setEditChannelForm] = useState<Partial<TelegramChannel>>({});
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelForm, setNewChannelForm] = useState<Partial<TelegramChannel>>({
    title: '',
    description: '',
    link: 'https://t.me/',
    badge: 'Community',
    memberCount: '10,000+ members',
  });

  // Unified All-in-One App Release Upload Form State
  const [unifiedFile, setUnifiedFile] = useState<File | null>(null);
  const [unifiedIsDragging, setUnifiedIsDragging] = useState(false);
  const [unifiedUseDirectUrl, setUnifiedUseDirectUrl] = useState(false);
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
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
  const [unifiedPublishResult, setUnifiedPublishResult] = useState<{
    success: boolean;
    message?: string;
    url?: string;
    sha256?: string;
    fileSize?: string;
  } | null>(null);
  const unifiedFileInputRef = useRef<HTMLInputElement>(null);

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
    setEditAppForm({ ...platform });
  };

  const handleSaveEditApp = (id: string) => {
    const updated = platforms.map((p) => (p.id === id ? ({ ...p, ...editAppForm } as AppPlatformRelease) : p));
    triggerUpdatePlatforms(updated);
    setEditingPlatformId(null);
    setEditAppForm({});
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

  const handleUnifiedFileSelected = (file: File | null) => {
    setUnifiedFile(file);
    setUnifiedPublishResult(null);
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    // Auto-detect version if present in filename like GEN_MUSIC_v2.6.0.apk or app-2.5.2.exe
    const versionMatch = file.name.match(/v?(\d+\.\d+(\.\d+)?)/i);
    if (versionMatch) {
      setUnifiedVersion(`v${versionMatch[1]}`);
    }

    if (lowerName.endsWith('.apk')) {
      setUnifiedPlatform('android');
      setUnifiedAppName('GEN MUSIC for Android');
      setUnifiedMinSystem('Android 8.0 or later (API 26+)');
      setUnifiedArchitecture('Universal ARM64 & ARM32');
      setUnifiedBadge('Direct APK (Latest)');
    } else if (lowerName.endsWith('.exe') || lowerName.endsWith('.msi')) {
      setUnifiedPlatform('windows');
      setUnifiedAppName('GEN MUSIC for Windows');
      setUnifiedMinSystem('Windows 10 / 11 (64-bit)');
      setUnifiedArchitecture('x64 Native');
      setUnifiedBadge('Official Setup (.exe)');
    } else if (lowerName.endsWith('.dmg') || lowerName.endsWith('.pkg')) {
      setUnifiedPlatform('mac');
      setUnifiedAppName('GEN MUSIC for macOS');
      setUnifiedMinSystem('macOS Monterey 12.0 or later');
      setUnifiedArchitecture('Universal Apple Silicon & Intel');
      setUnifiedBadge('Universal (.dmg)');
    } else if (lowerName.endsWith('.deb') || lowerName.endsWith('.appimage')) {
      setUnifiedPlatform('linux');
      setUnifiedAppName('GEN MUSIC for Linux');
      setUnifiedMinSystem('Ubuntu 20.04+ / Debian / Fedora');
      setUnifiedArchitecture('x86_64 AppImage');
      setUnifiedBadge('Official Linux Release');
    }
  };

  const handleUnifiedPublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unifiedUseDirectUrl && !unifiedFile) {
      onShowToast('Please select or drag an app file to upload.');
      return;
    }
    if (unifiedUseDirectUrl && !unifiedDirectUrl.trim()) {
      onShowToast('Please enter a valid download URL.');
      return;
    }

    setIsUnifiedPublishing(true);
    setUnifiedPublishResult(null);

    try {
      let finalDownloadUrl = unifiedDirectUrl.trim();
      let calculatedSha256 = '';
      let calculatedFileSize = '25.0 MB';

      // 1. If uploading file to Blob
      if (!unifiedUseDirectUrl && unifiedFile) {
        const platformKey = unifiedPlatform === 'mac' ? 'macos' : unifiedPlatform;
        const uploadRes = await uploadAppFileToBlob(
          unifiedFile,
          undefined,
          platformKey as any,
          'public'
        );

        if (!uploadRes.success || !uploadRes.blob) {
          throw new Error(uploadRes.error || 'Failed to upload binary to Blob storage');
        }

        finalDownloadUrl = uploadRes.blob.url;
        calculatedSha256 = uploadRes.sha256 || '';
        calculatedFileSize = `${(unifiedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      }

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
    setEditChannelForm({ ...ch });
  };

  const handleSaveEditChannel = (id: string) => {
    const updated = channels.map((c) => (c.id === id ? ({ ...c, ...editChannelForm } as TelegramChannel) : c));
    triggerUpdateChannels(updated);
    setEditingChannelId(null);
    setEditChannelForm({});
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
    setEditUpdateForm({ ...update });
    setEditHighlightsInput((update.highlights || []).join('\n'));
  };

  const handleCancelEditUpdate = () => {
    setEditingUpdateIndex(null);
    setEditUpdateForm({});
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
    setEditUpdateForm({});
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
      setBlobStatus(status);
      if (status.configured) {
        await handleFetchBlobList();
      }
    } catch (e: any) {
      setBlobStatus({ configured: false, message: e?.message || 'Error checking blob status' });
    } finally {
      setIsCheckingBlob(false);
    }
  };

  const handleFetchBlobList = async () => {
    setLoadingBlobList(true);
    try {
      const res = await listBlobs();
      if (res.success && Array.isArray(res.blobs)) {
        setBlobList(res.blobs);
      } else {
        setBlobList([]);
        if (res.error && !res.error.includes('not configured')) {
          setBlobStatus(prev => ({
            ...prev,
            configured: false,
            message: res.error || 'Access denied. Verify your BLOB_READ_WRITE_TOKEN.',
          }));
        }
      }
    } catch {
      setBlobList([]);
    } finally {
      setLoadingBlobList(false);
    }
  };

  const handleExecuteArticleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingArticle(true);
    setTestArticleResult(null);
    try {
      const res = await testArticleBlobPut(articleText, articlePath, articleAccess);
      setTestArticleResult(res);
      if (res.success) {
        onShowToast(`Blob stored at ${articlePath} (${articleAccess})!`);
        handleFetchBlobList();
      } else {
        onShowToast(res.error || 'Failed to put blob');
      }
    } catch (e: any) {
      setTestArticleResult({ success: false, error: e?.message || 'Failed test' });
    } finally {
      setIsTestingArticle(false);
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
        savedAt: new Date().toISOString(),
      };
      const res = await syncAppDataToBlob(payload);
      if (res.success) {
        onShowToast('Synchronized all app releases & data to Vercel Blob (app/genmusic-data.json)!');
        handleFetchBlobList();
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

  const handleBinaryFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      onShowToast('Please select a file to upload first.');
      return;
    }

    setIsUploadingBinary(true);
    setUploadProgress(0);
    setUploadFeedback(null);
    try {
      const platformArg = targetPlatform !== 'generic' ? targetPlatform : undefined;
      const res = await uploadAppFileToBlob(
        selectedUploadFile, 
        customBlobPath.trim() || undefined, 
        platformArg, 
        'public',
        (pct) => setUploadProgress(pct)
      );

      if (res.success && res.blob) {
        setUploadFeedback({
          success: true,
          message: res.message || 'File uploaded successfully to Vercel Blob!',
          url: res.blob.url,
        });
        onShowToast(`Uploaded ${selectedUploadFile.name} to Vercel Blob!`);

        // If target platform was selected, automatically update the platform download link
        if (targetPlatform !== 'generic') {
          const platformKey = targetPlatform === 'macos' ? 'mac' : targetPlatform;
          const matchedPlatform = platforms.find(p => p.platform === platformKey);
          if (matchedPlatform) {
            const updated = platforms.map(p => 
              p.id === matchedPlatform.id 
                ? { ...p, downloadUrl: res.blob!.url, fileSize: `${(selectedUploadFile.size / (1024 * 1024)).toFixed(1)} MB` } 
                : p
            );
            triggerUpdatePlatforms(updated);
          }

          // Also update version manifest
          setVersionManifest(prev => {
            const current = { ...prev };
            if (targetPlatform === 'android') current.android = { ...current.android, downloadUrl: res.blob!.url };
            if (targetPlatform === 'windows') current.windows = { ...current.windows, downloadUrl: res.blob!.url };
            if (targetPlatform === 'macos') current.macos = { ...current.macos, downloadUrl: res.blob!.url };
            saveLocalVersionManifest(current);
            return current;
          });
        }

        // Reset file input
        setSelectedUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        handleFetchBlobList();
      } else {
        setUploadFeedback({
          success: false,
          message: res.error || 'Failed to upload binary file to Blob storage.',
        });
        onShowToast(res.error || 'Upload failed');
      }
    } catch (e: any) {
      setUploadFeedback({
        success: false,
        message: e?.message || 'Error uploading file',
      });
      onShowToast('Error uploading file to Blob');
    } finally {
      setIsUploadingBinary(false);
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
        manifest: versionManifest,
      };
      const res = await syncAllBackendDataToBlob(payload);
      if (res.success) {
        onShowToast('All app files, version manifests & backend data synced to Blob Storage!');
        handleFetchBlobList();
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

      // 1. Push to backend /api/admin/update-version-manifest
      await fetch('/api/admin/update-version-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(versionManifest),
      });

      // 2. Persist full state to Vercel Blob
      await syncAllBackendDataToBlob({
        platforms,
        telegramConfig,
        channels,
        updates,
        manifest: versionManifest,
      });

      onShowToast('Version manifest saved & synchronized to Vercel Blob & /version.json!');
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
                      value={adminId}
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
                      value={adminPassword}
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
                  <FileCode className="w-4 h-4" />
                  <span>Update Server (/version.json)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('blob');
                    handleRefreshBlobStatus();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'blob'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Cloud className="w-4 h-4" />
                  <span>Cloud Store (@vercel/blob)</span>
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
                        <button
                          type="button"
                          onClick={() => setUnifiedUseDirectUrl(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            !unifiedUseDirectUrl
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FileUp className="w-3.5 h-3.5" />
                          <span>File Upload</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnifiedUseDirectUrl(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            unifiedUseDirectUrl
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Direct Link</span>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleUnifiedPublishRelease} className="space-y-5">
                      {/* Step 1: File Upload Dropzone or URL input */}
                      {!unifiedUseDirectUrl ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Step 1: Choose or Drag App Installer (.apk, .exe, .dmg, .zip)
                          </label>

                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setUnifiedIsDragging(true);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              setUnifiedIsDragging(false);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setUnifiedIsDragging(false);
                              const droppedFile = e.dataTransfer.files?.[0] || null;
                              if (droppedFile) handleUnifiedFileSelected(droppedFile);
                            }}
                            onClick={() => unifiedFileInputRef.current?.click()}
                            className={`p-6 rounded-2xl border-2 border-dashed transition text-center cursor-pointer ${
                              unifiedIsDragging
                                ? 'border-blue-500 bg-blue-100/50 scale-[0.99]'
                                : unifiedFile
                                ? 'border-emerald-400 bg-emerald-50/50'
                                : 'border-blue-300 bg-white hover:bg-blue-50/30'
                            }`}
                          >
                            <input
                              ref={unifiedFileInputRef}
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0] || null;
                                handleUnifiedFileSelected(f);
                              }}
                            />

                            {unifiedFile ? (
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                                  <FileCheck className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm font-mono">
                                      {unifiedFile.name}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                      {(unifiedFile.size / (1024 * 1024)).toFixed(1)} MB
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    File selected. Target platform and version have been auto-configured below. Click to choose another file.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 py-2">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
                                  <FileUp className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    Click to select or drag & drop app installer file here
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Supports Android <code className="text-blue-600 font-bold font-mono">.apk</code>, Windows <code className="text-blue-600 font-bold font-mono">.exe</code>, macOS <code className="text-blue-600 font-bold font-mono">.dmg</code>, Linux <code className="text-blue-600 font-bold font-mono">.deb/.AppImage</code> (Max: 250 MB)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Step 1: Primary Download Link / Direct CDN URL
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              value={unifiedDirectUrl}
                              onChange={(e) => setUnifiedDirectUrl(e.target.value)}
                              placeholder="https://github.com/genmusic/releases/download/v2.5.1/GEN_MUSIC.apk"
                              required={unifiedUseDirectUrl}
                              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Provide a direct downloadable link (GitHub Releases, Cloudflare R2, AWS S3, or direct CDN).
                          </p>
                        </div>
                      )}

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
                              value={unifiedPlatform}
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
                              value={unifiedAppName}
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
                                value={unifiedVersion}
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
                              value={unifiedBadge}
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
                              value={unifiedMinSystem}
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
                              value={unifiedArchitecture}
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
                              value={unifiedReleaseDate}
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
                              value={unifiedMirrorUrl}
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
                          value={unifiedHighlightsText}
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
                          disabled={isUnifiedPublishing || (!unifiedUseDirectUrl && !unifiedFile) || (unifiedUseDirectUrl && !unifiedDirectUrl.trim())}
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
                                  onClick={() => setEditingPlatformId(null)}
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
                          value={newHighlightsInput}
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
                                  value={editHighlightsInput}
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
                                  onClick={() => setEditingChannelId(null)}
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

              {/* TAB: VERSION MANIFEST (/version.json) */}
              {activeTab === 'version' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span>Central Update Server Manifest (/version.json)</span>
                      </h4>
                      <p className="text-xs text-blue-800 mt-1">
                        Control auto-update checks and minimum required versions for Android (.apk), Windows (.exe), and macOS (.dmg).
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
                        <span>{isSavingManifest ? 'Saving...' : 'Save & Sync Manifest'}</span>
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
                          v{versionManifest.android.latestVersion}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Latest Version</label>
                        <input
                          type="text"
                          value={versionManifest.android.latestVersion || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            android: { ...prev.android, latestVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Minimum Version (Force Update)</label>
                        <input
                          type="text"
                          value={versionManifest.android.minimumVersion || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            android: { ...prev.android, minimumVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Download URL</label>
                        <input
                          type="text"
                          value={versionManifest.android.downloadUrl || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            android: { ...prev.android, downloadUrl: e.target.value }
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
                          v{versionManifest.windows.latestVersion}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Latest Version</label>
                        <input
                          type="text"
                          value={versionManifest.windows.latestVersion || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            windows: { ...prev.windows, latestVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Minimum Version (Force Update)</label>
                        <input
                          type="text"
                          value={versionManifest.windows.minimumVersion || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            windows: { ...prev.windows, minimumVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Download URL</label>
                        <input
                          type="text"
                          value={versionManifest.windows.downloadUrl || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            windows: { ...prev.windows, downloadUrl: e.target.value }
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
                          v{versionManifest.macos.latestVersion}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Latest Version</label>
                        <input
                          type="text"
                          value={versionManifest.macos.latestVersion || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            macos: { ...prev.macos, latestVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Minimum Version (Force Update)</label>
                        <input
                          type="text"
                          value={versionManifest.macos.minimumVersion || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            macos: { ...prev.macos, minimumVersion: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Download URL</label>
                        <input
                          type="text"
                          value={versionManifest.macos.downloadUrl || ''}
                          onChange={(e) => setVersionManifest((prev: any) => ({
                            ...prev,
                            macos: { ...prev.macos, downloadUrl: e.target.value }
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
                        value={newReleaseNote}
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

              {/* TAB: VERCEL BLOB STORAGE & APP BINARY UPLOADER */}
              {activeTab === 'blob' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Cloud className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          Vercel Blob Storage Integration
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          blobStatus.configured 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-700 border border-amber-300'
                        }`}>
                          {blobStatus.configured ? 'Token Connected' : 'Checking Token'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {blobStatus.configured 
                          ? 'Vercel Blob is connected. Upload application binaries and sync backend data directly to cloud storage.'
                          : 'Ensure BLOB_READ_WRITE_TOKEN is configured in environment for production blob storage.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRefreshBlobStatus}
                        disabled={isCheckingBlob}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBlob ? 'animate-spin' : ''}`} />
                        <span>{isCheckingBlob ? 'Checking...' : 'Refresh Status'}</span>
                      </button>

                      <button
                        onClick={handleSyncAllBackend}
                        disabled={isSyncingAllBackend}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>{isSyncingAllBackend ? 'Syncing...' : 'Sync All Backend Data'}</span>
                      </button>

                      <button
                        onClick={() => setDiagnosticModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span>Run Diagnostics</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Upload App Binary Files (APK, EXE, DMG) */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <FileUp className="w-4 h-4 text-blue-600" />
                          <span>Upload App Binary / Release File</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Upload Android .apk, Windows .exe, or macOS .dmg binaries directly to Vercel Blob.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Max Size: 250 MB
                      </span>
                    </div>

                    <form onSubmit={handleBinaryFileUpload} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* File Selector */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Choose Binary Package (.apk, .exe, .dmg, .zip, .json)
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              ref={fileInputRef}
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setSelectedUploadFile(file);
                                if (file) {
                                  // Auto detect platform based on extension
                                  const name = file.name.toLowerCase();
                                  if (name.endsWith('.apk')) setTargetPlatform('android');
                                  else if (name.endsWith('.exe') || name.endsWith('.msi')) setTargetPlatform('windows');
                                  else if (name.endsWith('.dmg') || name.endsWith('.pkg')) setTargetPlatform('macos');
                                  else setTargetPlatform('generic');
                                }
                              }}
                              className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer p-1.5 border border-slate-200 rounded-xl bg-slate-50"
                              required
                            />
                          </div>
                          {selectedUploadFile && (
                            <p className="text-xs text-blue-600 font-medium">
                              Selected: <span className="font-bold">{selectedUploadFile.name}</span> ({(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        {/* Target Platform */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Target Platform Manifest Link
                          </label>
                          <select
                            value={targetPlatform}
                            onChange={(e) => setTargetPlatform(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
                          >
                            <option value="android">Android App (updates .apk link & manifest)</option>
                            <option value="windows">Windows App (updates .exe link & manifest)</option>
                            <option value="macos">macOS App (updates .dmg link & manifest)</option>
                            <option value="generic">Custom / Other File (generic pathname)</option>
                          </select>
                        </div>

                        {/* Custom Pathname */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Custom Blob Path (Optional)
                          </label>
                          <input
                            type="text"
                            value={customBlobPath}
                            onChange={(e) => setCustomBlobPath(e.target.value)}
                            placeholder="e.g. downloads/genmusic-v2.5.0.apk"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {isUploadingBinary && (
                        <div className="space-y-2 p-4 rounded-xl bg-blue-50 border border-blue-200">
                          <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                            <span>Uploading to Vercel Blob...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-blue-200 overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {uploadFeedback && (
                        <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                          uploadFeedback.success 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {uploadFeedback.success ? (
                            <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 overflow-hidden">
                            <p className="font-semibold">{uploadFeedback.message}</p>
                            {uploadFeedback.url && (
                              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] break-all">
                                <span className="text-slate-500">Blob URL:</span>
                                <a 
                                  href={uploadFeedback.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  {uploadFeedback.url}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={isUploadingBinary || !selectedUploadFile}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <FileUp className="w-4 h-4" />
                          <span>{isUploadingBinary ? 'Uploading to Blob...' : 'Upload File to Vercel Blob'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

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

                  {/* Section 3: Live Blob Storage Explorer */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-slate-700" />
                          <span>Blob Storage File Explorer ({blobList.length} files)</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          List of hosted files and assets in your Vercel Blob storage bucket.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={blobSearchFilter}
                          onChange={(e) => setBlobSearchFilter(e.target.value)}
                          placeholder="Filter files..."
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={handleFetchBlobList}
                          disabled={loadingBlobList}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                          title="Refresh list"
                        >
                          <RefreshCw className={`w-4 h-4 ${loadingBlobList ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {loadingBlobList ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-blue-500" />
                        Loading files from Vercel Blob...
                      </div>
                    ) : blobList.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                        <FolderOpen className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                        No files in blob storage yet. Upload a binary or run a sync to create your first cloud blob.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {blobList
                          .filter(b => !blobSearchFilter || b.pathname.toLowerCase().includes(blobSearchFilter.toLowerCase()))
                          .map((blob, idx) => (
                            <div 
                              key={blob.url || idx}
                              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 flex items-center justify-between gap-3 text-xs transition"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div className="overflow-hidden">
                                  <span className="font-bold text-slate-900 font-mono truncate block">
                                    {blob.pathname}
                                  </span>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                    {blob.size && <span>{(blob.size / 1024).toFixed(1)} KB</span>}
                                    {blob.uploadedAt && <span>{new Date(blob.uploadedAt).toLocaleDateString()}</span>}
                                    {blob.contentType && <span className="font-mono text-slate-400">{blob.contentType}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(blob.url);
                                    onShowToast('Copied Blob URL to clipboard!');
                                  }}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition"
                                  title="Copy URL"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={blob.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition"
                                  title="Open / Download"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Section 4: Article Test Verification */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-blue-600" />
                        Direct API Blob Put Verification
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        put('articles/blob.txt', '...', &#123; access: 'private' &#125;)
                      </span>
                    </div>

                    <form onSubmit={handleExecuteArticleTest} className="flex flex-wrap sm:flex-nowrap gap-2">
                      <input
                        type="text"
                        value={articlePath}
                        onChange={(e) => setArticlePath(e.target.value)}
                        placeholder="Path (e.g. articles/blob.txt)"
                        className="w-full sm:w-1/3 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={articleText}
                        onChange={(e) => setArticleText(e.target.value)}
                        placeholder="Text content"
                        className="w-full sm:w-1/2 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                      />
                      <select
                        value={articleAccess}
                        onChange={(e) => setArticleAccess(e.target.value as any)}
                        className="px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                      <button
                        type="submit"
                        disabled={isTestingArticle}
                        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {isTestingArticle ? 'Executing...' : 'Run Put'}
                      </button>
                    </form>

                    {testArticleResult && (
                      <div className={`p-2.5 rounded-lg text-xs font-mono break-all ${
                        testArticleResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {testArticleResult.success 
                          ? `Success! URL: ${testArticleResult.blob?.url || testArticleResult.message}` 
                          : `Error: ${testArticleResult.error}`}
                      </div>
                    )}
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

      {/* Blob Live Diagnostic Modal */}
      <BlobDiagnosticModal
        isOpen={diagnosticModalOpen}
        onClose={() => setDiagnosticModalOpen(false)}
      />
    </div>
  );
};
