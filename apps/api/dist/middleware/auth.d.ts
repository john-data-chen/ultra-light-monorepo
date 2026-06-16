/** Verify a signed cookie value and return the userId, or null if missing/tampered. */
export declare function parseSessionCookie(value: string | undefined): number | null;
export declare const authMiddleware: import("hono").MiddlewareHandler<
  any,
  string,
  {},
  | Response
  | (Response &
      import("hono").TypedResponse<
        {
          message: string;
        },
        401,
        "json"
      >)
>;
//# sourceMappingURL=auth.d.ts.map
