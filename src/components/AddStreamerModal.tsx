'use client';

import React, { useState } from 'react';
import { X, Plus, UserPlus, Youtube, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { AddStreamerPayload } from '@/context/StreamerContext';

interface AddStreamerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: AddStreamerPayload | string) => void;
}

export function AddStreamerModal({
  isOpen,
  onClose,
  onAdd,
}: AddStreamerModalProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputUrl.trim();
    if (!cleanInput) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Auto-fetch official channel name & avatar from YouTube
      const res = await fetch(`/api/youtube/channel?input=${encodeURIComponent(cleanInput)}`);
      const data = await res.json();

      if (data.success && data.handle) {
        onAdd({
          handle: data.handle,
          name: data.name,
          avatar: data.avatar,
        });
        setInputUrl('');
        onClose();
      } else {
        // Fallback simple add
        onAdd(cleanInput);
        setInputUrl('');
        onClose();
      }
    } catch (err) {
      // If network fails, still add by handle
      onAdd(cleanInput);
      setInputUrl('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border-[2.5px] border-[var(--border-color)] rounded-[20px] p-6 shadow-[6px_6px_0px_var(--shadow-color)] space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--primary)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center -rotate-2">
              <UserPlus className="w-5 h-5 text-[#18181b]" />
            </div>
            <div>
              <h3 className="font-black text-base text-[var(--text-main)]">
                Tambah Streamer
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-semibold">
                Nama & foto profil otomatis diambil dari YouTube
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-[8px] bg-[var(--bg-canvas)] border-[2px] border-[var(--border-color)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--accent-red)] hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-[var(--text-main)] flex items-center gap-1.5">
              <span>Link atau Handle Channel YouTube</span>
              <span className="text-[var(--accent-red)]">*</span>
            </label>
            
            <input
              type="text"
              required
              autoFocus
              disabled={isLoading}
              placeholder="https://www.youtube.com/@Miawaug/live atau @Miawaug"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full h-11 px-4 bg-[var(--bg-canvas)] border-[2px] border-[var(--border-color)] rounded-[10px] text-xs sm:text-sm font-bold text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
            />

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-muted)] pt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-mint)]" />
              <span>Cukup paste link channel / live, nama channel otomatis terdeteksi.</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-[8px] bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t-[2px] border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="neo-btn neo-btn-secondary text-xs py-2 px-4 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="neo-btn neo-btn-primary text-xs py-2 px-5 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#18181b]" />
                  <span>Mengambil Data...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
