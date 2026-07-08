import { Role, User } from "@prisma/client";

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  image?: string;
  role: Role;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface IAuthResponse {
  accessToken: string;
  user: Omit<User, "password">;
}