import {run as runPriceChangeBot} from "~/lib/bots/priceChangeBot";
import apiKeyProtectRoute from "~/server/apiKeyProtectRoute";

export default defineEventHandler(async (event) => {
  await apiKeyProtectRoute(event);

  await runPriceChangeBot();
})