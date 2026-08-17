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
  validateRequest(
    BookingValidation.createBookingValidationSchema
  ),
  BookingController.createBooking
);

/**
 * Get customer's own bookings
 */
router.get(
  "/my-bookings",
  auth(Role.CUSTOMER),
  BookingController.getMyBookings
);

/**
 * Update own booking
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
 * Cancel own booking
 */
router.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  BookingController.cancelBooking
);

/**
 * ============================================================
 * TECHNICIAN
 * ============================================================
 */

/**
 * Get technician's own bookings
 */
router.get(
  "/technician",
  auth(Role.TECHNICIAN),
  BookingController.getTechnicianBookings
);

/**
 * Technician accepts / declines / updates booking status
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
 * ============================================================
 * ADMIN
 * ============================================================
 */

/**
 * Admin can see ALL bookings
 */
router.get(
  "/admin",
  auth(Role.ADMIN),
  BookingController.getAdminBookings
);

/**
 * Admin can delete a booking
 */
router.delete(
  "/admin/:id",
  auth(Role.ADMIN),
  BookingController.deleteBooking
);


router.get(
  "/:id",
  auth(
    Role.CUSTOMER,
    Role.TECHNICIAN,
    Role.ADMIN
  ),
  BookingController.getSingleBooking
);

export const BookingRoutes = router;