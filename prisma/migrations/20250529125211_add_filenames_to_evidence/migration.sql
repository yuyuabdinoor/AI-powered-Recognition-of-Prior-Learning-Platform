/*
  Warnings:

  - The `scores` column on the `Evidence` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "filenames" TEXT[],
DROP COLUMN "scores",
ADD COLUMN     "scores" INTEGER,
ALTER COLUMN "feedback" DROP NOT NULL,
ALTER COLUMN "feedback" SET DATA TYPE TEXT;
