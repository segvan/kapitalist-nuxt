import prisma from "~/lib/prisma";
import type {JobsModel} from "~/lib/apiModels";

export default defineEventHandler(async () => {
  const jobs = await prisma.jobsHistory.findMany();
  return jobs.map(job => job as JobsModel);
})