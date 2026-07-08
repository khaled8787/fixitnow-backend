import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
);

router.get(
  "/",
  CategoryController.getAllCategories
);

router.get(
  "/:id",
  CategoryController.getSingleCategory
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;