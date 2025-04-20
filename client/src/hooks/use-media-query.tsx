import { useState, useEffect } from "react";

/**
 * Custom hook for responsive design that detects if a media query matches
 * @param query The media query to check, e.g. '(max-width: 768px)'
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
      return () => {
        mediaQueryList.removeEventListener("change", listener);
      };
    } else if ("addListener" in mediaQueryList) {
      // @ts-ignore - For older browsers that use deprecated API
      mediaQueryList.addListener(listener);
      return () => {
        // @ts-ignore - For older browsers that use deprecated API
        mediaQueryList.removeListener(listener);
      };
    }
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery("(max-width: 639px)");
export const useIsTablet = () =>
  useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
export const useIsLargeDesktop = () => useMediaQuery("(min-width: 1280px)");

export const useIsLandscape = () => useMediaQuery("(orientation: landscape)");
export const useIsPortrait = () => useMediaQuery("(orientation: portrait)");

export const usePrefersDarkMode = () =>
  useMediaQuery("(prefers-color-scheme: dark)");
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

export default useMediaQuery;
