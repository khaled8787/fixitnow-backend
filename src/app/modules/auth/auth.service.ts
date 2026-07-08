import { Role, User, UserStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import { IRegisterPayload, ILoginPayload, IAuthResponse } from "./auth.interface";

const registerUser = async (payload: IRegisterPayload): Promise<IAuthResponse> => {
  const normalizedEmail = payload.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(payload.password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: payload.name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: payload.phone ?? null,
        image: payload.image ?? null,
        role: payload.role ?? Role.CUSTOMER,
      },
    });

    if (createdUser.role === Role.TECHNICIAN) {
      await tx.technicianProfile.create({
        data: {
          userId: createdUser.id,
          hourlyRate: 0,
          location: "",
        },
      });
    }

    return createdUser;
  });

  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, user: userWithoutPassword };
};

const loginUser = async (payload: ILoginPayload): Promise<IAuthResponse> => {
  const normalizedEmail = payload.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await comparePassword(payload.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  if (user.status === UserStatus.BANNED) {
    throw new Error("User is banned");
  }

  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, user: userWithoutPassword };
};

const getMe = async (userId: string): Promise<Omit<User, "password">> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
};