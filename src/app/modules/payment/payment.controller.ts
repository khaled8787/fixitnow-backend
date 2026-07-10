import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IPaymentFilterRequest } from "./payment.interface";
import { PaymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await PaymentService.createPayment(userId, req.body);

  sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
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

  const result = await PaymentService.getAllPayments(filters);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await PaymentService.getSinglePayment(id);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

const updatePaymentStatus = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result = await PaymentService.updatePaymentStatus(id, req.body);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Payment status updated successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  createPayment,
  getAllPayments,
  getSinglePayment,
  updatePaymentStatus,
};