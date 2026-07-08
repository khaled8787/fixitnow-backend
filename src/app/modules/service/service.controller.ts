import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { IServiceFilterRequest } from "./service.interface";
import { ServiceService } from "./service.service";

const createService = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await ServiceService.createService(userId, req.body);

  sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: "Service created successfully",
    data: result,
  });
});

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const filters: IServiceFilterRequest = {
    searchTerm:
      typeof req.query.searchTerm === "string"
        ? req.query.searchTerm
        : undefined,

    categoryId:
      typeof req.query.categoryId === "string"
        ? req.query.categoryId
        : undefined,

    minPrice:
      typeof req.query.minPrice === "string"
        ? Number(req.query.minPrice)
        : undefined,

    maxPrice:
      typeof req.query.maxPrice === "string"
        ? Number(req.query.maxPrice)
        : undefined,

    isActive:
      typeof req.query.isActive === "string"
        ? req.query.isActive === "true"
        : undefined,
  };

  const result = await ServiceService.getAllServices(filters);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Services retrieved successfully",
    data: result,
  });
});

const getSingleService = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await ServiceService.getSingleService(id);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Service retrieved successfully",
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const userId = req.user!.userId;

  const result = await ServiceService.updateService(
    id,
    userId,
    req.body
  );

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Service updated successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const userId = req.user!.userId;

  const result = await ServiceService.deleteService(id, userId);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Service deleted successfully",
    data: result,
  });
});

export const ServiceController = {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
};