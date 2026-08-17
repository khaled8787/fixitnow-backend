import { PaymentStatus } from "@prisma/client";
import { z } from "zod";



const createPaymentValidationSchema = z.object({
  body: z
    .object({
      bookingId: z
        .string()
        .trim()
        .min(1, "Booking ID is required"),

      provider: z
        .literal("STRIPE", {
          error: "Provider must be STRIPE",
        }),
    })
    .strict(),
});


const updatePaymentStatusValidationSchema =
  z.object({
    body: z
      .object({
        status: z.enum(
          PaymentStatus,
          {
            error: "Invalid payment status",
          }
        ),
      })
      .strict(),
  });



export const PaymentValidation = {
  createPaymentValidationSchema,
  updatePaymentStatusValidationSchema,
};