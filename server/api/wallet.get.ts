import prisma from "~/lib/prisma";
import protectRoute from "~/server/protectRoute";
import type {WalletModel} from "~/lib/apiModels";

const fmt = (val: { toNumber(): number } | null, decimals = 2) =>
  parseFloat((val?.toNumber() ?? 0).toFixed(decimals));

export default defineEventHandler(async (event): Promise<WalletModel> => {
  await protectRoute(event);

  const [balances, aggregates, defaultStable] = await Promise.all([
    prisma.walletBalance.findMany({orderBy: {value: 'desc'}}),
    prisma.tradesAggr.findMany(),
    prisma.stable.findFirst({where: {isDefault: true}}),
  ]);

  const stableId = defaultStable?.id ?? 'USDT';
  const aggrMap = new Map(aggregates.map(a => [a.symbol, a]));

  const assets = balances.map(b => {
    const aggr = aggrMap.get(`${b.symbol}${stableId}`);
    return {
      symbol: b.symbol,
      qty: fmt(b.qty, 8),
      value: fmt(b.value),
      price: fmt(b.price),
      dailyPnl: fmt(b.dailyPnl),
      dailyPnlPct: fmt(b.dailyPnlPct),
      avgPrice: aggr ? fmt(aggr.avgPrice) : null,
      timestamp: b.timestamp,
    };
  });

  const totalValue = parseFloat(assets.reduce((s, a) => s + a.value, 0).toFixed(2));
  const dailyPnl = parseFloat(assets.reduce((s, a) => s + a.dailyPnl, 0).toFixed(2));
  const prevTotal = totalValue - dailyPnl;
  const dailyPnlPct = parseFloat((prevTotal > 0 ? (dailyPnl / prevTotal) * 100 : 0).toFixed(2));

  return {totalValue, dailyPnl, dailyPnlPct, assets};
});
