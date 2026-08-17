import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IPaymentFilterRequest } from "./payment.interface";
import { PaymentService } from "./payment.service";

/**
 * ============================================================
 * CREATE PAYMENT
 * ============================================================
 */

const createPayment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result = await PaymentService.createPayment(
      userId,
      req.body
    );

    sendResponse(res, StatusCodes.CREATED, {
      success: true,
      message: "Payment initiated successfully",
      data: result,
    });
  }
);

/**
 * ============================================================
 * GET ALL PAYMENTS
 * ============================================================
 */

const getAllPayments = catchAsync(
  async (req: Request, res: Response) => {
    const filters: IPaymentFilterRequest = {
      status:
        typeof req.query.status === "string"
          ? (req.query.status as PaymentStatus)
          : undefined,

      provider:
        typeof req.query.provider === "string"
          ? (req.query.provider as PaymentProvider)
          : undefined,

      bookingId:
        typeof req.query.bookingId === "string"
          ? req.query.bookingId
          : undefined,

      transactionId:
        typeof req.query.transactionId === "string"
          ? req.query.transactionId
          : undefined,
    };

    const result =
      await PaymentService.getAllPayments(filters);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Payments retrieved successfully",
      data: result,
    });
  }
);

/**
 * ============================================================
 * GET SINGLE PAYMENT
 * ============================================================
 */

const getSinglePayment = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result =
      await PaymentService.getSinglePayment(
        id,
        req.user!.userId,
        req.user!.role
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Payment retrieved successfully",
      data: result,
    });
  }
);

/**
 * ============================================================
 * UPDATE PAYMENT STATUS
 * ============================================================
 */

const updatePaymentStatus = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result =
      await PaymentService.updatePaymentStatus(
        id,
        req.body
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Payment status updated successfully",
      data: result,
    });
  }
);

/**
 * ============================================================
 * STRIPE WEBHOOK
 * ============================================================
 */

const handleStripeWebhook = catchAsync(
  async (req: Request, res: Response) => {
    const signature =
      req.headers["stripe-signature"];

    if (
      !signature ||
      Array.isArray(signature)
    ) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Stripe signature is required",
      });

      return;
    }

    if (!Buffer.isBuffer(req.body)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          "Stripe webhook requires raw request body",
      });

      return;
    }

    const result =
      await PaymentService.handleStripeWebhook(
        req.body,
        signature
      );

    res.status(StatusCodes.OK).json({
      received: true,
      success: true,
      data: result,
    });
  }
);

export const PaymentController = {
  createPayment,
  getAllPayments,
  getSinglePayment,
  updatePaymentStatus,
  handleStripeWebhook,
};