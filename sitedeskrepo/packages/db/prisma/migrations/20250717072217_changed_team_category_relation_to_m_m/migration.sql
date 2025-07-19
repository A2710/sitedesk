/*
  Warnings:

  - You are about to drop the column `teamId` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_teamId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "teamId";

-- CreateTable
CREATE TABLE "TeamCategory" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "TeamCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamCategory_teamId_categoryId_key" ON "TeamCategory"("teamId", "categoryId");

-- AddForeignKey
ALTER TABLE "TeamCategory" ADD CONSTRAINT "TeamCategory_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCategory" ADD CONSTRAINT "TeamCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
