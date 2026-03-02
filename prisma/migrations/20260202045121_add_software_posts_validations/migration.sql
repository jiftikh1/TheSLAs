-- CreateTable
CREATE TABLE "Software" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "softwareId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "trustScore" REAL NOT NULL DEFAULT 0,
    "signalQuality" REAL NOT NULL DEFAULT 0,
    "slopRisk" REAL NOT NULL DEFAULT 0,
    "hasAnchors" BOOLEAN NOT NULL DEFAULT false,
    "flaggedForPricing" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" TEXT NOT NULL DEFAULT 'published',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Validation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Validation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Validation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkedinId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT,
    "industry" TEXT,
    "companySize" TEXT,
    "seniority" TEXT,
    "reputationScore" REAL NOT NULL DEFAULT 0,
    "reputationTier" TEXT NOT NULL DEFAULT 'emerging',
    "lastActiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("companySize", "createdAt", "email", "id", "image", "industry", "linkedinId", "name", "role", "seniority", "updatedAt") SELECT "companySize", "createdAt", "email", "id", "image", "industry", "linkedinId", "name", "role", "seniority", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_linkedinId_key" ON "User"("linkedinId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Software_name_key" ON "Software"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Software_slug_key" ON "Software"("slug");

-- CreateIndex
CREATE INDEX "Post_softwareId_idx" ON "Post"("softwareId");

-- CreateIndex
CREATE INDEX "Post_dimension_idx" ON "Post"("dimension");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_trustScore_idx" ON "Post"("trustScore");

-- CreateIndex
CREATE INDEX "Validation_postId_idx" ON "Validation"("postId");

-- CreateIndex
CREATE INDEX "Validation_userId_idx" ON "Validation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Validation_postId_userId_type_key" ON "Validation"("postId", "userId", "type");
