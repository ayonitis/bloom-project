import type { NextAuthConfig } from "next-auth";

// Keep in sync with the `matcher` in middleware.ts.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/habits",
  "/my-garden",
  "/achievements",
  "/inventory",
  "/shop",
  "/statistics",
];

/**
 * Deliberately minimal: this file must stay free of any Node-only import
 * (the Postgres driver, bcrypt, the Drizzle adapter) because middleware.ts
 * runs on Vercel's Edge runtime, which can't bundle those. It only needs
 * enough to decode the session JWT and decide "is this route allowed" —
 * the real providers (including the Credentials provider, which does need
 * database access) live in lib/auth/config.ts, used only by the Node.js
 * route handler.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        request.nextUrl.pathname.startsWith(prefix)
      );
      return isProtected ? Boolean(auth?.user) : true;
    },
  },
};
