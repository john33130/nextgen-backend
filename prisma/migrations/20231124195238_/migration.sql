-- CreateEnum
CREATE TYPE "RiskFactor" AS ENUM ('HIGH', 'MODERATE', 'LOW', 'UNKNOWN');

-- CreateTable
CREATE TABLE "users" (
    "id" CHAR(8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(192) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" CHAR(8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🌊',
    "accessKey" CHAR(16) NOT NULL,
    "userId" CHAR(8),
    "coordinates" JSONB NOT NULL DEFAULT '{"lat": "", "long": ""}',
    "batteryLevel" INTEGER,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "deviceId" CHAR(8) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tds" INTEGER,
    "ph" DECIMAL(65,30),
    "waterTemperature" DECIMAL(65,30),
    "turbidity" INTEGER,
    "risk" "RiskFactor" NOT NULL DEFAULT 'UNKNOWN',

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("deviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "devices_id_key" ON "devices"("id");

-- CreateIndex
CREATE UNIQUE INDEX "measurements_deviceId_key" ON "measurements"("deviceId");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_id_fkey" FOREIGN KEY ("id") REFERENCES "measurements"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
