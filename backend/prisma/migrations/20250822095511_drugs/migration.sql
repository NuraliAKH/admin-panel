/*
  Warnings:

  - You are about to drop the column `dosage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `genus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Drug" ADD COLUMN     "dosage" TEXT,
ADD COLUMN     "genus" TEXT,
ADD COLUMN     "manufacturer" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dosage",
DROP COLUMN "genus",
DROP COLUMN "manufacturer";
