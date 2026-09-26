import { useState, useEffect } from 'react';

export interface EchoMusicSyncState {
  isSyncing: boolean;
  isSynced: boolean;
  lastSyncedAt: number | null;
  repoName: string;
  latestTag: string;
  modulesCount: number;
  error: string | null;
}

const STORAGE_KEY = 'echomusic_github_sync_manifest';

export function useEchoMusicSync(autoTrigger = true) {
  const [syncState, setSyncState] = useState<EchoMusicSyncState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          isSyncing: false,
          isSynced: true,
          lastSyncedAt: parsed.syncTimestamp || Date.now(),
          repoName: parsed.repo?.name || 'EchoMusicApp/Echo-Music',
          latestTag: parsed.repo?.latestTag || 'v2.4.0',
          modulesCount: parsed.syncedCodeModules?.length || 5,
          error: null,
        };
      }
    } catch {}

    return {
      isSyncing: false,
      isSynced: false,
      lastSyncedAt: null,
      repoName: 'EchoMusicApp/Echo-Music',
      latestTag: 'v2.4.0',
      modulesCount: 5,
      error: null,
    };
  });

  const performSync = async () => {
    setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const res = await fetch('/api/echomusic/sync');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (data.success) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSyncState({
          isSyncing: false,
          isSynced: true,
          lastSyncedAt: data.syncTimestamp || Date.now(),
          repoName: data.repo?.name || 'EchoMusicApp/Echo-Music',
          latestTag: data.repo?.latestTag || 'v2.4.0',
          modulesCount: data.syncedCodeModules?.length || 5,
          error: null,
        });
      } else {
        throw new Error(data.error || 'Sync returned false');
      }
    } catch (err: any) {
      console.warn('EchoMusic automated sync background notice:', err);
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Network sync timeout',
      }));
    }
  };

  useEffect(() => {
    if (!autoTrigger) return;

    // Check if synced within the last 10 minutes
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    if (!syncState.lastSyncedAt || now - syncState.lastSyncedAt > tenMinutes) {
      performSync();
    }
  }, [autoTrigger]);

  return {
    ...syncState,
    triggerSync: performSync,
  };
}
