import React, { useState } from 'react';
import { X, Download, FileUp, Link2, CheckCircle2, AlertCircle, Sparkles, Music } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const PlaylistImportModal: React.FC = () => {
  const {
    isImportModalOpen,
    setIsImportModalOpen,
    importPlaylistFromUrlOrData
  } = useMusicPlayer();

  const [inputUrl, setInputUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isImportModalOpen) return null;

  const handleImport = async () => {
    if (!inputUrl.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await importPlaylistFromUrlOrData(inputUrl);
      if (result) {
        setSuccessMsg(`Successfully imported "${result.name}" with ${result.tracks.length} tracks!`);
        setInputUrl('');
      } else {
        setErrorMsg('Could not parse playlist. Please check your URL or M3U text format.');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Import failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0d1226] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-bold shadow-md shadow-emerald-500/20">
              <FileUp className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Import Playlists</h3>
              <p className="text-xs text-slate-400">Spotify, YouTube Music, & M3U Playlist Converter</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsImportModalOpen(false);
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Paste Playlist Link or M3U Content
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M or YouTube playlist URL or M3U content"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">✓ Spotify Links</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">✓ YouTube Playlists</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">✓ M3U / Text Tracklists</span>
          </div>
        </div>

        {/* Status messages */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleImport}
          disabled={isLoading || !inputUrl.trim()}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:opacity-90 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 transition cursor-pointer"
        >
          {isLoading ? (
            <span className="animate-pulse">Importing & Resolving Tracks...</span>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              <span>Import to My Library</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
