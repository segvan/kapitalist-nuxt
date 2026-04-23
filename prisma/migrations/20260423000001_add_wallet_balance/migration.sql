CREATE TABLE "WalletBalance" (
    "symbol" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "dailyPnl" DECIMAL(65,30) NOT NULL,
    "dailyPnlPct" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletBalance_pkey" PRIMARY KEY ("symbol")
);

INSERT INTO "JobsHistory" ("id", "name", "timestamp")
VALUES ('WalletBot', 'Wallet Bot', NOW())
ON CONFLICT ("id") DO NOTHING;
