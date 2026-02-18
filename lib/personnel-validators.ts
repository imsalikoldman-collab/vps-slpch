import type { PersonnelCardInput } from "@/types/personnel";

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function parsePersonnelCardInput(payload: unknown): { ok: true; data: PersonnelCardInput } | { ok: false; error: string } {
  if (!isObject(payload)) {
    return { ok: false, error: "Payload must be an object." };
  }

  const displayOrder = Number(payload.displayOrder ?? 0);
  const registryId = String(payload.registryId ?? "").trim();
  const fullName = String(payload.fullName ?? "").trim();
  const role = String(payload.role ?? "").trim();
  const status = String(payload.status ?? "").trim();

  if (Number.isNaN(displayOrder)) {
    return { ok: false, error: "Field `displayOrder` must be numeric." };
  }
  if (!registryId) {
    return { ok: false, error: "Field `registryId` is required." };
  }
  if (!fullName) {
    return { ok: false, error: "Field `fullName` is required." };
  }
  if (!role) {
    return { ok: false, error: "Field `role` is required." };
  }
  if (!status) {
    return { ok: false, error: "Field `status` is required." };
  }

  return {
    ok: true,
    data: {
      displayOrder,
      registryId,
      fullName,
      role,
      status,
    },
  };
}
