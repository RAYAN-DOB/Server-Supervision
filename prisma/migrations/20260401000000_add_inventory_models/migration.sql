-- ─── Migration : Modèles Inventaire ─────────────────────────────────────────
-- Ajoute Local, Equipment, Media + colonnes slug/inventoryStatus à Site
-- et localId à Bay.

-- AddColumn Site.slug (nullable unique)
ALTER TABLE "Site" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");

-- AddColumn Site.inventoryStatus
ALTER TABLE "Site" ADD COLUMN "inventoryStatus" TEXT NOT NULL DEFAULT 'active';
CREATE INDEX "Site_inventoryStatus_idx" ON "Site"("inventoryStatus");

-- AddColumn Bay.localId (nullable FK to Local)
ALTER TABLE "Bay" ADD COLUMN "localId" TEXT;
CREATE INDEX "Bay_localId_idx" ON "Bay"("localId");

-- CreateTable Local
CREATE TABLE "Local" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Local_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Local_siteId_idx" ON "Local"("siteId");

-- CreateTable Equipment
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "Equipment_bayId_fkey" FOREIGN KEY ("bayId") REFERENCES "Bay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Equipment_bayId_idx" ON "Equipment"("bayId");

-- CreateTable Media
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "confidence" REAL,
    "siteId" TEXT,
    "localId" TEXT,
    "bayId" TEXT,
    "equipmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_bayId_fkey" FOREIGN KEY ("bayId") REFERENCES "Bay" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Media_siteId_idx" ON "Media"("siteId");
CREATE INDEX "Media_bayId_idx" ON "Media"("bayId");
