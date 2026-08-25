'use client';

import React, { useState, useEffect } from 'react';

interface StreamerAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  isLive?: boolean;
  className?: string;
}

const MONOGRAM_COLORS = [
  'bg-[#ffbe5b] text-[#18181b]', // Yellow / Gold
  'bg-[#2ee59d] text-[#18181b]', // Mint Green
  'bg-[#5bc0ff] text-[#18181b]', // Sky Blue
  'bg-[#c499ff] text-[#18181b]', // Purple
  'bg-[#ff5b5b] text-white',     // Coral Red
  'bg-[#ffa82e] text-[#18181b]', // Orange
];

function getMonogramColor(name?: string | null) {
  if (!name || typeof name !== 'string') return MONOGRAM_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MONOGRAM_COLORS.length;
  return MONOGRAM_COLORS[index];
}

function getInitials(name?: string | null) {
  if (!name || typeof name !== 'string') return 'YT';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return ((parts[0][0] || '') + (parts[1][0] || '')).toUpperCase() || 'YT';
  }
  return (name.slice(0, 2) || 'YT').toUpperCase();
}

export function StreamerAvatar({
  name,
  avatarUrl,
  size = 'md',
  isLive = false,
  className = '',
}: StreamerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error when avatarUrl changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  const displayName = name || 'Streamer';
  const initials = getInitials(displayName);
  const colorClass = getMonogramColor(displayName);

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden border-[2px] border-[var(--border-color)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] flex items-center justify-center font-black select-none ${sizeClasses[size]} ${colorClass} ${className}`}
    >
      {/* Background Initials (Always ready in case image fails or is loading) */}
      <span className="leading-none tracking-tight font-black select-none">
        {initials}
      </span>

      {/* Image overlay (Rendered directly, fallback to background if error) */}
      {avatarUrl && !imgError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={displayName}
          referrerPolicy="no-referrer"
          loading="eager"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Live Pulsing Ring */}
      {isLive && (
        <div className="absolute inset-0 rounded-full border-2 border-[var(--accent-red)] animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
