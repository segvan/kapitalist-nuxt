import type {H3Event} from 'h3';

export default async (event: H3Event) => {
  if (import.meta.client) {
    return;
  }

  const apiKey = event.headers.get('x-api-key');
  if (apiKey === process.env.API_KEY) {
    return;
  }

  throw createError({
    statusCode: 401,
    message: 'Unauthorized',
  });
};