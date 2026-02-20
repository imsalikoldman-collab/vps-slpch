import { mkdir } from "fs/promises";
import path from "path";

export const PSI_MEDIA_ROOT = path.join(process.cwd(), "storage", "media", "psi");
export const RADIO_CHATTER_MEDIA_ROOT = path.join(
  process.cwd(),
  "storage",
  "media",
  "phrases_timestamps_split_radiofx",
);

export async function ensurePsiMediaRoot(): Promise<string> {
  await mkdir(PSI_MEDIA_ROOT, { recursive: true });
  return PSI_MEDIA_ROOT;
}

export async function ensureRadioChatterMediaRoot(): Promise<string> {
  await mkdir(RADIO_CHATTER_MEDIA_ROOT, { recursive: true });
  return RADIO_CHATTER_MEDIA_ROOT;
}

export function resolvePsiMediaFile(fileName: string): string {
  return path.join(PSI_MEDIA_ROOT, fileName);
}

export function resolveRadioChatterMediaFile(fileName: string): string {
  return path.join(RADIO_CHATTER_MEDIA_ROOT, fileName);
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
