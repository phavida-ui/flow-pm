-- CreateEnum
CREATE TYPE "BoardStage" AS ENUM ('BRIEF', 'DRAFT_1', 'DRAFT_2', 'DRAFT_3', 'DONE');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "boardStage" "BoardStage" NOT NULL DEFAULT 'BRIEF';
