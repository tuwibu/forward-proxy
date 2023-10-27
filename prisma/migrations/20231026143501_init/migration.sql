-- CreateTable
CREATE TABLE "Proxy" (
    "apiKey" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "destination" TEXT,
    "port" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Proxy_port_key" ON "Proxy"("port");
