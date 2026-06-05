-- AlterTable
ALTER TABLE "user" ADD COLUMN "preferred_country_id" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_preferred_country_id_fkey" FOREIGN KEY ("preferred_country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
