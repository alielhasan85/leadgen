-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "icpCriteria" JSONB,
ADD COLUMN     "icpTemplateId" TEXT,
ADD COLUMN     "searchQuery" TEXT;

-- AlterTable
ALTER TABLE "master_businesses" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "user_leads" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "contactedAt" TIMESTAMP(3),
ADD COLUMN     "outreachChannel" TEXT NOT NULL DEFAULT 'email';

-- CreateTable
CREATE TABLE "icp_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetSector" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "aiRationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "icp_templates_userId_idx" ON "icp_templates"("userId");

-- CreateIndex
CREATE INDEX "icp_templates_userId_targetSector_idx" ON "icp_templates"("userId", "targetSector");

-- AddForeignKey
ALTER TABLE "icp_templates" ADD CONSTRAINT "icp_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_icpTemplateId_fkey" FOREIGN KEY ("icpTemplateId") REFERENCES "icp_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
