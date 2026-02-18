import { createEmptyRichDoc, type RichDoc } from "@/types/psi";
import type { CaseCardInput } from "@/types/cases";

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isRichDoc(value: unknown): value is RichDoc {
  if (!isObject(value)) {
    return false;
  }
  return value.type === "doc" && Array.isArray(value.content);
}

export function parseCaseCardInput(payload: unknown): { ok: true; data: CaseCardInput } | { ok: false; error: string } {
  if (!isObject(payload)) {
    return { ok: false, error: "Payload must be an object." };
  }

  const displayOrder = Number(payload.displayOrder ?? 0);
  const title = String(payload.title ?? "").trim();
  const meta = String(payload.meta ?? "").trim();

  if (Number.isNaN(displayOrder)) {
    return { ok: false, error: "Field `displayOrder` must be numeric." };
  }
  if (!title) {
    return { ok: false, error: "Field `title` is required." };
  }
  if (!meta) {
    return { ok: false, error: "Field `meta` is required." };
  }

  const introDoc = isRichDoc(payload.introDoc) ? payload.introDoc : createEmptyRichDoc();
  const conclusionDoc = isRichDoc(payload.conclusionDoc) ? payload.conclusionDoc : createEmptyRichDoc();

  const bulletsRaw = Array.isArray(payload.bullets) ? payload.bullets : [];
  const bullets = bulletsRaw.map((bullet, index) => {
    if (!isObject(bullet)) {
      return {
        displayOrder: (index + 1) * 10,
        contentDoc: createEmptyRichDoc(),
      };
    }

    const bulletOrder = Number(bullet.displayOrder ?? (index + 1) * 10);
    const contentDoc = isRichDoc(bullet.contentDoc) ? bullet.contentDoc : createEmptyRichDoc();
    return {
      displayOrder: Number.isNaN(bulletOrder) ? (index + 1) * 10 : bulletOrder,
      contentDoc,
    };
  });

  return {
    ok: true,
    data: {
      displayOrder,
      title,
      meta,
      introDoc,
      conclusionDoc,
      bullets,
    },
  };
}
