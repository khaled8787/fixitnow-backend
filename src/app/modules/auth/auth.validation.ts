import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z.email("Invalid email address").toLowerCase(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password cannot exceed 100 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password must contain at least one letter and one number"
      ),

    phone: z
      .string()
      .trim()
      .min(11, "Phone number must be at least 11 digits")
      .max(15, "Phone number cannot exceed 15 digits")
      .optional(),

    image: z.url("Invalid image URL").optional(),

    role: z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").toLowerCase(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  }),
});

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3)
      .max(100)
      .optional(),

    phone: z
      .string()
      .trim()
      .min(11)
      .max(15)
      .optional(),

    image: z.url().optional(),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  updateProfileValidationSchema,
};