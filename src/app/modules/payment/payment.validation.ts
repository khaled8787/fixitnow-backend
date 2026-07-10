import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { z } from "zod";

const createPaymentValidationSchema = z.object({
  body: z
    .object({
      bookingId: z
        .string()
        .trim()
        .min(1, "Booking ID is required"),

      provider: z.enum(PaymentProvider, {
        error: "Provider must be either STRIPE or SSLCOMMERZ",
      }),
    })
    .strict(),
});

const updatePaymentStatusValidationSchema = z.object({
  body: z
    .object({
      status: z.enum(PaymentStatus, {
        error: "Status must be PENDING, COMPLETED or FAILED",
      }),
    })
    .strict(),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
  updatePaymentStatusValidationSchema,
};