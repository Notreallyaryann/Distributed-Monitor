/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Monitor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Monitor" ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "httpStatus" INTEGER,
ADD COLUMN     "latency" INTEGER,
ADD COLUMN     "sslExpiresAt" TIMESTAMP(3),
ADD COLUMN     "sslStatus" TEXT NOT NULL DEFAULT 'UNKNOWN';

-- CreateIndex
CREATE UNIQUE INDEX "Monitor_url_key" ON "Monitor"("url");
