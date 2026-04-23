import {run as runWalletBot} from "~/lib/bots/walletBot";
import apiKeyProtectRoute from "~/server/apiKeyProtectRoute";

export default defineEventHandler(async (event) => {
  await apiKeyProtectRoute(event);

  await runWalletBot();
})
