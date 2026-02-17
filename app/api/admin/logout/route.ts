import { NextResponse } from "next/server";

import { clearSessionCookie, validateAdminRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = validateAdminRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const cookie = clearSessionCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
