import prisma from "~/lib/prisma";
import protectRoute from "~/server/protectRoute";
import {run as runPricesBot} from "~/lib/bots/pricesBot";
import {run as runTradeHistoryBot} from "~/lib/bots/tradeHistoryBot";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const {id} = await readBody<{id: string}>(event);

  if (!id || id.trim().length < 3) {
    throw createError({statusCode: 400, message: 'Invalid asset id'});
  }

  await prisma.asset.create({data: {id: id.trim().toUpperCase()}});

  await runPricesBot();
  await runTradeHistoryBot();
});
