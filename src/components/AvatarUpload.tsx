import React, { useState, useRef } from 'react';
import type { PutBlobResult } from '@vercel/blob';

export const AvatarUpload: React.FC = () => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-900">
      <h2 className="text-xl font-bold mb-4">Upload Your Avatar</h2>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);

          if (!inputFileRef.current?.files || inputFileRef.current.files.length === 0) {
            setError("No file selected");
            return;
          }

          const file = inputFileRef.current.files[0];
          setLoading(true);

          try {
            const response = await fetch(
              `/api/avatar/upload?filename=${encodeURIComponent(file.name)}`,
              {
                method: 'POST',
                body: file,
              },
            );

            if (!response.ok) {
              throw new Error(`Upload failed (${response.status})`);
            }

            const newBlob = (await response.json()) as PutBlobResult;
            setBlob(newBlob);
          } catch (err: any) {
            setError(err.message || 'Error uploading file');
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-4"
      >
        <div className="flex flex-col gap-2">
          <input
            name="file"
            ref={inputFileRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            required
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Uploading...' : 'Upload Avatar'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {blob && (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Avatar URL</span>
          <a
            href={blob.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-blue-600 hover:underline break-all"
          >
            {blob.url}
          </a>
          {blob.url && (
            <img
              src={blob.url}
              alt="Uploaded Avatar"
              className="w-24 h-24 object-cover rounded-full border border-slate-300 mt-2"
            />
          )}
        </div>
      )}
    </div>
  );
};
