import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { prisma } from "../../utils/prisma";
import {
  ICategoryFilterRequest,
  ICategoryResponse,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from "./category.interface";

const createCategory = async (
  payload: ICreateCategoryPayload
): Promise<ICategoryResponse> => {
  const normalizedName = payload.name.trim();

  const existingCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Category already exists"
    );
  }

  const category = await prisma.category.create({
    data: {
      name: normalizedName,
      description: payload.description?.trim() || null,
    },
  });

  return category;
};

const getAllCategories = async (
  filters: ICategoryFilterRequest
): Promise<ICategoryResponse[]> => {
  const { searchTerm } = filters;

  const where: Prisma.CategoryWhereInput = searchTerm
    ? {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const categories = await prisma.category.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories;
};

const getSingleCategory = async (
  id: string
): Promise<ICategoryResponse> => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Category not found"
    );
  }

  return category;
};

const updateCategory = async (
  id: string,
  payload: IUpdateCategoryPayload
): Promise<ICategoryResponse> => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!existingCategory) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Category not found"
    );
  }

  const data: Prisma.CategoryUpdateInput = {};

  if (payload.name !== undefined) {
    const normalizedName = payload.name.trim();

    const duplicateCategory = await prisma.category.findFirst({
      where: {
        id: {
          not: id,
        },
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
      },
    });

    if (duplicateCategory) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Category already exists"
      );
    }

    data.name = normalizedName;
  }

  if (payload.description !== undefined) {
    data.description = payload.description.trim() || null;
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id,
    },
    data,
  });

  return updatedCategory;
};

const deleteCategory = async (
  id: string
): Promise<ICategoryResponse> => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!existingCategory) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Category not found"
    );
  }

  const deletedCategory = await prisma.category.delete({
    where: {
      id,
    },
  });

  return deletedCategory;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};