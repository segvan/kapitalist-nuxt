import {run as runPricesBot} from "~/lib/bots/pricesBot";
import apiKeyProtectRoute from "~/server/apiKeyProtectRoute";

export default defineEventHandler(async (event) => {
  await apiKeyProtectRoute(event);

  await runPricesBot();
})