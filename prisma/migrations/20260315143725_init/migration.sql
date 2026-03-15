-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "aliases" TEXT,
    "address" TEXT,
    "postalCode" TEXT NOT NULL DEFAULT '94700',
    "city" TEXT NOT NULL DEFAULT 'Maisons-Alfort',
    "lat" REAL,
    "lng" REAL,
    "addressStatus" TEXT NOT NULL DEFAULT 'needs_manual_validation',
    "ltNames" TEXT NOT NULL DEFAULT '[]',
    "ltCount" INTEGER NOT NULL DEFAULT 0,
    "telephonyEquipment" TEXT,
    "likelyManagedByDSI" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "zabbixStatus" TEXT NOT NULL DEFAULT 'not_connected',
    "sensorsStatus" TEXT NOT NULL DEFAULT 'none',
    "zabbixEnabled" BOOLEAN NOT NULL DEFAULT false,
    "zabbixHostId" TEXT,
    "zabbixHostName" TEXT,
    "zabbixTemplate" TEXT,
    "zabbixLastSync" DATETIME,
    "zabbixError" TEXT,
    "visibleOnMap" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "source" TEXT,
    "blackboxInstalled" BOOLEAN NOT NULL DEFAULT false,
    "blackboxModel" TEXT,
    "blackboxSerial" TEXT,
    "blackboxFirmware" TEXT,
    "blackboxInstalledAt" DATETIME,
    "blackboxInstalledBy" TEXT,
    "blackboxBayCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "Bay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "powerConsumption" REAL NOT NULL DEFAULT 0,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bay_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "bayId" TEXT,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "thresholdWarn" REAL NOT NULL DEFAULT 0,
    "thresholdCrit" REAL NOT NULL DEFAULT 0,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SensorReading_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SensorReading_bayId_fkey" FOREIGN KEY ("bayId") REFERENCES "Bay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "bayId" TEXT,
    "bayName" TEXT,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL DEFAULT 'system',
    "sensorType" TEXT,
    "value" REAL,
    "threshold" REAL,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alert_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "department" TEXT,
    "phone" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_zabbixHostId_key" ON "Site"("zabbixHostId");

-- CreateIndex
CREATE INDEX "Site_zabbixStatus_idx" ON "Site"("zabbixStatus");

-- CreateIndex
CREATE INDEX "Site_category_idx" ON "Site"("category");

-- CreateIndex
CREATE INDEX "Site_blackboxInstalled_idx" ON "Site"("blackboxInstalled");

-- CreateIndex
CREATE INDEX "Bay_siteId_idx" ON "Bay"("siteId");

-- CreateIndex
CREATE INDEX "SensorReading_siteId_type_idx" ON "SensorReading"("siteId", "type");

-- CreateIndex
CREATE INDEX "SensorReading_siteId_timestamp_idx" ON "SensorReading"("siteId", "timestamp");

-- CreateIndex
CREATE INDEX "SensorReading_bayId_idx" ON "SensorReading"("bayId");

-- CreateIndex
CREATE INDEX "SensorReading_timestamp_idx" ON "SensorReading"("timestamp");

-- CreateIndex
CREATE INDEX "Alert_siteId_idx" ON "Alert"("siteId");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_severity_status_idx" ON "Alert"("severity", "status");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
