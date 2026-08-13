import { useEffect, useState } from 'react';

const QUERY = '(hover: hover) and (pointer: fine)';

// Touchscreens don't have a real hover state — detail cards should open on
// hover for mouse/trackpad users, and on tap for touch users.
export function useIsHoverCapable(): boolean {
  const [hoverCapable, setHoverCapable] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setHoverCapable(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return hoverCapable;
}
