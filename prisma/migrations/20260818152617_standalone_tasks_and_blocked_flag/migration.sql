-- CreateEnum
CREATE TYPE "TaskBlockedReason" AS ENUM ('WAITING_PERSON', 'WAITING_ANSWER', 'WAITING_FILE', 'OTHER');

-- AlterTable
ALTER TABLE "ActivityLog" ALTER COLUMN "campaignId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedNote" TEXT,
ADD COLUMN     "blockedReason" "TaskBlockedReason",
ALTER COLUMN "campaignId" DROP NOT NULL;
