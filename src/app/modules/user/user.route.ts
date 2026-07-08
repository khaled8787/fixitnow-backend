import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN),
  UserController.getAllUsers
);

router.get(
  "/:id",
  auth(Role.ADMIN),
  UserController.getSingleUser
);

router.patch(
  "/:id",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateUserProfile
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  UserController.deleteUser
);

export const UserRoutes = router;