-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filters" JSONB,

    CONSTRAINT "TrackedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSnapshot" (
    "id" TEXT NOT NULL,
    "trackedItemId" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceCent" INTEGER,
    "listPriceCent" INTEGER,
    "inStock" BOOLEAN,
    "title" TEXT,
    "rawJson" JSONB NOT NULL,
    "etag" TEXT NOT NULL,

    CONSTRAINT "ProductSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeEvent" (
    "id" TEXT NOT NULL,
    "trackedItemId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "diff" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changeEventId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sendAt" TIMESTAMP(3),
    "meta" JSONB,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TrackedItem_productCode_idx" ON "TrackedItem"("productCode");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedItem_userId_productCode_key" ON "TrackedItem"("userId", "productCode");

-- CreateIndex
CREATE INDEX "ProductSnapshot_trackedItemId_fetchedAt_idx" ON "ProductSnapshot"("trackedItemId", "fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSnapshot_trackedItemId_etag_key" ON "ProductSnapshot"("trackedItemId", "etag");

-- CreateIndex
CREATE INDEX "ChangeEvent_trackedItemId_createdAt_idx" ON "ChangeEvent"("trackedItemId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- AddForeignKey
ALTER TABLE "TrackedItem" ADD CONSTRAINT "TrackedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSnapshot" ADD CONSTRAINT "ProductSnapshot_trackedItemId_fkey" FOREIGN KEY ("trackedItemId") REFERENCES "TrackedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeEvent" ADD CONSTRAINT "ChangeEvent_trackedItemId_fkey" FOREIGN KEY ("trackedItemId") REFERENCES "TrackedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeEvent" ADD CONSTRAINT "ChangeEvent_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ProductSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_changeEventId_fkey" FOREIGN KEY ("changeEventId") REFERENCES "ChangeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
