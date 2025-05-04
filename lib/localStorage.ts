import type {UserModel} from "~/lib/apiModels";

const USER_SESSION_KEY = "kapitalist-user-session";

export function saveUserSession(user: UserModel | null) {
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
}

export function getUserSession(): UserModel | null {
  const userSession = localStorage.getItem(USER_SESSION_KEY);
  return userSession ? JSON.parse(userSession) : null;
}

export function clearUserSession() {
  localStorage.removeItem(USER_SESSION_KEY);
}