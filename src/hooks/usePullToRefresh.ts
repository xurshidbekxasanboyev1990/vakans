import { useState, useCallback, useEffect } from 'react';

interface PullToRefreshOptions {
  threshold?: number;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

/**
 * Pull to Refresh Hook
 * Mobile uchun pastga tortib yangilash
 */
export function usePullToRefresh({
  threshold = 80,
  onRefresh,
  disabled = false,
}: PullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;
      
      // Only trigger if at top of page
      if (window.scrollY === 0) {
        setTouchStart(e.touches[0].clientY);
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing || touchStart === 0) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStart;

      // Only pull down
      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
        
        // Prevent default scroll if pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    },
    [disabled, isRefreshing, touchStart, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setTouchStart(0);
      }
    } else {
      setPullDistance(0);
      setTouchStart(0);
    }
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldRefresh = pullDistance >= threshold;

  return {
    isRefreshing,
    pullDistance,
    progress,
    shouldRefresh,
  };
}

/**
 * Usage:
 * 
 * const { isRefreshing, pullDistance, progress } = usePullToRefresh({
 *   threshold: 80,
 *   onRefresh: async () => {
 *     await fetchData();
 *   },
 * });
 * 
 * return (
 *   <div>
 *     {pullDistance > 0 && (
 *       <div style={{ height: pullDistance }}>
 *         <Spinner />
 *         {progress}%
 *       </div>
 *     )}
 *     <YourContent />
 *   </div>
 * );
 */
