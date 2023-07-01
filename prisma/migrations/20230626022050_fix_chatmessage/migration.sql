/*
  Warnings:

  - You are about to drop the column `parentAuthor` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `parentSummary` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_parentId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "parentAuthor";
ALTER TABLE "ChatMessage" DROP COLUMN "parentSummary";
ALTER TABLE "ChatMessage" ADD COLUMN     "referenceMessage" JSONB;
