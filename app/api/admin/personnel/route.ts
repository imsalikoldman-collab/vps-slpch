import { NextResponse } from "next/server";

import { createPersonnelCard, listPersonnelCards } from "@/lib/personnel-data";
import { parsePersonnelCardInput } from "@/lib/personnel-validators";
import { validateAdminRequest } from "@/lib/auth";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET(request: Request) {
  const session = validateAdminRequest(request);
  if (!session) {
    return unauthorized();
  }

  const cards = await listPersonnelCards();
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const session = validateAdminRequest(request);
  if (!session) {
    return unauthorized();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = parsePersonnelCardInput(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const card = await createPersonnelCard(parsed.data);
  return NextResponse.json({ card }, { status: 201 });
}
