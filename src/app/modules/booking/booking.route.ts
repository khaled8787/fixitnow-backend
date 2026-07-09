import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";
import { BookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(BookingValidation.createBookingValidationSchema),
  BookingController.createBooking
);

router.get(
  "/",
  auth(Role.ADMIN),
  BookingController.getAllBookings
);

router.get(
  "/:id",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  BookingController.getSingleBooking
);

router.patch(
  "/:id",
  auth(Role.CUSTOMER),
  validateRequest(BookingValidation.updateBookingValidationSchema),
  BookingController.updateBooking
);

router.patch(
  "/:id/status",
  auth(Role.TECHNICIAN),
  validateRequest(BookingValidation.updateBookingStatusValidationSchema),
  BookingController.updateBookingStatus
);

router.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  BookingController.cancelBooking
);

export const BookingRoutes = router;