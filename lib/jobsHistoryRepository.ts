import prisma from "~/lib/prisma";

const saveJobRunTime = async (jobId: string, displayName?: string): Promise<void> => {
  const now = new Date();
  await prisma.jobsHistory.upsert({
    where: {id: jobId},
    update: {timestamp: now},
    create: {id: jobId, name: displayName ?? jobId, timestamp: now}
  });
};

export {saveJobRunTime};
