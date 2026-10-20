"use server";

import { toActionResult, type ActionResult } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { signUpSchema } from "@/lib/validation/auth";
import { userService, type PublicUser } from "@/services/userService";

export async function signUpAction(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult<PublicUser>> {
  return toActionResult(async () => {
    const input = signUpSchema.parse(formData);
    const passwordHash = await hashPassword(input.password);
    return userService.createWithPassword({
      name: input.name,
      email: input.email,
      passwordHash,
    });
  });
}
