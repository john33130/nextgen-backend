/*
  Warnings:

  - You are about to drop the `measurements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_id_fkey";

-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "ph" DECIMAL(65,30),
ADD COLUMN     "risk" "RiskFactor" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "turbidity" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "waterTemperature" DECIMAL(65,30);

-- DropTable
DROP TABLE "measurements";
