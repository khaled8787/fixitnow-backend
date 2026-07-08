import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import { ICategoryFilterRequest } from "./category.interface";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);

  sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const filters: ICategoryFilterRequest = {
    searchTerm:
      typeof req.query.searchTerm === "string"
        ? req.query.searchTerm
        : undefined,
  };

  const result = await CategoryService.getAllCategories(filters);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await CategoryService.getSingleCategory(id);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await CategoryService.updateCategory(id, req.body);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await CategoryService.deleteCategory(id);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};