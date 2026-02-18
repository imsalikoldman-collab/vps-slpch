-- CreateTable
CREATE TABLE "PersonnelCard" (
    "id" SERIAL NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "registryId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonnelCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseCard" (
    "id" SERIAL NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "introDoc" JSONB NOT NULL,
    "conclusionDoc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseCardBullet" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "contentDoc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseCardBullet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCard" (
    "id" SERIAL NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "titleHref" TEXT,
    "introDoc" JSONB NOT NULL,
    "conclusionDoc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCardBullet" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "contentDoc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCardBullet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonnelCard_displayOrder_idx" ON "PersonnelCard"("displayOrder");

-- CreateIndex
CREATE INDEX "CaseCard_displayOrder_idx" ON "CaseCard"("displayOrder");

-- CreateIndex
CREATE INDEX "CaseCardBullet_cardId_idx" ON "CaseCardBullet"("cardId");

-- CreateIndex
CREATE INDEX "CaseCardBullet_displayOrder_idx" ON "CaseCardBullet"("displayOrder");

-- CreateIndex
CREATE INDEX "PartnerCard_displayOrder_idx" ON "PartnerCard"("displayOrder");

-- CreateIndex
CREATE INDEX "PartnerCardBullet_cardId_idx" ON "PartnerCardBullet"("cardId");

-- CreateIndex
CREATE INDEX "PartnerCardBullet_displayOrder_idx" ON "PartnerCardBullet"("displayOrder");

-- AddForeignKey
ALTER TABLE "CaseCardBullet" ADD CONSTRAINT "CaseCardBullet_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CaseCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCardBullet" ADD CONSTRAINT "PartnerCardBullet_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PartnerCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
