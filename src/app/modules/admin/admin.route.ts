import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";

const router = Router();

router.get(
  "/users",
  auth(Role.ADMIN),
  AdminController.getAllUsers
);

router.patch(
  "/users/:id/status",
  auth(Role.ADMIN),
  validateRequest(AdminValidation.updateUserStatusValidationSchema),
  AdminController.updateUserStatus
);

router.get(
  "/bookings",
  auth(Role.ADMIN),
  AdminController.getAllBookings
);

router.get(
  "/categories",
  auth(Role.ADMIN),
  AdminController.getAllCategories
);

router.post(
  "/categories",
  auth(Role.ADMIN),
  validateRequest(AdminValidation.createCategoryValidationSchema),
  AdminController.createCategory
);

export const AdminRoutes = router;