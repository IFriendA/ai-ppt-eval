import { getToken } from "@/lib/auth";
import type { Res } from "@/api/types";

export async function post<T>(
  path: string,
  body?: object,
): Promise<Res<T>> {
  const token = getToken();

  const response = await fetch(`/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  return response.json() as Promise<Res<T>>;
}
