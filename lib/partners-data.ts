import { Prisma, type PartnerCard, type PartnerCardBullet } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { PartnerBulletDTO, PartnerCardDTO, PartnerCardInput } from "@/types/partners";
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

function mapBullet(bullet: PartnerCardBullet): PartnerBulletDTO {
  return {
    id: bullet.id,
    displayOrder: bullet.displayOrder,
    contentDoc: normalizeRichDoc(bullet.contentDoc),
  };
}

function mapCard(card: PartnerCard & { bullets: PartnerCardBullet[] }): PartnerCardDTO {
  return {
    id: card.id,
    displayOrder: card.displayOrder,
    title: card.title,
    titleHref: card.titleHref,
    introDoc: normalizeRichDoc(card.introDoc),
    conclusionDoc: normalizeRichDoc(card.conclusionDoc),
    bullets: card.bullets.sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id).map(mapBullet),
  };
}

export async function listPartnerCards(): Promise<PartnerCardDTO[]> {
  const cards = await prisma.partnerCard.findMany({
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    include: {
      bullets: {
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      },
    },
  });

  return cards.map(mapCard);
}

export async function createPartnerCard(input: PartnerCardInput): Promise<PartnerCardDTO> {
  const created = await prisma.partnerCard.create({
    data: {
      displayOrder: input.displayOrder,
      title: input.title,
      titleHref: input.titleHref || null,
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

export async function updatePartnerCard(id: number, input: PartnerCardInput): Promise<PartnerCardDTO | null> {
  const exists = await prisma.partnerCard.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) {
    return null;
  }

  const updated = await prisma.partnerCard.update({
    where: { id },
    data: {
      displayOrder: input.displayOrder,
      title: input.title,
      titleHref: input.titleHref || null,
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

export async function deletePartnerCard(id: number): Promise<boolean> {
  const result = await prisma.partnerCard.deleteMany({
    where: { id },
  });

  return result.count > 0;
}
