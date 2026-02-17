import { Prisma, type PsiCard, type PsiCardBullet } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { PsiBulletDTO, PsiCardDTO, PsiCardInput, RichDoc } from "@/types/psi";
import { createEmptyRichDoc } from "@/types/psi";
import { normalizePsiName } from "@/lib/psi-name";

function isRichDoc(value: unknown): value is RichDoc {
  if (!value || typeof value !== "object") {
    return false;
  }

  const doc = value as Partial<RichDoc>;
  return doc.type === "doc" && Array.isArray(doc.content);
}

function normalizeRichDoc(value: unknown): RichDoc {
  if (isRichDoc(value)) {
    return value;
  }
  return createEmptyRichDoc();
}

function toPrismaJson(value: RichDoc): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

function mapBullet(bullet: PsiCardBullet): PsiBulletDTO {
  return {
    id: bullet.id,
    displayOrder: bullet.displayOrder,
    contentDoc: normalizeRichDoc(bullet.contentDoc),
  };
}

function mapCard(card: PsiCard & { bullets: PsiCardBullet[] }): PsiCardDTO {
  return {
    id: card.id,
    displayOrder: card.displayOrder,
    name: normalizePsiName(card.name),
    nameHref: card.nameHref,
    age: card.age,
    citizenship: card.citizenship,
    status: card.status,
    photoPath: card.photoPath,
    photoAlt: card.photoAlt,
    introDoc: normalizeRichDoc(card.introDoc),
    conclusionDoc: normalizeRichDoc(card.conclusionDoc),
    bullets: card.bullets.sort((a, b) => a.displayOrder - b.displayOrder).map(mapBullet),
  };
}

export async function listPsiCards(): Promise<PsiCardDTO[]> {
  const cards = await prisma.psiCard.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      bullets: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return cards.map(mapCard);
}

export async function createPsiCard(input: PsiCardInput): Promise<PsiCardDTO> {
  const created = await prisma.psiCard.create({
    data: {
      displayOrder: input.displayOrder,
      name: normalizePsiName(input.name),
      nameHref: input.nameHref || null,
      age: input.age ?? null,
      citizenship: input.citizenship,
      status: input.status,
      photoPath: input.photoPath || null,
      photoAlt: input.photoAlt || null,
      introDoc: toPrismaJson(input.introDoc),
      conclusionDoc: toPrismaJson(input.conclusionDoc),
      bullets: {
        create: input.bullets.map((bullet) => ({
          displayOrder: bullet.displayOrder,
          contentDoc: toPrismaJson(bullet.contentDoc),
        })),
      },
    },
    include: {
      bullets: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return mapCard(created);
}

export async function updatePsiCard(id: number, input: PsiCardInput): Promise<PsiCardDTO | null> {
  const exists = await prisma.psiCard.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) {
    return null;
  }

  const updated = await prisma.psiCard.update({
    where: { id },
    data: {
        displayOrder: input.displayOrder,
        name: normalizePsiName(input.name),
      nameHref: input.nameHref || null,
      age: input.age ?? null,
      citizenship: input.citizenship,
      status: input.status,
      photoPath: input.photoPath || null,
      photoAlt: input.photoAlt || null,
      introDoc: toPrismaJson(input.introDoc),
      conclusionDoc: toPrismaJson(input.conclusionDoc),
      bullets: {
        deleteMany: {},
        create: input.bullets.map((bullet) => ({
          displayOrder: bullet.displayOrder,
          contentDoc: toPrismaJson(bullet.contentDoc),
        })),
      },
    },
    include: {
      bullets: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return mapCard(updated);
}

export async function deletePsiCard(id: number): Promise<boolean> {
  const result = await prisma.psiCard.deleteMany({
    where: { id },
  });

  return result.count > 0;
}
