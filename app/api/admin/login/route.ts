import { NextResponse } from "next/server";

import { createSessionCookie, getAdminCredentials } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { login, password } = (body as { login?: string; password?: string }) ?? {};
  if (!login || !password) {
    return NextResponse.json({ error: "LOGIN and PASSWORD are required." }, { status: 400 });
  }

  const credentials = getAdminCredentials();
  if (login !== credentials.login || password !== credentials.password) {
    return NextResponse.json({ error: "ACCESS DENIED" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const sessionCookie = createSessionCookie(login);
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
  return response;
}
