"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export const NavigationProgress = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset when navigation completes (URL changed)
    setIsNavigating(false);
    setProgress(0);
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isNavigating) {
      // Animate progress bar - fast at first, then slower
      setProgress(20);
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          // Slow down as we approach 90%
          const increment = Math.max(1, (90 - prev) / 10);
          return Math.min(90, prev + increment);
        });
      }, 100);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isNavigating]);

  useEffect(() => {
    // Intercept all link clicks to show loading immediately
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, hash links, and non-navigation links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank"
      ) {
        return;
      }

      // Skip if modifier keys are pressed (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      // Check if we're navigating to a different page
      const currentPath = window.location.pathname + window.location.search;
      const newPath = new URL(href, window.location.origin).pathname;

      if (currentPath !== newPath) {
        setIsNavigating(true);
        setProgress(0);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-0.5">
      <div
        className="h-full bg-secondary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
