import type { PersonnelCard } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { PersonnelCardDTO, PersonnelCardInput } from "@/types/personnel";

function mapCard(card: PersonnelCard): PersonnelCardDTO {
  return {
    id: card.id,
    displayOrder: card.displayOrder,
    registryId: card.registryId,
    fullName: card.fullName,
    role: card.role,
    status: card.status,
  };
}

export async function listPersonnelCards(): Promise<PersonnelCardDTO[]> {
  const cards = await prisma.personnelCard.findMany({
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
  });

  return cards.map(mapCard);
}

export async function createPersonnelCard(input: PersonnelCardInput): Promise<PersonnelCardDTO> {
  const created = await prisma.personnelCard.create({
    data: {
      displayOrder: input.displayOrder,
      registryId: input.registryId,
      fullName: input.fullName,
      role: input.role,
      status: input.status,
    },
  });

  return mapCard(created);
}

export async function updatePersonnelCard(id: number, input: PersonnelCardInput): Promise<PersonnelCardDTO | null> {
  const exists = await prisma.personnelCard.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) {
    return null;
  }

  const updated = await prisma.personnelCard.update({
    where: { id },
    data: {
      displayOrder: input.displayOrder,
      registryId: input.registryId,
      fullName: input.fullName,
      role: input.role,
      status: input.status,
    },
  });

  return mapCard(updated);
}

export async function deletePersonnelCard(id: number): Promise<boolean> {
  const result = await prisma.personnelCard.deleteMany({
    where: { id },
  });

  return result.count > 0;
}
