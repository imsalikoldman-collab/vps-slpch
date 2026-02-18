import { Prisma, type CaseCard, type CaseCardBullet } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CaseBulletDTO, CaseCardDTO, CaseCardInput } from "@/types/cases";
import { createEmptyRichDoc, type RichDoc } from "@/types/psi";

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

function mapBullet(bullet: CaseCardBullet): CaseBulletDTO {
  return {
    id: bullet.id,
    displayOrder: bullet.displayOrder,
    contentDoc: normalizeRichDoc(bullet.contentDoc),
  };
}

function mapCard(card: CaseCard & { bullets: CaseCardBullet[] }): CaseCardDTO {
  return {
    id: card.id,
    displayOrder: card.displayOrder,
    title: card.title,
    meta: card.meta,
    introDoc: normalizeRichDoc(card.introDoc),
    conclusionDoc: normalizeRichDoc(card.conclusionDoc),
    bullets: card.bullets.sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id).map(mapBullet),
  };
}

export async function listCaseCards(): Promise<CaseCardDTO[]> {
  const cards = await prisma.caseCard.findMany({
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    include: {
      bullets: {
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      },
    },
  });

  return cards.map(mapCard);
}

export async function createCaseCard(input: CaseCardInput): Promise<CaseCardDTO> {
  const created = await prisma.caseCard.create({
    data: {
      displayOrder: input.displayOrder,
      title: input.title,
      meta: input.meta,
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
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      },
    },
  });

  return mapCard(created);
}

export async function updateCaseCard(id: number, input: CaseCardInput): Promise<CaseCardDTO | null> {
  const exists = await prisma.caseCard.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) {
    return null;
  }

  const updated = await prisma.caseCard.update({
    where: { id },
    data: {
      displayOrder: input.displayOrder,
      title: input.title,
      meta: input.meta,
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
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      },
    },
  });

  return mapCard(updated);
}

export async function deleteCaseCard(id: number): Promise<boolean> {
  const result = await prisma.caseCard.deleteMany({
    where: { id },
  });

  return result.count > 0;
}
