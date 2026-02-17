import { NextResponse } from "next/server";

import { validateAdminRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = validateAdminRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    session,
  });
}
