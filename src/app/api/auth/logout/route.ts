import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  const response = NextResponse.json({ ok: true });
  response.headers.append("Set-Cookie", clearSessionCookie());
  return response;
}
