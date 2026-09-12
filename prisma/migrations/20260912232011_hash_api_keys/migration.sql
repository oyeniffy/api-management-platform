/*
  Warnings:

  - You are about to drop the column `key` on the `api_keys` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keyHash]` on the table `api_keys` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyHash` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyPrefix` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "api_keys_key_key";

-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "key",
ADD COLUMN     "keyHash" TEXT NOT NULL,
ADD COLUMN     "keyPrefix" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");
