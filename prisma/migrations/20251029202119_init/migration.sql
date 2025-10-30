-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "authorId" INTEGER;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
