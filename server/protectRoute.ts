import {SESSION_COOKIE_NAME, verifyJwtToken} from "~/lib/auth";
import type {H3Event} from 'h3';
import {parseCookies} from 'h3';
import type {JWTPayload} from "jose";

export default async (event: H3Event) => {
  if (import.meta.client) {
    return;
  }

  const token = await isAuthenticated(event);
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  event.context.userId = token.sub || '';
};

const isAuthenticated = async (event: H3Event): Promise<JWTPayload | null> => {
  const cookieValue = parseCookies(event)[SESSION_COOKIE_NAME];
  if (!cookieValue) {
    return null;
  }

  return await verifyJwtToken(cookieValue);
};