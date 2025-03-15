/*
  Warnings:

  - You are about to drop the column `admissionNo` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[grade,section]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classId,rollNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rollNumber` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Student_admissionNo_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "admissionNo",
DROP COLUMN "grade",
DROP COLUMN "section",
ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "rollNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Class_grade_section_key" ON "Class"("grade", "section");

-- CreateIndex
CREATE UNIQUE INDEX "Student_classId_rollNumber_key" ON "Student"("classId", "rollNumber");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
