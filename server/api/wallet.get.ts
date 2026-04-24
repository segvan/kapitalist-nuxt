import prisma from "~/lib/prisma";
import protectRoute from "~/server/protectRoute";
import type {WalletModel} from "~/lib/apiModels";

const fmt = (val: number, decimals = 2) =>
  parseFloat(val.toFixed(decimals));

export default defineEventHandler(async (event): Promise<WalletModel> => {
  await protectRoute(event);

  const [balances, prices, stables, aggregates] = await Promise.all([
    prisma.walletBalance.findMany(),
    prisma.assetPrices.findMany(),
    prisma.stable.findMany(),
    prisma.tradesAggr.findMany(),
  ]);

  const defaultStable = stables.find(s => s.isDefault);
  const stableId = defaultStable?.id ?? 'USDT';
  const stableSet = new Set(stables.map(s => s.id));
  const priceMap = new Map(prices.map(p => [p.id, p]));
  const aggrMap = new Map(aggregates.map(a => [a.symbol, a]));

  const assets = balances
    .map(b => {
      const qty = b.qty.toNumber();
      const aggr = aggrMap.get(`${b.symbol}${stableId}`);
      const avgPrice = aggr ? fmt(aggr.avgPrice.toNumber()) : null;

      if (stableSet.has(b.symbol)) {
        return {symbol: b.symbol, qty: fmt(qty, 8), value: fmt(qty), price: 1, dailyPnl: 0, dailyPnlPct: 0, avgPrice, timestamp: b.timestamp};
      }

      const p = priceMap.get(b.symbol);
      if (!p) return null;

      const price = p.price.toNumber();
      const prevClose = p.prevClosePrice.toNumber();
      return {
        symbol: b.symbol,
        qty: fmt(qty, 8),
        value: fmt(qty * price),
        price: fmt(price),
        dailyPnl: fmt(qty * (price - prevClose)),
        dailyPnlPct: fmt(p.priceChangePercent.toNumber()),
        avgPrice,
        timestamp: b.timestamp,
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => b.value - a.value);

  const totalValue = fmt(assets.reduce((s, a) => s + a.value, 0));
  const dailyPnl = fmt(assets.reduce((s, a) => s + a.dailyPnl, 0));
  const prevTotal = totalValue - dailyPnl;
  const dailyPnlPct = fmt(prevTotal > 0 ? (dailyPnl / prevTotal) * 100 : 0);

  return {totalValue, dailyPnl, dailyPnlPct, assets};
});
