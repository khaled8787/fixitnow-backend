import { Prisma, Role, UserStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import {prisma} from "../../utils/prisma";
import AppError from "../../errors/AppError";
import { IAdminUserFilterRequest, IUpdateUserStatusPayload, IAdminBookingFilterRequest, IAdminCategoryPayload } from "./admin.interface";

const getAllUsers = async (
  filters: IAdminUserFilterRequest
) => {
  const { searchTerm, role, status } = filters;

  const where: Prisma.UserWhereInput = {};

  if (searchTerm) {
    where.OR = [
      {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  const users = await prisma.user.findMany({
    where,
    omit: {
      password: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};


const updateUserStatus = async (
  id: string,
  payload: IUpdateUserStatusPayload
) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.role === Role.ADMIN) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Admin account cannot be banned"
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};


const getAllBookings = async (
  filters: IAdminBookingFilterRequest
) => {
  const { status, technicianId, customerId, bookingDate } = filters;

  const where: Prisma.BookingWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (technicianId) {
    where.technicianId = technicianId;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (bookingDate) {
    const date = new Date(bookingDate);

    where.bookingDate = {
      gte: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ),
      lt: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      ),
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: true,
      technician: {
        include: {
          user: true,
        },
      },
      service: {
        include: {
          category: true,
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings;
};


const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      services: {
        include: {
          technician: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories;
};


const createCategory = async (
  payload: IAdminCategoryPayload
) => {
  const name = payload.name.trim();
  const description = payload.description?.trim();

  const existingCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Category already exists"
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  return category;
};


export const AdminService = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  getAllCategories,
  createCategory,
};