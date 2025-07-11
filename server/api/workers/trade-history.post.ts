import {run as tradeHistoryBot} from "~/lib/bots/tradeHistoryBot";
import apiKeyProtectRoute from "~/server/apiKeyProtectRoute";

export default defineEventHandler(async (event) => {
  await apiKeyProtectRoute(event);

  await tradeHistoryBot();
})