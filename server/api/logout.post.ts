import {SESSION_COOKIE_NAME} from "~/lib/auth";

export default defineEventHandler(async (event) => {

  deleteCookie(event, SESSION_COOKIE_NAME, {
    httpOnly: true,
    path: "/",
  });
})
