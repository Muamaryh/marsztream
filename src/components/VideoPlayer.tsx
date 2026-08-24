'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward, 
  Settings, 
  RotateCcw,
  FastForward,
  Loader2,
  Check,
  List,
  Subtitles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { UnifiedEpisode, UnifiedDrama, DramaProvider } from '@/types/drama';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';

interface VideoPlayerProps {
  streamUrl: string | null;
  isHls?: boolean;
  drama: UnifiedDrama;
  currentEpisodeNumber: number;
  totalEpisodes?: number;
  qualities?: { label: string; url: string; quality: number }[];
  subtitles?: { language: string; label: string; url: string }[];
  onEpisodeChange?: (episodeNumber: number) => void;
  onOpenEpisodeDrawer?: () => void;
  autoNext?: boolean;
}

export function VideoPlayer({
  streamUrl,
  isHls = false,
  drama,
  currentEpisodeNumber,
  totalEpisodes = 1,
  qualities = [],
  subtitles = [],
  onEpisodeChange,
  onOpenEpisodeDrawer,
  autoNext: initialAutoNext = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoNext, setAutoNext] = useState(initialAutoNext);
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('none');
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(streamUrl);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { saveHistory } = useLocalLibrary();

  // Sync activeUrl when streamUrl prop changes
  useEffect(() => {
    setActiveUrl(streamUrl);
  }, [streamUrl]);

  // HLS and Video Source Initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeUrl) return;

    setIsBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const checkIsHls = isHls || activeUrl.includes('.m3u8') || activeUrl.includes('/hls');

    if (checkIsHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(activeUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else {
      video.src = activeUrl;
      video.load();
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeUrl, isHls]);

  // Handle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  // Handle Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Skip Forward/Backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
      );
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle Playback Rate
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
    setShowSettingsMenu(false);
  };

  // Handle Quality Change
  const changeQuality = (qualityUrl: string, label: string) => {
    const currentPos = videoRef.current?.currentTime || 0;
    setSelectedQuality(label);
    setActiveUrl(qualityUrl);
    setShowQualityMenu(false);
    setShowSettingsMenu(false);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentPos;
      }
    }, 150);
  };

  // Handle Fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Fullscreen request failed:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Next / Prev Episode Navigation
  const handleNextEpisode = useCallback(() => {
    if (currentEpisodeNumber < totalEpisodes && onEpisodeChange) {
      onEpisodeChange(currentEpisodeNumber + 1);
    }
  }, [currentEpisodeNumber, totalEpisodes, onEpisodeChange]);

  const handlePrevEpisode = useCallback(() => {
    if (currentEpisodeNumber > 1 && onEpisodeChange) {
      onEpisodeChange(currentEpisodeNumber - 1);
    }
  }, [currentEpisodeNumber, onEpisodeChange]);

  // Video Event Handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(cur);
      setDuration(dur);

      // Save history every 5 seconds
      if (Math.floor(cur) % 5 === 0 && dur > 0) {
        saveHistory(drama, currentEpisodeNumber, currentEpisodeNumber, cur, dur);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (autoNext && currentEpisodeNumber < totalEpisodes) {
      handleNextEpisode();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          skip(-5);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          skip(5);
          break;
        case 'arrowup':
          e.preventDefault();
          if (videoRef.current) {
            const v = Math.min(1, videoRef.current.volume + 0.1);
            videoRef.current.volume = v;
            setVolume(v);
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (videoRef.current) {
            const v = Math.max(0, videoRef.current.volume - 0.1);
            videoRef.current.volume = v;
            setVolume(v);
          }
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'n':
          e.preventDefault();
          handleNextEpisode();
          break;
        case 'p':
          e.preventDefault();
          handlePrevEpisode();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextEpisode, handlePrevEpisode]);

  // Controls Auto-Hide
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettingsMenu(false);
      }, 3500);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      className={`relative w-full aspect-[9/16] sm:aspect-video max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 group select-none ${
        isFullscreen ? 'h-screen w-screen max-h-screen rounded-none' : ''
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration || 0);
        }}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      >
        {subtitles.map((sub, idx) => (
          <track
            key={idx}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.language}
            label={sub.label}
            default={idx === 0 || sub.language === 'in'}
          />
        ))}
      </video>

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-20">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        </div>
      )}

      {/* Big Play / Pause Overlay Icon Animation */}
      {!isPlaying && !isBuffering && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transform hover:scale-110 active:scale-95 transition-all">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Top Bar Controls (Title & Episode Info) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-30 flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
            {drama.provider} • Episode {currentEpisodeNumber} / {totalEpisodes}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
            {drama.title}
          </h2>
        </div>

        {onOpenEpisodeDrawer && (
          <button
            onClick={onOpenEpisodeDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-md transition-colors"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Semua Episode</span>
          </button>
        )}
      </div>

      {/* Settings Popup Menu */}
      {showSettingsMenu && (
        <div className="absolute bottom-16 right-4 w-52 bg-zinc-900/95 border border-zinc-700/80 rounded-xl p-2 shadow-2xl backdrop-blur-lg z-40 text-xs text-zinc-200 divide-y divide-zinc-800">
          {/* Speed submenu trigger */}
          <button
            onClick={() => {
              setShowSpeedMenu(!showSpeedMenu);
              setShowQualityMenu(false);
            }}
            className="w-full py-2 px-3 flex items-center justify-between hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <span>Kecepatan</span>
            <span className="text-zinc-400 font-bold">{playbackRate}x</span>
          </button>

          {/* Quality submenu trigger */}
          {qualities.length > 0 && (
            <button
              onClick={() => {
                setShowQualityMenu(!showQualityMenu);
                setShowSpeedMenu(false);
              }}
              className="w-full py-2 px-3 flex items-center justify-between hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <span>Kualitas</span>
              <span className="text-zinc-400 font-bold">{selectedQuality}</span>
            </button>
          )}

          {/* Auto Next Episode Toggle */}
          <div className="w-full py-2 px-3 flex items-center justify-between">
            <span>Auto Next Episode</span>
            <button
              onClick={() => setAutoNext(!autoNext)}
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${
                autoNext ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  autoNext ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Speed Selector Menu */}
      {showSpeedMenu && (
        <div className="absolute bottom-16 right-4 w-40 bg-zinc-900/95 border border-zinc-700/80 rounded-xl p-1 shadow-2xl backdrop-blur-lg z-40 text-xs text-zinc-200">
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className="w-full py-2 px-3 flex items-center justify-between hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
              {playbackRate === rate && <Check className="w-3.5 h-3.5 text-red-500" />}
            </button>
          ))}
        </div>
      )}

      {/* Quality Selector Menu */}
      {showQualityMenu && qualities.length > 0 && (
        <div className="absolute bottom-16 right-4 w-44 bg-zinc-900/95 border border-zinc-700/80 rounded-xl p-1 shadow-2xl backdrop-blur-lg z-40 text-xs text-zinc-200">
          {qualities.map((q) => (
            <button
              key={q.label}
              onClick={() => changeQuality(q.url, q.label)}
              className="w-full py-2 px-3 flex items-center justify-between hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <span>{q.label}</span>
              {selectedQuality === q.label && <Check className="w-3.5 h-3.5 text-red-500" />}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-30 flex flex-col gap-2 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar & Scrubber */}
        <div className="relative w-full flex items-center group/progress">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 sm:h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2 transition-all"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Play/Pause, Prev/Next, Volume, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrevEpisode}
              disabled={currentEpisodeNumber <= 1}
              className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300 transition-colors"
              title="Episode Sebelumnya (P)"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-1.5 text-white hover:text-red-400 transition-colors"
              title={isPlaying ? 'Jeda (Spasi)' : 'Putar (Spasi)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              )}
            </button>

            <button
              onClick={handleNextEpisode}
              disabled={currentEpisodeNumber >= totalEpisodes}
              className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300 transition-colors"
              title="Episode Berikutnya (N)"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Volume Control (Desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1.5 text-zinc-300 hover:text-white">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600 opacity-0 group-hover/vol:opacity-100 transition-opacity"
              />
            </div>

            {/* Time Timestamp */}
            <div className="text-[11px] sm:text-xs text-zinc-300 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-500"> / </span>
              <span className="text-zinc-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Settings, Speed, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                setShowSettingsMenu(!showSettingsMenu);
                setShowSpeedMenu(false);
                setShowQualityMenu(false);
              }}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title="Pengaturan"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Keluar Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
