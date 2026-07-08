import { Router } from "express";
import { Role } from "@prisma/client";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/ValidateRequest";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerUserValidationSchema),
  AuthController.registerUser
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginUserValidationSchema),
  AuthController.loginUser
);

router.get(
  "/me",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  AuthController.getMe
);

export const AuthRoutes = router;