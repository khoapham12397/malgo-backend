/*
  Warnings:

  - You are about to drop the column `groupId` on the `Thread` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Thread" DROP CONSTRAINT "Thread_groupId_fkey";

-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "groupId";
