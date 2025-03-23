/*
  Warnings:

  - You are about to drop the column `endDate` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `weekNumber` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "weekNumber";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "age",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3);
