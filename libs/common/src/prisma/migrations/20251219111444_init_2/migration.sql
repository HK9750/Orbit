/*
  Warnings:

  - A unique constraint covering the columns `[invitationToken]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'PENDING', 'DECLINED');

-- AlterTable
ALTER TABLE "OrganizationMember" ADD COLUMN     "invitationToken" TEXT,
ADD COLUMN     "invitedEmail" TEXT,
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_invitationToken_key" ON "OrganizationMember"("invitationToken");
