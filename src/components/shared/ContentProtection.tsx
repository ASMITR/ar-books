"use client";

import { useEffect } from "react";

export function ContentProtection() {
  useEffect(() => {
    // Disable right-click
    const noContext = (e: MouseEvent) => e.preventDefault();

    // Disable text selection via mouse
    const noSelect = (e: Event) => e.preventDefault();

    // Disable drag on images/links
    const noDrag = (e: DragEvent) => e.preventDefault();

    // Block long-press save/download on mobile (iOS & Android Chrome)
    // Only prevent default after a genuine long-press (500ms), not on quick taps
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    const noLongPress = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "A" || target.closest("a")) {
        longPressTimer = setTimeout(() => { e.preventDefault(); }, 500);
      }
    };
    const cancelLongPress = () => {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    };

    // Block keyboard shortcuts
    const noKeys = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        e.key === "F12" ||
        (ctrl && e.shiftKey && ["I", "J", "C", "S"].includes(e.key.toUpperCase())) ||
        (ctrl && ["U", "S", "A", "C", "X", "P"].includes(e.key.toUpperCase())) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Block print
    const noPrint = () => { window.stop(); };
    window.addEventListener("beforeprint", noPrint);

    // Remove download attribute from all anchor tags
    const stripDownload = () => {
      document.querySelectorAll("a[download]").forEach((el) => el.removeAttribute("download"));
    };
    stripDownload();
    const observer = new MutationObserver(stripDownload);
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("contextmenu", noContext);
    document.addEventListener("selectstart", noSelect);
    document.addEventListener("dragstart", noDrag);
    document.addEventListener("keydown", noKeys);
    document.addEventListener("touchstart", noLongPress, { passive: true });
    document.addEventListener("touchend", cancelLongPress, { passive: true });
    document.addEventListener("touchmove", cancelLongPress, { passive: true });

    return () => {
      window.removeEventListener("beforeprint", noPrint);
      document.removeEventListener("contextmenu", noContext);
      document.removeEventListener("selectstart", noSelect);
      document.removeEventListener("dragstart", noDrag);
      document.removeEventListener("keydown", noKeys);
      document.removeEventListener("touchstart", noLongPress);
      document.removeEventListener("touchend", cancelLongPress);
      document.removeEventListener("touchmove", cancelLongPress);
      observer.disconnect();
    };
  }, []);

  return null;
}
