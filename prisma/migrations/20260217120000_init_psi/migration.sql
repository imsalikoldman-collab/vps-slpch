-- CreateTable
CREATE TABLE "PsiCard" (
    "id" SERIAL NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "nameHref" TEXT,
    "age" INTEGER,
    "citizenship" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "photoPath" TEXT,
    "photoAlt" TEXT,
    "introDoc" JSONB NOT NULL,
    "conclusionDoc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsiCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsiCardBullet" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "contentDoc" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PsiCardBullet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PsiCard_displayOrder_idx" ON "PsiCard"("displayOrder");

-- CreateIndex
CREATE INDEX "PsiCardBullet_cardId_idx" ON "PsiCardBullet"("cardId");

-- CreateIndex
CREATE INDEX "PsiCardBullet_displayOrder_idx" ON "PsiCardBullet"("displayOrder");

-- AddForeignKey
ALTER TABLE "PsiCardBullet" ADD CONSTRAINT "PsiCardBullet_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PsiCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
