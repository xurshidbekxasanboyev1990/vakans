import { useState, useEffect, useCallback } from 'react';

interface HapticOptions {
  duration?: number;
  pattern?: number[];
}

/**
 * Haptic Feedback Hook
 * Mobile qurilmalarda vibrasiya orqali feedback
 */
export function useHaptic() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if vibration API is supported
    setIsSupported('vibrate' in navigator);
  }, []);

  const vibrate = useCallback(
    (options: HapticOptions = {}) => {
      if (!isSupported) return;

      const { duration = 10, pattern } = options;

      try {
        if (pattern) {
          navigator.vibrate(pattern);
        } else {
          navigator.vibrate(duration);
        }
      } catch (error) {
        console.error('Haptic feedback error:', error);
      }
    },
    [isSupported]
  );

  // Predefined haptic patterns
  const light = useCallback(() => vibrate({ duration: 10 }), [vibrate]);
  const medium = useCallback(() => vibrate({ duration: 20 }), [vibrate]);
  const heavy = useCallback(() => vibrate({ duration: 40 }), [vibrate]);
  const success = useCallback(() => vibrate({ pattern: [10, 50, 10] }), [vibrate]);
  const warning = useCallback(() => vibrate({ pattern: [20, 100, 20, 100, 20] }), [vibrate]);
  const error = useCallback(() => vibrate({ pattern: [50, 100, 50] }), [vibrate]);
  const tap = useCallback(() => vibrate({ duration: 5 }), [vibrate]);
  const longPress = useCallback(() => vibrate({ duration: 50 }), [vibrate]);

  return {
    isSupported,
    vibrate,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    tap,
    longPress,
  };
}

/**
 * Usage:
 * 
 * const haptic = useHaptic();
 * 
 * // Light tap on button click
 * <Button onClick={() => {
 *   haptic.light();
 *   // ... your logic
 * }}>
 * 
 * // Success vibration on form submit
 * haptic.success();
 * 
 * // Custom pattern
 * haptic.vibrate({ pattern: [100, 200, 100] });
 */
