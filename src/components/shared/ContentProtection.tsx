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

    // Block keyboard shortcuts
    const noKeys = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        e.key === "F12" ||
        (ctrl && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (ctrl && ["U", "S", "A", "C", "X", "P"].includes(e.key.toUpperCase())) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", noContext);
    document.addEventListener("selectstart", noSelect);
    document.addEventListener("dragstart", noDrag);
    document.addEventListener("keydown", noKeys);

    return () => {
      document.removeEventListener("contextmenu", noContext);
      document.removeEventListener("selectstart", noSelect);
      document.removeEventListener("dragstart", noDrag);
      document.removeEventListener("keydown", noKeys);
    };
  }, []);

  return null;
}
