'use client';

import { useState } from 'react';
import { X, Plus, UserPlus, Youtube } from 'lucide-react';

interface AddStreamerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (handle: string, name?: string) => void;
}

export function AddStreamerModal({
  isOpen,
  onClose,
  onAdd,
}: AddStreamerModalProps) {
  const [handleInput, setHandleInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleInput.trim()) {
      onAdd(handleInput.trim(), nameInput.trim());
      setHandleInput('');
      setNameInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Tambah Streamer YouTube
              </h3>
              <p className="text-xs text-zinc-400">
                Masukkan handle channel YouTube yang ingin kamu pantau.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Handle / Username YouTube <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 font-mono text-sm">
                @
              </span>
              <input
                type="text"
                required
                placeholder="WindahBasudara atau https://youtube.com/@handle"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                className="w-full h-11 pl-8 pr-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Nama / Panggilan Streamer (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Bang Windah"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full h-11 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
