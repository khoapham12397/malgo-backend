/*
  Warnings:

  - Added the required column `sessionId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChatSessionType" AS ENUM ('p2p', 'group');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "sessionId" STRING NOT NULL;

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" STRING NOT NULL,
    "lastMessage" JSONB NOT NULL,
    "lastUpdate" TIMESTAMP(3) NOT NULL,
    "type" "ChatSessionType" NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSessionUser" (
    "sessionId" STRING NOT NULL,
    "username" STRING NOT NULL,
    "unseenCnt" INT4 NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSessionUser_pkey" PRIMARY KEY ("sessionId","username")
);

-- CreateIndex
CREATE INDEX "ChatSessionUser_sessionId_idx" ON "ChatSessionUser"("sessionId");

-- CreateIndex
CREATE INDEX "ChatSessionUser_username_idx" ON "ChatSessionUser"("username");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSessionUser" ADD CONSTRAINT "ChatSessionUser_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSessionUser" ADD CONSTRAINT "ChatSessionUser_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
