import { Role, UserStatus } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IUserFilterRequest } from "./user.interface";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters: IUserFilterRequest = {
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

  const result = await UserService.getAllUsers(filters);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const result = await UserService.getSingleUser(id);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const result = await UserService.updateUserProfile(id, req.body);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const result = await UserService.updateUserStatus(id, req.body);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const result = await UserService.deleteUser(id);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getSingleUser,
  updateUserProfile,
  updateUserStatus,
  deleteUser,
};