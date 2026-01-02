/*
  Warnings:

  - Added the required column `lastSeen` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
