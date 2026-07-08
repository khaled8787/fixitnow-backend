import { z } from "zod";

const categoryFieldsSchema = {
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name must not exceed 50 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters.")
    .optional(),
  icon: z
    .url("Icon must be a valid URL.")
    .optional(),
};

const createCategoryValidationSchema = z.object({
  name: categoryFieldsSchema.name,
  description: categoryFieldsSchema.description,
  icon: categoryFieldsSchema.icon,
});

const updateCategoryValidationSchema = z
  .object({
    name: categoryFieldsSchema.name.optional(),
    description: categoryFieldsSchema.description,
    icon: categoryFieldsSchema.icon,
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.icon !== undefined,
    {
      message: "At least one field must be provided for update.",
    }
  );

export const CategoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};