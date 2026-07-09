import { z } from "zod";

const createTechnicianProfileValidationSchema = z.object({
  body: z.object({
    bio: z
      .string()
      .trim()
      .max(1000, "Bio cannot exceed 1000 characters")
      .optional(),

    experience: z
      .int("Experience must be an integer")
      .min(0, "Experience cannot be negative")
      .max(60, "Experience cannot exceed 60 years"),

    hourlyRate: z
      .number({
        error: "Hourly rate must be a number",
      })
      .positive("Hourly rate must be greater than 0"),

    location: z
      .string()
      .trim()
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location cannot exceed 100 characters"),

    isAvailable: z.boolean().optional(),
  }),
});

const updateTechnicianProfileValidationSchema = z.object({
  body: z
    .object({
      bio: z
        .string()
        .trim()
        .max(1000, "Bio cannot exceed 1000 characters")
        .optional(),

      experience: z
        .int("Experience must be an integer")
        .min(0, "Experience cannot be negative")
        .max(60, "Experience cannot exceed 60 years")
        .optional(),

      hourlyRate: z
        .number({
          error: "Hourly rate must be a number",
        })
        .positive("Hourly rate must be greater than 0")
        .optional(),

      location: z
        .string()
        .trim()
        .min(2, "Location must be at least 2 characters")
        .max(100, "Location cannot exceed 100 characters")
        .optional(),

      isAvailable: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const TechnicianValidation = {
  createTechnicianProfileValidationSchema,
  updateTechnicianProfileValidationSchema,
};