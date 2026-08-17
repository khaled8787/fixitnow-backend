import { Router } from "express";
import { Role } from "@prisma/client";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

/**
 * CUSTOMER
 * Create / initialize a payment for an accepted booking
 */
router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(
    PaymentValidation.createPaymentValidationSchema
  ),
  PaymentController.createPayment
);

/**
 * ADMIN
 * Get all payments
 */
router.get(
  "/",
  auth(Role.ADMIN),
  PaymentController.getAllPayments
);

/**
 * CUSTOMER / ADMIN
 * Get single payment
 */
router.get(
  "/:id",
  auth(Role.ADMIN, Role.CUSTOMER),
  PaymentController.getSinglePayment
);


router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(
    PaymentValidation.updatePaymentStatusValidationSchema
  ),
  PaymentController.updatePaymentStatus
);

export const PaymentRoutes = router;