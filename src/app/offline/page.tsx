import type { Metadata } from "next";
import { OfflineClient } from "./OfflineClient";

export const metadata: Metadata = {
  title: "You're Offline",
  robots: { index: false },
};

export default function OfflinePage() {
  return <OfflineClient />;
}
