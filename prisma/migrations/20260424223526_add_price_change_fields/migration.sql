/*
  Warnings:

  - Added the required column `prevClosePrice` to the `AssetPrices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceChangePercent` to the `AssetPrices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetPrices" ADD COLUMN "prevClosePrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN "priceChangePercent" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "AssetPrices" ALTER COLUMN "prevClosePrice" DROP DEFAULT,
ALTER COLUMN "priceChangePercent" DROP DEFAULT;
