/**
 * Utility to toggle Fullscreen and automatically lock screen orientation
 * to Landscape (horizontal), matching the YouTube mobile app experience.
 */

export async function toggleLandscapeFullscreen(element: HTMLElement | null): Promise<boolean> {
  if (!element || typeof window === 'undefined') return false;

  const isCurrentlyFullscreen = Boolean(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );

  if (!isCurrentlyFullscreen) {
    try {
      // 1. Request Fullscreen with cross-browser prefixes
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }

      // 2. Lock orientation to horizontal landscape (like YouTube mobile app)
      if (window.screen?.orientation && typeof (window.screen.orientation as any).lock === 'function') {
        try {
          await (window.screen.orientation as any).lock('landscape');
        } catch (orientationErr) {
          // Some desktop browsers or non-supported devices may reject orientation lock, which is harmless
          console.debug('Orientation lock notice:', orientationErr);
        }
      } else if (typeof (window.screen as any)?.lockOrientation === 'function') {
        try {
          (window.screen as any).lockOrientation('landscape');
        } catch (e) {}
      } else if (typeof (window.screen as any)?.mozLockOrientation === 'function') {
        try {
          (window.screen as any).mozLockOrientation('landscape');
        } catch (e) {}
      } else if (typeof (window.screen as any)?.msLockOrientation === 'function') {
        try {
          (window.screen as any).msLockOrientation('landscape');
        } catch (e) {}
      }

      return true;
    } catch (err) {
      console.error('Failed to enter fullscreen landscape:', err);
      return false;
    }
  } else {
    try {
      // 1. Exit Fullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }

      // 2. Unlock orientation back to normal portrait/auto
      unlockScreenOrientation();
      return false;
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
      return false;
    }
  }
}

export function unlockScreenOrientation() {
  if (typeof window === 'undefined') return;

  if (window.screen?.orientation && typeof (window.screen.orientation as any).unlock === 'function') {
    try {
      (window.screen.orientation as any).unlock();
    } catch (e) {}
  } else if (typeof (window.screen as any)?.unlockOrientation === 'function') {
    try {
      (window.screen as any).unlockOrientation();
    } catch (e) {}
  } else if (typeof (window.screen as any)?.mozUnlockOrientation === 'function') {
    try {
      (window.screen as any).mozUnlockOrientation();
    } catch (e) {}
  } else if (typeof (window.screen as any)?.msUnlockOrientation === 'function') {
    try {
      (window.screen as any).msUnlockOrientation();
    } catch (e) {}
  }
}
