import { Role } from "@prisma/client";
import { z } from "zod";



const registerUserValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(
          2,
          "Name must be at least 2 characters."
        )
        .max(
          100,
          "Name must not exceed 100 characters."
        ),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address."),

      password: z
        .string()
        .min(
          8,
          "Password must be at least 8 characters."
        )
        .max(
          100,
          "Password must not exceed 100 characters."
        )
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),

      phone: z
        .string()
        .trim()
        .optional(),

      image: z
        .url()
        .optional(),

      role: z.enum(Role),
    })
    .strict(),
});



const loginUserValidationSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address."),

      password: z
        .string()
        .min(
          1,
          "Password is required."
        ),
    })
    .strict(),
});


export const AuthValidation = {
  registerUserValidationSchema,
  loginUserValidationSchema,
};