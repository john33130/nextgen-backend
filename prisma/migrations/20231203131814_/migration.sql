/*
  Warnings:

  - You are about to alter the column `name` on the `devices` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to drop the column `inactive` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "name" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "inactive",
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
