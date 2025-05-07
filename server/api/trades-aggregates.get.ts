import prisma from "~/lib/prisma";
import type {TradesAggregateModel} from "~/lib/apiModels";
import protectRoute from "~/server/protectRoute";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const trades = await prisma.tradesAggr.findMany();
  return trades.map(trade => {
    return {
      symbol: trade.symbol,
      qty: trade.qty.toNumber(),
      quoteQty: trade.quoteQty.toNumber(),
      avgPrice: trade.avgPrice.toNumber(),
      timestamp: trade.timestamp,
    } as TradesAggregateModel
  });
})