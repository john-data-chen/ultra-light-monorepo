import type { UserRole } from "@ultra-light/db";
import type { Hono } from "hono";

export interface SessionUser {
  id: number;
  name: string;
  avatar: string;
  role: UserRole;
}

export interface AppEnv {
  Variables: {
    user: SessionUser;
  };
}

export type App = Hono<AppEnv>;
