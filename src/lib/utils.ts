import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number | string | undefined): string {
  if (!num) return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return String(num);

  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return n.toLocaleString('id-ID');
}
