"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewBookPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/books"); }, [router]);
  return null;
}
