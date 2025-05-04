import {getUserSession} from "~/lib/localStorage.js";

export default defineNuxtRouteMiddleware(() => {
  if(import.meta.server) {
    return;
  }

  const user = getUserSession();

  if (!user) {
    return navigateTo('/login');
  }
});