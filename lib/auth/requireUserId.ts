import "server-only";
import { auth } from "@/lib/auth/config";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Every Server Action that touches user-owned data calls this first. It's
 * the one place session → userId resolution happens, so there's exactly
 * one code path to audit for "is this properly scoped to the caller".
 * Never trust a userId passed in from the client — always resolve it here.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}
