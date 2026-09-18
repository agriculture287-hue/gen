import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { upload } from '@vercel/blob/client';
import { 
  UploadCloud, 
  File, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface InstallerUploadProps {
  onUploadComplete?: (blobUrl: string, fileName: string) => void;
}

export const InstallerUpload: React.FC<InstallerUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB
  const ALLOWED_EXTENSIONS = ['.apk', '.dmg', '.exe'];

  const validateFile = (selectedFile: File): string | null => {
    const fileNameLower = selectedFile.name.toLowerCase();
    const isValidExt = ALLOWED_EXTENSIONS.some(ext => fileNameLower.endsWith(ext));
    
    if (!isValidExt) {
      return `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} installer files are accepted.`;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
      return `File too large (${sizeMB}MB). Maximum allowed size is 300MB.`;
    }

    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage(null);
    setUploadedUrl(null);
    
    const error = validateFile(selectedFile);
    if (error) {
      setErrorMessage(error);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: true,
        onUploadProgress: (progressEvent) => {
          setUploadProgress(progressEvent.percentage);
        },
      });

      setUploadedUrl(blob.url);
      if (onUploadComplete) {
        onUploadComplete(blob.url, file.name);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload file to Vercel Blob storage. Please check your network connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!uploadedUrl) return;
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setUploadedUrl(null);
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
          <HardDrive className="w-5 h-5 text-blue-600" />
          <span>App Installer Uploader</span>
        </h3>
        <p className="text-xs text-slate-500">
          Upload application installers (.apk, .dmg, .exe) directly to Vercel Blob storage using multipart upload. Max size: 300MB.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      {!file && !uploadedUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/60' 
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">
              Drag & drop your installer here, or <span className="text-blue-600 hover:underline">browse files</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Supported formats: .apk, .dmg, .exe (Up to 300MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk,.dmg,.exe"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Selected File Preview & Progress */}
      {file && !uploadedUrl && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{formatFileSize(file.size)}</p>
              </div>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                Change
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Uploading multipart chunk...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {!isUploading && (
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload to Vercel Blob</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success Result & Copyable Link */}
      {uploadedUrl && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Installer uploaded successfully to Vercel Blob!</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Public Download Link
            </label>
            <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl p-2 font-mono text-[11px] text-slate-700 overflow-hidden">
              <span className="truncate flex-1">{uploadedUrl}</span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition flex-shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition flex-shrink-0"
                title="Open download link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload Another File</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Upload Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
