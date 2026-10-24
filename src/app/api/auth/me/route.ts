import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/auth-server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ role: null }, { status: 401 });
  return NextResponse.json({ role: user.role, uid: user.uid });
}
