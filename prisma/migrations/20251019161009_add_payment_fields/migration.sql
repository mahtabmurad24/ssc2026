-- CreateTable
CREATE TABLE "public"."JerseyOrder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jerseyName" TEXT,
    "class" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "size" TEXT NOT NULL DEFAULT 'M',
    "trxId" TEXT,
    "paymentNumber" TEXT,
    "paymentMethod" TEXT,
    "location" TEXT,
    "customLocation" TEXT,
    "kitVote" TEXT,
    "amountPaid" DOUBLE PRECISION DEFAULT 0,
    "totalPrice" DOUBLE PRECISION DEFAULT 0,
    "remainingPrice" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JerseyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JerseyImage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageType" TEXT NOT NULL DEFAULT 'jersey',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JerseyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KitVote" (
    "id" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KitVote_pkey" PRIMARY KEY ("id")
);
