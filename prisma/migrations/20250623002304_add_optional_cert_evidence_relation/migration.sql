/*
  Warnings:

  - A unique constraint covering the columns `[evidenceId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "evidenceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_evidenceId_key" ON "Certificate"("evidenceId");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
