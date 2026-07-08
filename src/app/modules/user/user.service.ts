import { Prisma, Role, UserStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import AppError from "../../errors/AppError";
import {
  IUserFilterRequest,
  IUserResponse,
  IUserStatusUpdatePayload,
  IUserUpdatePayload,
} from "./user.interface";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  image: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const getAllUsers = async (
  filters: IUserFilterRequest
): Promise<IUserResponse[]> => {
  const { searchTerm, role, status } = filters;

  const users = await prisma.user.findMany({
    where: {
      AND: [
        searchTerm
          ? {
              OR: [
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
              ],
            }
          : {},
        role
          ? {
              role: role as Role,
            }
          : {},
        status
          ? {
              status: status as UserStatus,
            }
          : {},
      ],
    },
    select: userSelect,
  });

  return users;
};

const getSingleUser = async (userId: string): Promise<IUserResponse> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: userSelect,
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

const updateUserProfile = async (
  userId: string,
  payload: IUserUpdatePayload
): Promise<IUserResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
    select: userSelect,
  });

  return user;
};

const updateUserStatus = async (
  userId: string,
  payload: IUserStatusUpdatePayload
): Promise<IUserResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: payload.status,
    },
    select: userSelect,
  });

  return user;
};

const deleteUser = async (userId: string): Promise<IUserResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  const user = await prisma.user.delete({
    where: {
      id: userId,
    },
    select: userSelect,
  });

  return user;
};

export const UserService = {
  getAllUsers,
  getSingleUser,
  updateUserProfile,
  updateUserStatus,
  deleteUser,
};