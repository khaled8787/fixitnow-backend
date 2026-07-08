import { z } from "zod";

const createServiceValidationSchema = z.object({
  body: z.object({
    categoryId: z
      .string()
      .trim()
      .min(1, "Category ID is required"),

    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description cannot exceed 1000 characters"),

    price: z
      .number({
        error: "Price must be a number",
      })
      .positive("Price must be greater than 0"),

    duration: z
      .int("Duration must be an integer")
      .min(15, "Duration must be at least 15 minutes")
      .max(1440, "Duration cannot exceed 1440 minutes"),
  }),
});

const updateServiceValidationSchema = z.object({
  body: z
    .object({
      categoryId: z
        .string()
        .trim()
        .min(1, "Category ID cannot be empty")
        .optional(),

      title: z
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title cannot exceed 100 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Description cannot exceed 1000 characters")
        .optional(),

      price: z
        .number({
          error: "Price must be a number",
        })
        .positive("Price must be greater than 0")
        .optional(),

      duration: z
        .int("Duration must be an integer")
        .min(15, "Duration must be at least 15 minutes")
        .max(1440, "Duration cannot exceed 1440 minutes")
        .optional(),

      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const ServiceValidation = {
  createServiceValidationSchema,
  updateServiceValidationSchema,
};