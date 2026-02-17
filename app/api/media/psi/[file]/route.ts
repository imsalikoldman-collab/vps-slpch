import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { resolvePsiMediaFile, sanitizeMediaFileName } from "@/lib/media";

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const safeName = sanitizeMediaFileName(file);
  if (!safeName) {
    return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
  }

  const fullPath = resolvePsiMediaFile(safeName);
  try {
    const content = await readFile(fullPath);
    const extension = path.extname(safeName).toLowerCase();
    const type = EXT_TO_MIME[extension] ?? "application/octet-stream";
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
