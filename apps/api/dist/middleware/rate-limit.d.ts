export interface RateLimitOptions {
  windowMs: number;
  max: number;
}
export declare function resetRateLimitStore(): void;
export declare function rateLimitMiddleware(
  options: RateLimitOptions
): import("hono").MiddlewareHandler<
  any,
  string,
  {},
  | Response
  | (Response &
      import("hono").TypedResponse<
        {
          message: string;
        },
        429,
        "json"
      >)
>;
//# sourceMappingURL=rate-limit.d.ts.map
