/*
  Warnings:

  - You are about to drop the column `parentId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_postId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "parentId";
ALTER TABLE "ChatMessage" DROP COLUMN "postId";

-- CreateTable
CREATE TABLE "GroupPostMessage" (
    "id" STRING NOT NULL,
    "content" STRING NOT NULL,
    "authorId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" STRING NOT NULL,

    CONSTRAINT "GroupPostMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupPostMessage" ADD CONSTRAINT "GroupPostMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPostMessage" ADD CONSTRAINT "GroupPostMessage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "GroupPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
