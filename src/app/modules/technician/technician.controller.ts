import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { TechnicianService } from "./technician.service";
import { ITechnicianFilterRequest } from "./technician.interface";

const createTechnicianProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await TechnicianService.createTechnicianProfile(
        userId,
        req.body
      );

    sendResponse(res, StatusCodes.CREATED, {
      success: true,
      message: "Technician profile created successfully",
      data: result,
    });
  }
);

const getAllTechnicians = catchAsync(
  async (req: Request, res: Response) => {
    const filters: ITechnicianFilterRequest = {
      searchTerm:
        typeof req.query.searchTerm === "string"
          ? req.query.searchTerm
          : undefined,

      location:
        typeof req.query.location === "string"
          ? req.query.location
          : undefined,

      isAvailable:
        typeof req.query.isAvailable === "string"
          ? req.query.isAvailable === "true"
          : undefined,
    };

    const result =
      await TechnicianService.getAllTechnicians(filters);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Technicians retrieved successfully",
      data: result,
    });
  }
);

const getSingleTechnician = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result =
      await TechnicianService.getSingleTechnician(id);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Technician retrieved successfully",
      data: result,
    });
  }
);

const updateTechnicianProfile = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const userId = req.user!.userId;

    const result =
      await TechnicianService.updateTechnicianProfile(
        id,
        userId,
        req.body
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Technician profile updated successfully",
      data: result,
    });
  }
);

const deleteTechnicianProfile = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const userId = req.user!.userId;

    const result =
      await TechnicianService.deleteTechnicianProfile(
        id,
        userId
      );

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Technician profile deleted successfully",
      data: result,
    });
  }
);

export const TechnicianController = {
  createTechnicianProfile,
  getAllTechnicians,
  getSingleTechnician,
  updateTechnicianProfile,
  deleteTechnicianProfile,
};