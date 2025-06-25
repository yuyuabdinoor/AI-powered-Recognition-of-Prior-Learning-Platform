/*
  Warnings:

  - Made the column `evidenceId` on table `Certificate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_evidenceId_fkey";

-- AlterTable
ALTER TABLE "Certificate" ALTER COLUMN "evidenceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
