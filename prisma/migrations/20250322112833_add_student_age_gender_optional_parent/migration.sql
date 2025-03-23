/*
  Warnings:

  - You are about to drop the column `url` on the `MaterialResource` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `MaterialResource` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_parentId_fkey";

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "MaterialResource" DROP COLUMN "url",
ADD COLUMN     "fileUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" TEXT,
ALTER COLUMN "parentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicture" TEXT;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
