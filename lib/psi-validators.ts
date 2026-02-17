import { createEmptyRichDoc, type PsiCardInput, type RichDoc } from "@/types/psi";
import { normalizePsiName } from "@/lib/psi-name";

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isRichDoc(value: unknown): value is RichDoc {
  if (!isObject(value)) {
    return false;
  }
  return value.type === "doc" && Array.isArray(value.content);
}

export function parsePsiCardInput(payload: unknown): { ok: true; data: PsiCardInput } | { ok: false; error: string } {
  if (!isObject(payload)) {
    return { ok: false, error: "Payload must be an object." };
  }

  const displayOrder = Number(payload.displayOrder ?? 0);
  const name = normalizePsiName(String(payload.name ?? ""));
  const nameHref = payload.nameHref === null || payload.nameHref === undefined ? null : String(payload.nameHref).trim();
  const ageValue = payload.age;
  const age = ageValue === null || ageValue === undefined || ageValue === "" ? null : Number(ageValue);
  const citizenship = String(payload.citizenship ?? "").trim();
  const status = String(payload.status ?? "").trim();
  const photoPath = payload.photoPath === null || payload.photoPath === undefined ? null : String(payload.photoPath).trim();
  const photoAlt = payload.photoAlt === null || payload.photoAlt === undefined ? null : String(payload.photoAlt).trim();

  if (!name) {
    return { ok: false, error: "Field `name` is required." };
  }
  if (!citizenship) {
    return { ok: false, error: "Field `citizenship` is required." };
  }
  if (!status) {
    return { ok: false, error: "Field `status` is required." };
  }
  if (Number.isNaN(displayOrder)) {
    return { ok: false, error: "Field `displayOrder` must be numeric." };
  }
  if (age !== null && Number.isNaN(age)) {
    return { ok: false, error: "Field `age` must be numeric." };
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
      name,
      nameHref,
      age,
      citizenship,
      status,
      photoPath,
      photoAlt,
      introDoc,
      conclusionDoc,
      bullets,
    },
  };
}
