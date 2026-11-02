"use client";

import { useState } from "react";
import { Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminButton } from "./AdminButton";

type Status = "idle" | "loading" | "success" | "error";

export function ClearCacheButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [clearedAt, setClearedAt] = useState<string | null>(null);

  const handleClear = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/cache/revalidate", { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Unknown error");
      setClearedAt(new Date().toLocaleTimeString());
      setStatus("success");
      // Reset to idle after 4 seconds
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <AdminButton
        variant="secondary"
        icon={<Trash2 />}
        loading={status === "loading"}
        loadingText="Clearing…"
        onClick={handleClear}
        disabled={status === "loading"}
        className="border-dashed"
      >
        Clear Cache
      </AdminButton>

      {status === "success" && (
        <span className="flex items-center gap-1.5 text-[12px] font-body text-emerald-600 font-medium">
          <CheckCircle2 size={13} />
          Cleared{clearedAt ? ` at ${clearedAt}` : ""}
        </span>
      )}
      {status === "error" && (
        <span className="flex items-center gap-1.5 text-[12px] font-body text-red-500 font-medium">
          <AlertCircle size={13} />
          Failed — try again
        </span>
      )}
    </div>
  );
}
