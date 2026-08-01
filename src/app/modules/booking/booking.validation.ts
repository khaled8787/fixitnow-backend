
import { BookingStatus } from "@prisma/client";
import { z } from "zod";

const createBookingValidationSchema = z
  .object({
    technicianId: z
      .string()
      .trim()
      .min(1, "Technician ID is required"),

    serviceId: z
      .string()
      .trim()
      .min(1, "Service ID is required"),

    bookingDate: z
      .string()
      .min(1, "Booking date is required")
      .datetime({
        message: "Booking date must be a valid ISO date string",
      }),

    bookingTime: z
      .string()
      .min(1, "Booking time is required")
      .datetime({
        message: "Booking time must be a valid ISO date string",
      }),

    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .max(300, "Address cannot exceed 300 characters"),

    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
  })
  .strict();

const updateBookingValidationSchema = z
  .object({
    bookingDate: z
      .string()
      .min(1, "Booking date cannot be empty")
      .datetime({
        message: "Booking date must be a valid ISO date string",
      })
      .optional(),

    bookingTime: z
      .string()
      .min(1, "Booking time cannot be empty")
      .datetime({
        message: "Booking time must be a valid ISO date string",
      })
      .optional(),

    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .max(300, "Address cannot exceed 300 characters")
      .optional(),

    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

const updateBookingStatusValidationSchema = z
  .object({
    status: z.nativeEnum(BookingStatus, {
      message: "Invalid booking status",
    }),
  })
  .strict();

export const BookingValidation = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
  updateBookingStatusValidationSchema,
};
