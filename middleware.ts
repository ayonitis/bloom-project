import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/authConfig";

export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/habits/:path*",
    "/my-garden/:path*",
    "/achievements/:path*",
    "/inventory/:path*",
    "/shop/:path*",
    "/statistics/:path*",
  ],
};
