import {printError, roundNumber, runInBatches} from "../botsHelpers";
import {saveJobRunTime} from "../jobsHistoryRepository";
import {binanceClient} from "../clients/binanceClient";
import type {RestMarketTypes, RestTradeTypes} from "@binance/connector-typescript";
import prisma from "~/lib/prisma";

type Balance = { asset: string; qty: number };

type WalletEntry = {
  symbol: string;
  qty: number;
  value: number;
  price: number;
  dailyPnl: number;
  dailyPnlPct: number;
};

const fetchBalances = async (): Promise<Balance[]> => {
  const response = await binanceClient.accountInformation({omitZeroBalances: true});
  const data = response as RestTradeTypes.accountInformationResponse;
  return data.balances.map(b => ({
    asset: b.asset,
    qty: parseFloat(b.free) + parseFloat(b.locked),
  }));
};

const bot = async (): Promise<void> => {
  const stables = await prisma.stable.findMany();
  const stableSet = new Set(stables.map(s => s.id));
  const defaultStable = stables.find(s => s.isDefault)?.id ?? 'USDT';

  const balances = await fetchBalances();

  const tickers = (await binanceClient.ticker24hr()) as RestMarketTypes.ticker24hrResponse[];
  const tickerMap = new Map(tickers.map(t => [t.symbol, t]));

  const now = new Date();
  const entries: WalletEntry[] = balances
    .map(b => {
      if (stableSet.has(b.asset)) {
        return {symbol: b.asset, qty: b.qty, value: b.qty, price: 1, dailyPnl: 0, dailyPnlPct: 0};
      }
      const ticker = tickerMap.get(`${b.asset}${defaultStable}`);
      if (!ticker) return null;
      const price = parseFloat(ticker.lastPrice);
      const prevClose = parseFloat(ticker.prevClosePrice);
      const value = roundNumber(b.qty * price);
      const dailyPnl = roundNumber(b.qty * (price - prevClose));
      const dailyPnlPct = roundNumber(parseFloat(ticker.priceChangePercent));
      return {symbol: b.asset, qty: b.qty, value, price, dailyPnl, dailyPnlPct};
    })
    .filter((e): e is WalletEntry => e !== null);

  await runInBatches(entries, async (entry) => {
    await prisma.walletBalance.upsert({
      where: {symbol: entry.symbol},
      update: {qty: entry.qty, value: entry.value, price: entry.price, dailyPnl: entry.dailyPnl, dailyPnlPct: entry.dailyPnlPct, timestamp: now},
      create: {symbol: entry.symbol, qty: entry.qty, value: entry.value, price: entry.price, dailyPnl: entry.dailyPnl, dailyPnlPct: entry.dailyPnlPct, timestamp: now}
    });
  });

  const activeSymbols = entries.map(e => e.symbol);
  await prisma.walletBalance.deleteMany({where: {symbol: {notIn: activeSymbols}}});

  await saveJobRunTime("WalletBot", "Wallet Bot");
};

const run = async () => {
  await bot().catch(async (e) => {
    await printError("Wallet Bot Exception", e);
  });
};

export {run};
