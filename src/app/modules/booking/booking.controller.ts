import { BookingStatus } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { BookingService } from "./booking.service";
import { IBookingFilterRequest } from "./booking.interface";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await BookingService.createBooking(userId, req.body);

  sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const filters: IBookingFilterRequest = {
    searchTerm:
      typeof req.query.searchTerm === "string"
        ? req.query.searchTerm
        : undefined,

    status:
      typeof req.query.status === "string"
        ? (req.query.status as BookingStatus)
        : undefined,

    bookingDate:
      typeof req.query.bookingDate === "string"
        ? req.query.bookingDate
        : undefined,

    technicianId:
      typeof req.query.technicianId === "string"
        ? req.query.technicianId
        : undefined,
  };

  const result = await BookingService.getAllBookings(filters);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await BookingService.getSingleBooking(id);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const updateBooking = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const userId = req.user!.userId;

  const result = await BookingService.updateBooking(
    id,
    userId,
    req.body
  );

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Booking updated successfully",
    data: result,
  });
});

const updateBookingStatus = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const userId = req.user!.userId;

    const result = await BookingService.updateBookingStatus(
      id,
      userId,
      req.body
    );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Booking status updated successfully",
      data: result,
    });
  }
);

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const userId = req.user!.userId;

  const result = await BookingService.cancelBooking(id, userId);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
};