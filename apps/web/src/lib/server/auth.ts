export const SESSION_COOKIE_NAME = "session";

export interface SessionUser {
  id: number;
  name: string;
  avatar: string | null;
  role: string;
}
