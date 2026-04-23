-- CreateTable
CREATE TABLE "books" (
    "code" VARCHAR(32) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "books_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "members" (
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "penalizedUntil" TIMESTAMPTZ(6),

    CONSTRAINT "members_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "borrowings" (
    "id" UUID NOT NULL,
    "memberCode" VARCHAR(32) NOT NULL,
    "bookCode" VARCHAR(32) NOT NULL,
    "borrowedAt" TIMESTAMPTZ(6) NOT NULL,
    "returnedAt" TIMESTAMPTZ(6),

    CONSTRAINT "borrowings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "borrowings_bookCode_returnedAt_idx" ON "borrowings"("bookCode", "returnedAt");

-- CreateIndex
CREATE INDEX "borrowings_memberCode_returnedAt_idx" ON "borrowings"("memberCode", "returnedAt");

-- AddForeignKey
ALTER TABLE "borrowings" ADD CONSTRAINT "borrowings_memberCode_fkey" FOREIGN KEY ("memberCode") REFERENCES "members"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowings" ADD CONSTRAINT "borrowings_bookCode_fkey" FOREIGN KEY ("bookCode") REFERENCES "books"("code") ON DELETE CASCADE ON UPDATE CASCADE;
