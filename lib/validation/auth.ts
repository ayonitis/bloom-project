import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Tell us what to call you.").max(60),
  email: z.string().trim().toLowerCase().email("That doesn't look like a valid email."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Keep it under 72 characters.")
    .regex(/[a-zA-Z]/, "Include at least one letter.")
    .regex(/[0-9]/, "Include at least one number."),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("That doesn't look like a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
