import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { ReviewService } from "./review.service";
import { IReviewFilterRequest } from "./review.interface";

const createReview = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await ReviewService.createReview(
        userId,
        req.body
      );

    sendResponse(res, StatusCodes.CREATED, {
      success: true,
      message: "Review created successfully",
      data: result,
    });
  }
);

const getAllReviews = catchAsync(
  async (req: Request, res: Response) => {
    const filters: IReviewFilterRequest = {
      technicianId:
        typeof req.query.technicianId ===
        "string"
          ? req.query.technicianId
          : undefined,

      bookingId:
        typeof req.query.bookingId ===
        "string"
          ? req.query.bookingId
          : undefined,

      rating:
        typeof req.query.rating ===
        "string"
          ? Number(req.query.rating)
          : undefined,
    };

    const result =
      await ReviewService.getAllReviews(
        filters
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Reviews retrieved successfully",
      data: result,
    });
  }
);

const getSingleReview = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await ReviewService.getSingleReview(
        String(req.params.id)
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Review retrieved successfully",
      data: result,
    });
  }
);

const updateReview = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await ReviewService.updateReview(
        String(req.params.id),
        userId,
        req.body
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  }
);

const deleteReview = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await ReviewService.deleteReview(
        String(req.params.id),
        userId
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Review deleted successfully",
      data: result,
    });
  }
);

export const ReviewController = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};