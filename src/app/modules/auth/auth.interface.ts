import { Role, UserStatus } from "@prisma/client";

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  image?: string;
  role: Role;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthResponse {
  accessToken: string;
  user: IAuthUser;
}