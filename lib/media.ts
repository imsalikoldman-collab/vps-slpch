import { mkdir } from "fs/promises";
import path from "path";

export const PSI_MEDIA_ROOT = path.join(process.cwd(), "storage", "media", "psi");

export async function ensurePsiMediaRoot(): Promise<string> {
  await mkdir(PSI_MEDIA_ROOT, { recursive: true });
  return PSI_MEDIA_ROOT;
}

export function resolvePsiMediaFile(fileName: string): string {
  return path.join(PSI_MEDIA_ROOT, fileName);
}

export function sanitizeMediaFileName(fileName: string): string | null {
  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    return null;
  }
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return null;
  }
  return fileName;
}
