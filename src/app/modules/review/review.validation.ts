import { z } from "zod";

const createReviewValidationSchema =
  z.object({
    body: z.object({
      bookingId: z.string().min(1),

      rating: z
        .number()
        .int()
        .min(1)
        .max(5),

      comment: z
        .string()
        .trim()
        .max(1000)
        .optional(),
    }),
  });

const updateReviewValidationSchema =
  z.object({
    body: z.object({
      rating: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional(),

      comment: z
        .string()
        .trim()
        .max(1000)
        .optional(),
    }),
  });

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};