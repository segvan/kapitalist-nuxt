import protectRoute from "~/server/protectRoute";
import {run as runPricesBot} from "~/lib/bots/pricesBot";
import {run as runPriceChangeBot} from "~/lib/bots/priceChangeBot";
import {run as runTradeHistoryBot} from "~/lib/bots/tradeHistoryBot";

const bots: Record<string, () => Promise<void>> = {
  pricesbot: runPricesBot,
  pricechangebot: runPriceChangeBot,
  tradehistorybot: runTradeHistoryBot,
};

const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const name = getRouterParam(event, 'name') ?? '';
  const bot = bots[normalize(name)];
  if (!bot) {
    throw createError({ statusCode: 404, message: `Unknown job: ${name}` });
  }

  await bot();
});
