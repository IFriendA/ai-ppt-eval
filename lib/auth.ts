import type { UserInfo } from "@/api/types";

const TOKEN_KEY = "eval_token";
const USER_KEY = "eval_user";

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function setAuth(user: UserInfo) {
  if (typeof window === "undefined") return;

  if (user.token) {
    localStorage.setItem(TOKEN_KEY, user.token);
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
