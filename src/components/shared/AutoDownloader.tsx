"use client";

import { useEffect, useRef } from "react";

interface Props {
  bookIds: string[];
}

export function AutoDownloader({ bookIds }: Props) {
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current || bookIds.length === 0) return;
    triggered.current = true;

    // Stagger each download 800ms apart so the browser doesn't block them
    bookIds.forEach((id, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = `/api/downloads/secure?bookId=${id}`;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 800);
    });
  }, [bookIds]);

  return null;
}
