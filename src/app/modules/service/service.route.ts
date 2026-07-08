import { Router } from "express";
import { Role } from "@prisma/client";

import { ServiceController } from "./service.controller";
import { ServiceValidation } from "./service.validation";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";

const router = Router();

router.post(
  "/",
  auth(Role.TECHNICIAN),
  validateRequest(ServiceValidation.createServiceValidationSchema),
  ServiceController.createService
);

router.get("/", ServiceController.getAllServices);

router.get("/:id", ServiceController.getSingleService);

router.patch(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(ServiceValidation.updateServiceValidationSchema),
  ServiceController.updateService
);

router.delete(
  "/:id",
  auth(Role.TECHNICIAN),
  ServiceController.deleteService
);

export const ServiceRoutes = router;