import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { validateAdminRequest } from "@/lib/auth";
import { ensurePsiMediaRoot } from "@/lib/media";

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = validateAdminRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  if (!MIME_TO_EXT[file.type]) {
    return NextResponse.json({ error: "Unsupported file type. Use JPEG/PNG/WEBP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large. Max 5MB." }, { status: 400 });
  }

  const root = await ensurePsiMediaRoot();
  const extension = MIME_TO_EXT[file.type];
  const fileName = `${randomUUID()}${extension}`;
  const targetPath = path.join(root, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, buffer);

  return NextResponse.json({
    ok: true,
    photoPath: `psi/${fileName}`,
    url: `/api/media/psi/${encodeURIComponent(fileName)}`,
  });
}
