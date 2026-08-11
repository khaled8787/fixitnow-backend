import { Role, Router } from "express";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";

import { BookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(
    BookingValidation.createBookingValidationSchema
  ),
  BookingController.createBooking
);


router.get(
  "/",
  auth(
    Role.ADMIN,
    Role.TECHNICIAN,
    Role.CUSTOMER
  ),
  BookingController.getAllBookings
);

/**
 * Get Single Booking
 *
 * CUSTOMER   -> Own booking
 * TECHNICIAN -> Own assigned booking
 * ADMIN      -> Any booking
 */
router.get(
  "/:id",
  auth(
    Role.CUSTOMER,
    Role.TECHNICIAN,
    Role.ADMIN
  ),
  BookingController.getSingleBooking
);

/**
 * Update Booking
 * CUSTOMER only
 */
router.patch(
  "/:id",
  auth(Role.CUSTOMER),
  validateRequest(
    BookingValidation.updateBookingValidationSchema
  ),
  BookingController.updateBooking
);

/**
 * Update Booking Status
 * TECHNICIAN only
 */
router.patch(
  "/:id/status",
  auth(Role.TECHNICIAN),
  validateRequest(
    BookingValidation.updateBookingStatusValidationSchema
  ),
  BookingController.updateBookingStatus
);

/**
 * Cancel Booking
 * CUSTOMER only
 */
router.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  BookingController.cancelBooking
);

export const BookingRoutes = router;