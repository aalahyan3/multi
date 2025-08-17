/*
  Warnings:

  - You are about to drop the column `specic_color` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "specic_color",
ADD COLUMN     "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "specific_color" TEXT NOT NULL DEFAULT '#494bd6';
