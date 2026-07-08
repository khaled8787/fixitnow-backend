import { Role, UserStatus } from "@prisma/client";
import { z } from "zod";

const updateUserValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .optional(),
  phone: z.string().trim().optional(),
  image: z.url("Image must be a valid URL.").optional(),
});

const updateUserStatusValidationSchema = z.object({
  status: z.enum(UserStatus),
});

const userQueryValidationSchema = z.object({
  searchTerm: z.string().trim().optional(),
  role: z.enum(Role).optional(),
  status: z.enum(UserStatus).optional(),
});

export const UserValidation = {
  updateUserValidationSchema,
  updateUserStatusValidationSchema,
  userQueryValidationSchema,
};