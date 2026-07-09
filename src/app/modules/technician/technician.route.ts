import { Router } from "express";
import { Role } from "@prisma/client";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";
import { TechnicianController } from "./technician.controller";
import { TechnicianValidation } from "./technician.validation";

const router = Router();

router.post(
  "/",
  auth(Role.TECHNICIAN),
  validateRequest(
    TechnicianValidation.createTechnicianProfileValidationSchema
  ),
  TechnicianController.createTechnicianProfile
);

router.get("/", TechnicianController.getAllTechnicians);

router.get("/:id", TechnicianController.getSingleTechnician);

router.patch(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(
    TechnicianValidation.updateTechnicianProfileValidationSchema
  ),
  TechnicianController.updateTechnicianProfile
);

router.delete(
  "/:id",
  auth(Role.TECHNICIAN),
  TechnicianController.deleteTechnicianProfile
);

export const TechnicianRoutes = router;