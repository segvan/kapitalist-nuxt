import prisma from "~/lib/prisma";

const saveJobRunTime = async (jobId: string): Promise<void> => {
  const now = new Date();
  await prisma.jobsHistory.update(
    {
      where: {id: jobId},
      data: {timestamp: now}
    });
};

const getJobRunTime = async (jobId: string): Promise<Date | undefined> => {
  const job = await prisma.jobsHistory.findFirst({
    where: {id: jobId}
  });

  return job?.timestamp;
}

export {saveJobRunTime, getJobRunTime};
