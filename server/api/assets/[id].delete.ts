import prisma from "~/lib/prisma";
import protectRoute from "~/server/protectRoute";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const id = getRouterParam(event, 'id') as string;

  await prisma.trades.deleteMany({where: {symbol: id}});
  await prisma.tradesAggr.deleteMany({where: {symbol: id}});
  await prisma.assetPrices.deleteMany({where: {id}});
  await prisma.asset.delete({where: {id}});
});
