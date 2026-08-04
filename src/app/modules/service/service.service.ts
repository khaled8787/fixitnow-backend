import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../utils/prisma";
import AppError from "../../errors/AppError";
import {
  IServiceFilterRequest,
  IServicePayload,
  IServiceUpdatePayload,
} from "./service.interface";

const createService = async (
  technicianId: string,
  payload: IServicePayload
) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId: technicianId,
    },
  });

  if (!technician) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician profile not found"
    );
  }

  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Category not found"
    );
  }

  const service = await prisma.service.create({
    data: {
      technicianId: technician.id,
      categoryId: payload.categoryId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      price: new Prisma.Decimal(payload.price),
      duration: payload.duration,

      ...(payload.image && {
        image: payload.image.trim(),
      }),
    },

    include: {
      category: true,
      technician: true,
    },
  });

  return service;
};

const getAllServices = async (
  filters: IServiceFilterRequest
) => {
  const where: Prisma.ServiceWhereInput = {};

  if (filters.searchTerm) {
    where.OR = [
      {
        title: {
          contains: filters.searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: filters.searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }

  if (
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined
  ) {
    where.price = {};

    if (filters.minPrice !== undefined) {
      where.price.gte = new Prisma.Decimal(
        filters.minPrice
      );
    }

    if (filters.maxPrice !== undefined) {
      where.price.lte = new Prisma.Decimal(
        filters.maxPrice
      );
    }
  }

  return prisma.service.findMany({
    where,

    include: {
      category: true,
      technician: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getSingleService = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: {
      id,
    },

    include: {
      category: true,
      technician: true,
    },
  });

  if (!service) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Service not found"
    );
  }

  return service;
};

const updateService = async (
  id: string,
  technicianId: string,
  payload: IServiceUpdatePayload
) => {
  const technician =
    await prisma.technicianProfile.findUnique({
      where: {
        userId: technicianId,
      },
    });

  if (!technician) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician profile not found"
    );
  }

  const existingService =
    await prisma.service.findUnique({
      where: {
        id,
      },
    });

  if (!existingService) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Service not found"
    );
  }

  if (
    existingService.technicianId !== technician.id
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this service"
    );
  }

  if (payload.categoryId) {
    const category =
      await prisma.category.findUnique({
        where: {
          id: payload.categoryId,
        },
      });

    if (!category) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "Category not found"
      );
    }
  }

  const updatedService =
    await prisma.service.update({
      where: {
        id,
      },

      data: {
        ...(payload.categoryId && {
          categoryId: payload.categoryId,
        }),

        ...(payload.title && {
          title: payload.title.trim(),
        }),

        ...(payload.description && {
          description: payload.description.trim(),
        }),

        ...(payload.price !== undefined && {
          price: new Prisma.Decimal(payload.price),
        }),

        ...(payload.duration !== undefined && {
          duration: payload.duration,
        }),

        ...(payload.image !== undefined && {
          image: payload.image
            ? payload.image.trim()
            : null,
        }),

        ...(payload.isActive !== undefined && {
          isActive: payload.isActive,
        }),
      },

      include: {
        category: true,
        technician: true,
      },
    });

  return updatedService;
};

const deleteService = async (
  id: string,
  technicianId: string
) => {
  const technician =
    await prisma.technicianProfile.findUnique({
      where: {
        userId: technicianId,
      },
    });

  if (!technician) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician profile not found"
    );
  }

  const existingService =
    await prisma.service.findUnique({
      where: {
        id,
      },
    });

  if (!existingService) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Service not found"
    );
  }

  if (
    existingService.technicianId !== technician.id
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this service"
    );
  }

  return prisma.service.delete({
    where: {
      id,
    },

    include: {
      category: true,
      technician: true,
    },
  });
};

export const ServiceService = {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
};