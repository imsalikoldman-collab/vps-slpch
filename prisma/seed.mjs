import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DATA_PATH = path.join(__dirname, "seed-data", "current-state.json");

const EMPTY_DOC = {
  type: "doc",
  content: [{ type: "paragraph", content: [] }],
};

function toDoc(value) {
  if (value && typeof value === "object" && value.type === "doc" && Array.isArray(value.content)) {
    return value;
  }
  return EMPTY_DOC;
}

function toDisplayOrder(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

async function loadSeedData() {
  const raw = await readFile(SEED_DATA_PATH, "utf8");
  const parsed = JSON.parse(raw);

  return {
    personnelCards: Array.isArray(parsed.personnelCards) ? parsed.personnelCards : [],
    caseCards: Array.isArray(parsed.caseCards) ? parsed.caseCards : [],
    partnerCards: Array.isArray(parsed.partnerCards) ? parsed.partnerCards : [],
    psiCards: Array.isArray(parsed.psiCards) ? parsed.psiCards : [],
  };
}

async function seedPersonnel(cards) {
  for (const card of cards) {
    await prisma.personnelCard.create({
      data: {
        displayOrder: toDisplayOrder(card.displayOrder, 0),
        registryId: String(card.registryId ?? "").trim(),
        fullName: String(card.fullName ?? "").trim(),
        role: String(card.role ?? "").trim(),
        status: String(card.status ?? "").trim(),
      },
    });
  }
}

async function seedCases(cards) {
  for (const card of cards) {
    const bullets = Array.isArray(card.bullets) ? card.bullets : [];

    await prisma.caseCard.create({
      data: {
        displayOrder: toDisplayOrder(card.displayOrder, 0),
        title: String(card.title ?? "").trim(),
        meta: String(card.meta ?? "").trim(),
        introDoc: toDoc(card.introDoc),
        conclusionDoc: toDoc(card.conclusionDoc),
        bullets: {
          create: bullets.map((bullet, index) => ({
            displayOrder: toDisplayOrder(bullet.displayOrder, (index + 1) * 10),
            contentDoc: toDoc(bullet.contentDoc),
          })),
        },
      },
    });
  }
}

async function seedPartners(cards) {
  for (const card of cards) {
    const bullets = Array.isArray(card.bullets) ? card.bullets : [];

    await prisma.partnerCard.create({
      data: {
        displayOrder: toDisplayOrder(card.displayOrder, 0),
        title: String(card.title ?? "").trim(),
        titleHref: card.titleHref === null || card.titleHref === undefined ? null : String(card.titleHref).trim() || null,
        introDoc: toDoc(card.introDoc),
        conclusionDoc: toDoc(card.conclusionDoc),
        bullets: {
          create: bullets.map((bullet, index) => ({
            displayOrder: toDisplayOrder(bullet.displayOrder, (index + 1) * 10),
            contentDoc: toDoc(bullet.contentDoc),
          })),
        },
      },
    });
  }
}

async function seedPsi(cards) {
  for (const card of cards) {
    const bullets = Array.isArray(card.bullets) ? card.bullets : [];

    await prisma.psiCard.create({
      data: {
        displayOrder: toDisplayOrder(card.displayOrder, 0),
        name: String(card.name ?? "").trim(),
        nameHref: card.nameHref === null || card.nameHref === undefined ? null : String(card.nameHref).trim() || null,
        age: card.age === null || card.age === undefined || card.age === "" ? null : Number(card.age),
        citizenship: String(card.citizenship ?? "").trim(),
        status: String(card.status ?? "").trim(),
        photoPath: card.photoPath === null || card.photoPath === undefined ? null : String(card.photoPath).trim() || null,
        photoAlt: card.photoAlt === null || card.photoAlt === undefined ? null : String(card.photoAlt).trim() || null,
        introDoc: toDoc(card.introDoc),
        conclusionDoc: toDoc(card.conclusionDoc),
        bullets: {
          create: bullets.map((bullet, index) => ({
            displayOrder: toDisplayOrder(bullet.displayOrder, (index + 1) * 10),
            contentDoc: toDoc(bullet.contentDoc),
          })),
        },
      },
    });
  }
}

async function clearData() {
  await prisma.caseCardBullet.deleteMany();
  await prisma.caseCard.deleteMany();
  await prisma.partnerCardBullet.deleteMany();
  await prisma.partnerCard.deleteMany();
  await prisma.personnelCard.deleteMany();
  await prisma.psiCardBullet.deleteMany();
  await prisma.psiCard.deleteMany();
}

async function main() {
  const seedData = await loadSeedData();

  await clearData();
  await seedPersonnel(seedData.personnelCards);
  await seedCases(seedData.caseCards);
  await seedPartners(seedData.partnerCards);
  await seedPsi(seedData.psiCards);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
