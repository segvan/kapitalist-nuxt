import protectRoute from '~/server/protectRoute';
import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const email = event.context.userId;
  const user = await prisma.user.findUnique({where: {email}, select: {email: true}});

  if (!user) {
    throw createError({statusCode: 404, statusMessage: 'User not found'});
  }

  return {email: user.email};
});
