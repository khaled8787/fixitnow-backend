import { Router } from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/ValidateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview
);

router.get("/", ReviewController.getAllReviews);

router.get("/:id", ReviewController.getSingleReview);

router.patch(
  "/:id",
  auth(Role.CUSTOMER),
  validateRequest(ReviewValidation.updateReviewValidationSchema),
  ReviewController.updateReview
);

router.delete(
  "/:id",
  auth(Role.CUSTOMER),
  ReviewController.deleteReview
);

export const ReviewRoutes = router;