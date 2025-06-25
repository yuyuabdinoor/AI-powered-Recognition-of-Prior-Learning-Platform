/*
  Warnings:

  - Changed the type of `responses` on the `Evidence` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `feedback` on table `Evidence` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `scores` to the `Evidence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "justifications" JSONB,
ADD COLUMN     "overall_score" DOUBLE PRECISION,
DROP COLUMN "responses",
ADD COLUMN     "responses" JSONB NOT NULL,
ALTER COLUMN "feedback" SET NOT NULL,
DROP COLUMN "scores",
ADD COLUMN     "scores" JSONB NOT NULL;
