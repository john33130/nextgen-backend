-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deactivated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deactivationDate" TIMESTAMP(3);
