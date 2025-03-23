/*
  Warnings:

  - You are about to drop the column `articleId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Like` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_productId_fkey";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "articleId",
DROP COLUMN "productId";
