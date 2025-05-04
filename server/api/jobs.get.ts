import prisma from "~/lib/prisma";
import type {JobsModel} from "~/lib/apiModels";
import protectRoute from "~/server/protectRoute";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const jobs = await prisma.jobsHistory.findMany();
  return jobs.map(job => job as JobsModel);
})