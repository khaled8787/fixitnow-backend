import { Role, User, UserStatus } from "@prisma/client";

export interface IUserUpdatePayload {
  name?: string;
  phone?: string;
  image?: string;
}

export interface IUserStatusUpdatePayload {
  status: UserStatus;
}

export interface IUserFilterRequest {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
}

export type IUserResponse = Omit<User, "password">;