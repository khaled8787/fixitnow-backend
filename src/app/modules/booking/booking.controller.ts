import {
  BookingStatus,
  Role,
} from "@prisma/client";
import {
  Request,
  Response,
} from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import {
  IBookingFilterRequest,
} from "./booking.interface";

import { BookingService } from "./booking.service";

/**
 * Create Booking
 */
const createBooking = catchAsync(
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.userId;

    const result =
      await BookingService.createBooking(
        userId,
        req.body
      );

    sendResponse(res, StatusCodes.CREATED, {
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  }
);

/**
 * Get Bookings
 *
 * ADMIN:
 *      Get all bookings
 *
 * TECHNICIAN:
 *      Get only technician's assigned bookings
 *
 * CUSTOMER:
 *      Get only customer's own bookings
 */
const getAllBookings = catchAsync(
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
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

    const user = req.user!;

    /**
     * TECHNICIAN
     */
    if (user.role === Role.TECHNICIAN) {
      const result =
        await BookingService.getTechnicianBookings(
          user.userId,
          filters
        );

      sendResponse(res, StatusCodes.OK, {
        success: true,
        message:
          "Technician bookings retrieved successfully",
        data: result,
      });

      return;
    }

    /**
     * CUSTOMER
     */
    if (user.role === Role.CUSTOMER) {
      const result =
        await BookingService.getCustomerBookings(
          user.userId,
          filters
        );

      sendResponse(res, StatusCodes.OK, {
        success: true,
        message:
          "Customer bookings retrieved successfully",
        data: result,
      });

      return;
    }

    /**
     * ADMIN
     */
    const result =
      await BookingService.getAllBookings(
        filters
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message:
        "Bookings retrieved successfully",
      data: result,
    });
  }
);

/**
 * Get Single Booking
 *
 * Authorization is handled inside service.
 */
const getSingleBooking = catchAsync(
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const user = req.user!;

    const result =
      await BookingService.getSingleBooking(
        id,
        user.userId,
        user.role
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message:
        "Booking retrieved successfully",
      data: result,
    });
  }
);

/**
 * Update Booking
 */
const updateBooking = catchAsync(
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const userId = req.user!.userId;

    const result =
      await BookingService.updateBooking(
        id,
        userId,
        req.body
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message:
        "Booking updated successfully",
      data: result,
    });
  }
);

/**
 * Update Booking Status
 */
const updateBookingStatus = catchAsync(
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const userId = req.user!.userId;

    const result =
      await BookingService.updateBookingStatus(
        id,
        userId,
        req.body
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message:
        "Booking status updated successfully",
      data: result,
    });
  }
);

/**
 * Cancel Booking
 */
const cancelBooking = catchAsync(
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const userId = req.user!.userId;

    const result =
      await BookingService.cancelBooking(
        id,
        userId
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message:
        "Booking cancelled successfully",
      data: result,
    });
  }
);

export const BookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
};