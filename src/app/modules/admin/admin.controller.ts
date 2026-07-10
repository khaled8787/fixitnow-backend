import { Request, Response } from "express";
import { Role, UserStatus, BookingStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";
import {
  IAdminBookingFilterRequest,
  IAdminUserFilterRequest,
} from "./admin.interface";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters: IAdminUserFilterRequest = {
    searchTerm:
      typeof req.query.searchTerm === "string"
        ? req.query.searchTerm
        : undefined,
    role:
      typeof req.query.role === "string"
        ? (req.query.role as Role)
        : undefined,
    status:
      typeof req.query.status === "string"
        ? (req.query.status as UserStatus)
        : undefined,
  };

  const result = await AdminService.getAllUsers(filters);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const result = await AdminService.updateUserStatus(id, req.body);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const filters: IAdminBookingFilterRequest = {
    status:
      typeof req.query.status === "string"
        ? (req.query.status as BookingStatus)
        : undefined,
    technicianId:
      typeof req.query.technicianId === "string"
        ? req.query.technicianId
        : undefined,
    customerId:
      typeof req.query.customerId === "string"
        ? req.query.customerId
        : undefined,
    bookingDate:
      typeof req.query.bookingDate === "string"
        ? req.query.bookingDate
        : undefined,
  };

  const result = await AdminService.getAllBookings(filters);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getAllCategories();

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createCategory(req.body);

  sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  getAllCategories,
  createCategory,
};