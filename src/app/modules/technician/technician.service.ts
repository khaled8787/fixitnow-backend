import { Prisma, Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import AppError from "../../errors/AppError";
import { prisma } from "../../utils/prisma";
import {
  ITechnicianFilterRequest,
  ITechnicianProfilePayload,
  ITechnicianProfileUpdatePayload,
} from "./technician.interface";

const createTechnicianProfile = async (
  userId: string,
  payload: ITechnicianProfilePayload
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.role !== Role.TECHNICIAN) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User is not a technician"
    );
  }

  const existingProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (existingProfile) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Technician profile already exists"
    );
  }

  const technicianProfile = await prisma.technicianProfile.create({
    data: {
      userId,
      bio: payload.bio?.trim() || null,
      experience: payload.experience,
      hourlyRate: new Prisma.Decimal(payload.hourlyRate),
      location: payload.location.trim(),
      ...(payload.isAvailable !== undefined && {
        isAvailable: payload.isAvailable,
      }),
    },
    include: {
      user: true,
    },
  });

  return technicianProfile;
};

const getAllTechnicians = async (
  filters: ITechnicianFilterRequest
) => {
  const where: Prisma.TechnicianProfileWhereInput = {};

  if (filters.searchTerm) {
    where.OR = [
      {
        bio: {
          contains: filters.searchTerm,
          mode: "insensitive",
        },
      },
      {
        location: {
          contains: filters.searchTerm,
          mode: "insensitive",
        },
      },
      {
        user: {
          name: {
            contains: filters.searchTerm,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          email: {
            contains: filters.searchTerm,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (filters.location) {
    where.location = {
      contains: filters.location,
      mode: "insensitive",
    };
  }

  if (filters.isAvailable !== undefined) {
    where.isAvailable = filters.isAvailable;
  }

  return prisma.technicianProfile.findMany({
    where,
    include: {
      user: true,
      services: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getSingleTechnician = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      services: true,
    },
  });

  if (!technician) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician profile not found"
    );
  }

  return technician;
};

const updateTechnicianProfile = async (
  id: string,
  userId: string,
  payload: ITechnicianProfileUpdatePayload
) => {
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: {
      id,
    },
  });

  if (!existingProfile) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician profile not found"
    );
  }

  if (existingProfile.userId !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this profile"
    );
  }

  const updatedProfile = await prisma.technicianProfile.update({
    where: {
      id,
    },
    data: {
      ...(payload.bio !== undefined && {
        bio: payload.bio.trim(),
      }),
      ...(payload.experience !== undefined && {
        experience: payload.experience,
      }),
      ...(payload.hourlyRate !== undefined && {
        hourlyRate: new Prisma.Decimal(payload.hourlyRate),
      }),
      ...(payload.location !== undefined && {
        location: payload.location.trim(),
      }),
      ...(payload.isAvailable !== undefined && {
        isAvailable: payload.isAvailable,
      }),
    },
    include: {
      user: true,
    },
  });

  return updatedProfile;
};

const deleteTechnicianProfile = async (
  id: string,
  userId: string
) => {
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });

  if (!existingProfile) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician profile not found"
    );
  }

  if (existingProfile.userId !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this profile"
    );
  }

  return prisma.technicianProfile.delete({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
};

export const TechnicianService = {
  createTechnicianProfile,
  getAllTechnicians,
  getSingleTechnician,
  updateTechnicianProfile,
  deleteTechnicianProfile,
};