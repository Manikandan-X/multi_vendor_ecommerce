import { z } from "zod";
import { UserRole } from "../constants/enums";

// Mirrors app/schemas/auth.py RegisterRequest field constraints.
export const registerSchema = z.object({
  full_name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(150, "Full name must be under 150 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be under 100 characters"),
  // ADMIN is not self-registrable — that role should only ever be assigned
  // directly in the database or by an existing admin, never via this form.
  role: z.enum([UserRole.CUSTOMER, UserRole.VENDOR]),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
