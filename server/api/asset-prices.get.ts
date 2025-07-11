import prisma from "~/lib/prisma";
import type {AssetPriceModel} from "~/lib/apiModels";
import protectRoute from "~/server/protectRoute";

export default defineEventHandler(async (event) => {
  await protectRoute(event);
  console.log('--- get prices');
  const prices = await prisma.assetPrices.findMany();
  return prices.map(price => {
    return {
      id: price.id,
      price: price.price.toNumber(),
      timestamp: price.timestamp,
    } as AssetPriceModel
  });
})