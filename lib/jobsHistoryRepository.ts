import prisma from "~/lib/prisma";

const saveJobRunTime = async (jobId: string): Promise<void> => {
  const now = new Date();
  await prisma.jobsHistory.update(
    {
      where: {id: jobId},
      data: {timestamp: now}
    });
};

export {saveJobRunTime};
