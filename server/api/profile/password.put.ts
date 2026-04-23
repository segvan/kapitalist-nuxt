import protectRoute from '~/server/protectRoute';
import prisma from '~/lib/prisma';
import {createHash} from 'node:crypto';

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const email = event.context.userId;
  const {currentPassword, newPassword} = await readBody(event);

  if (!currentPassword) {
    throw createError({statusCode: 400, statusMessage: 'Current password is required'});
  }
  if (!newPassword || newPassword.length < 8) {
    throw createError({statusCode: 400, statusMessage: 'New password must be at least 8 characters'});
  }

  const user = await prisma.user.findUnique({where: {email}});
  if (!user) {
    throw createError({statusCode: 404, statusMessage: 'User not found'});
  }

  const currentHash = createHash('sha1').update(currentPassword).digest('hex');
  if (currentHash !== user.password) {
    throw createError({statusCode: 400, statusMessage: 'Current password is incorrect'});
  }

  const newHash = createHash('sha1').update(newPassword).digest('hex');
  await prisma.user.update({where: {email}, data: {password: newHash}});

  return {success: true};
});
