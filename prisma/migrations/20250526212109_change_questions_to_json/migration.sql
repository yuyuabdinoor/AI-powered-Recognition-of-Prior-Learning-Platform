/*
  Warnings:

  - The `questions` column on the `Submission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "questions",
ADD COLUMN     "questions" JSONB;
