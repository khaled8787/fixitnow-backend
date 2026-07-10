import { UserStatus } from "@prisma/client";
import { z } from "zod";

const updateUserStatusValidationSchema = z.object({
  status: z.nativeEnum(UserStatus),
}).strict();

const createCategoryValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
}).strict();

export const AdminValidation = {
  updateUserStatusValidationSchema,
  createCategoryValidationSchema,
};