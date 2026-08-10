import { Router } from "express";
import { Role } from "@prisma/client";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(
    PaymentValidation.createPaymentValidationSchema
  ),
  PaymentController.createPayment
);

router.get(
  "/",
  auth(Role.ADMIN),
  PaymentController.getAllPayments
);

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