-- CreateEnum
CREATE TYPE "Usertype" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "userType" "Usertype" NOT NULL DEFAULT 'user',
ALTER COLUMN "username" DROP NOT NULL;
