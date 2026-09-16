import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  HardDrive, 
  Lock, 
  Cloud, 
  ExternalLink, 
  X, 
  Terminal, 
  ShieldCheck,
  UploadCloud,
  FileText
} from 'lucide-react';

export interface DiagnosticLog {
  timestamp: string;
  step: string;
  status: 'info' | 'success' | 'warn' | 'error';
  detail: string;
}

export interface DiagnosticData {
  success: boolean;
  summary: string;
  storeConfig: {
    isConfigured: boolean;
    storeId?: string;
    tokenMasked?: string;
    detectedAccessMode?: 'public' | 'private' | 'unknown';
  };
  testResults: {
    publicAccessUpload: boolean;
    privateAccessUpload: boolean;
    uploadedUrl: string | null;
    listQueryWorking: boolean;
    blobsCountInStore: number;
  };
  logs: DiagnosticLog[];
  durationMs: number;
  error?: string;
}

interface BlobDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlobDiagnosticModal: React.FC<BlobDiagnosticModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isChunkTesting, setIsChunkTesting] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticData | null>(null);
  const [chunkResult, setChunkResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'issues'>('all');

  const runDiagnostics = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch('/api/blob/diagnostic');
      const data: DiagnosticData = await response.json();
      setDiagnosticResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to execute diagnostic test suite');
    } finally {
      setIsRunning(false);
    }
  };

  const runChunkDiagnostic = async () => {
    setIsChunkTesting(true);
    try {
      const res = await fetch('/api/blob/diagnostic/chunks', {
        method: 'POST',
      });
      const data = await res.json();
      setChunkResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to run chunk limit tests');
    } finally {
      setIsChunkTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = diagnosticResult?.logs.filter((log) => {
    if (filterMode === 'issues') {
      return log.status === 'warn' || log.status === 'error';
    }
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div 
        id="blob-diagnostic-modal"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Vercel Blob Live Diagnostic Suite</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Verification Tool
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tests authentication, token permissions, access modes, and uploads a live verification probe.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Top Status Card */}
          {isRunning ? (
            <div className="p-6 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-4 animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-blue-900">Running diagnostic tests...</p>
                <p className="text-xs text-blue-700">Verifying credential tokens, checking store configuration, and uploading probe file.</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Diagnostic Error</p>
                <p className="text-xs">{error}</p>
                <button
                  onClick={runDiagnostics}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Tests
                </button>
              </div>
            </div>
          ) : diagnosticResult ? (
            <div className={`p-5 rounded-2xl border ${
              diagnosticResult.success 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {diagnosticResult.success ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-base">
                      {diagnosticResult.success ? 'Blob Storage Operational & Ready' : 'Issues Detected with Blob Storage'}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">{diagnosticResult.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200 text-slate-700 shadow-xs font-semibold">
                    {diagnosticResult.durationMs}ms
                  </span>
                  <button
                    onClick={runDiagnostics}
                    disabled={isRunning}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                    Re-Test
                  </button>
                </div>
              </div>

              {/* Status Pills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-200/60">
                <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Token:
                    </span>
                    <span className="font-bold font-mono text-[11px] text-slate-800">
                      {diagnosticResult.storeConfig.tokenMasked || 'Configured'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Access Mode:
                    </span>
                    <span className="font-bold uppercase text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {diagnosticResult.storeConfig.detectedAccessMode || 'Auto'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" /> Files in Store:
                    </span>
                    <span className="font-bold font-mono text-[11px] text-slate-800">
                      {diagnosticResult.testResults.blobsCountInStore} Blobs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Test Probe Upload URL */}
          {diagnosticResult?.testResults?.uploadedUrl && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  Live Probe File Successfully Stored
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  HTTP 200 OK
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 overflow-hidden">
                <span className="font-mono text-xs text-slate-700 truncate select-all">
                  {diagnosticResult.testResults.uploadedUrl}
                </span>
                <a
                  href={diagnosticResult.testResults.uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 flex-shrink-0 transition"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* 413 Chunk Size & Payload Limit Diagnostic Tool */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>HTTP 413 & File Chunk Upload Limit Tester</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tests progressive chunk sizes (100KB, 1MB, 5MB, 15MB) to verify if 413 errors stem from body limits or server configuration.
                </p>
              </div>
              <button
                type="button"
                onClick={runChunkDiagnostic}
                disabled={isChunkTesting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                {isChunkTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>{isChunkTesting ? 'Testing Chunks...' : 'Run Chunk Size Test'}</span>
              </button>
            </div>

            {chunkResult && (
              <div className="space-y-3 pt-1">
                <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  chunkResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  {chunkResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  <span>{chunkResult.summary}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {chunkResult.results?.map((res: any, idx: number) => (
                    <div key={idx} className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-1 ${
                      res.success ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>{res.sizeName}</span>
                        {res.success ? <span className="text-emerald-600">PASS</span> : <span className="text-rose-600">413 / ERR</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {res.durationMs ? `${res.durationMs}ms` : ''}
                      </div>
                    </div>
                  ))}
                </div>

                {chunkResult.serverConfigurationIssue && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <p className="font-bold">⚠️ Server-Side Configuration Issue Detected (HTTP 413)</p>
                    <p>The error originates from the Express server body parser or Nginx reverse proxy size restrictions. Our updated server configuration limits (`250mb`) prevent this.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Console / Step Logs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" />
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Diagnostic Execution Trace ({filteredLogs.length} events)
                </h5>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-200/70 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition cursor-pointer ${
                    filterMode === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All Logs
                </button>
                <button
                  onClick={() => setFilterMode('issues')}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition cursor-pointer ${
                    filterMode === 'issues' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Issues Only
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-300 bg-slate-950 p-4 text-slate-200 font-mono text-xs space-y-2.5 max-h-72 overflow-y-auto shadow-inner">
              {diagnosticResult?.logs && diagnosticResult.logs.length > 0 ? (
                filteredLogs.map((log, idx) => {
                  let statusBadge = (
                    <span className="text-blue-400 font-bold">[INFO]</span>
                  );
                  if (log.status === 'success') {
                    statusBadge = <span className="text-emerald-400 font-bold">[PASS]</span>;
                  } else if (log.status === 'warn') {
                    statusBadge = <span className="text-amber-400 font-bold">[WARN]</span>;
                  } else if (log.status === 'error') {
                    statusBadge = <span className="text-rose-400 font-bold">[FAIL]</span>;
                  }

                  return (
                    <div key={idx} className="border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{log.step}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-start gap-2 mt-0.5">
                        {statusBadge}
                        <span className="text-slate-300 break-all leading-relaxed">{log.detail}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic text-center py-4">No diagnostic events recorded yet. Click Re-Test to run.</div>
              )}
            </div>
          </div>

          {/* Root Cause Analysis & Explanatory Guide */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700 space-y-2 text-xs">
            <p className="font-bold text-blue-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Why did the previous upload requests fail?
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>
                <strong className="text-slate-800">Private Store Mode Mismatch:</strong> Your Vercel Blob store (`store_TBYrDippPnZTX3hi`) is set to <code>private</code> access in Vercel. Earlier requests attempted <code>public</code> access uploads, which Vercel Blob rejected with <em>"Cannot use public access on a private store"</em>.
              </li>
              <li>
                <strong className="text-slate-800">Auto-Fallback Implemented:</strong> The backend has now been updated to automatically detect and fallback to private mode for this store, ensuring binary files and manifest data persist without error.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Cloud className="w-4 h-4 text-blue-600" />
            <span>Target Vercel Store: <code className="font-mono font-bold text-slate-700">store_TBYrDippPnZTX3hi</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
