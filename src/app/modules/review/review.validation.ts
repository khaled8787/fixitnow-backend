import { z } from "zod";

const createReviewValidationSchema = z
  .object({
    bookingId: z.string().trim().min(1, {
      message: "Booking ID is required",
    }),

    rating: z
      .number()
      .int({
        message: "Rating must be an integer",
      })
      .min(1, {
        message: "Rating must be at least 1",
      })
      .max(5, {
        message: "Rating cannot exceed 5",
      }),

    comment: z
      .string()
      .trim()
      .max(1000, {
        message: "Comment cannot exceed 1000 characters",
      })
      .optional(),
  })
  .strict();

const updateReviewValidationSchema = z
  .object({
    rating: z
      .number()
      .int({
        message: "Rating must be an integer",
      })
      .min(1, {
        message: "Rating must be at least 1",
      })
      .max(5, {
        message: "Rating cannot exceed 5",
      })
      .optional(),

    comment: z
      .string()
      .trim()
      .max(1000, {
        message: "Comment cannot exceed 1000 characters",
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};