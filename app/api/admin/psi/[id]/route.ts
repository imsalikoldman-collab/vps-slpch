import { NextResponse } from "next/server";

import { deletePsiCard, updatePsiCard } from "@/lib/psi-data";
import { parsePsiCardInput } from "@/lib/psi-validators";
import { validateAdminRequest } from "@/lib/auth";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

function parseId(idValue: string): number | null {
  const parsed = Number(idValue);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = validateAdminRequest(request);
  if (!session) {
    return unauthorized();
  }

  const { id: idRaw } = await params;
  const id = parseId(idRaw);
  if (!id) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = parsePsiCardInput(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const card = await updatePsiCard(id, parsed.data);
  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  return NextResponse.json({ card });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = validateAdminRequest(request);
  if (!session) {
    return unauthorized();
  }

  const { id: idRaw } = await params;
  const id = parseId(idRaw);
  if (!id) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const ok = await deletePsiCard(id);
  if (!ok) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
