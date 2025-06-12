import {run as tradeHistoryBot} from "~/lib/bots/tradeHistoryBot";

export default defineEventHandler(async () => {
  await tradeHistoryBot();
})