import { readdir } from "fs/promises";

import { NextResponse } from "next/server";

import { ensureRadioChatterMediaRoot, RADIO_CHATTER_MEDIA_ROOT } from "@/lib/media";

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

export const runtime = "nodejs";

export async function GET() {
  await ensureRadioChatterMediaRoot();

  const entries = await readdir(RADIO_CHATTER_MEDIA_ROOT, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
    .map((entry) => entry.name)
    .sort((a, b) => collator.compare(a, b));

  const phraseFiles = files.filter((name) => name.toLowerCase().startsWith("phrase_"));
  const hissFiles = files.filter((name) => name.toLowerCase().includes("hiss"));

  return NextResponse.json({
    phraseFiles,
    hissFiles,
  });
}
