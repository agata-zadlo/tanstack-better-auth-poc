import type { Session } from "@/types/auth";

export async function getSession(): Promise<Session | null> {
  try {
    const res = await fetch("http://localhost:3000/api/auth/get-session", {
      credentials: "include",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    // Better Auth returns { session: {...}, user: {...} }
    // We need to combine them into our Session type
    if (data.session && data.user) {
      return {
        user: data.user,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await fetch("http://localhost:3000/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export function getLoginUrl(callbackURL: string = "/"): string {
  return `http://localhost:3000/auth/start?callbackURL=${encodeURIComponent(callbackURL)}`;
}
