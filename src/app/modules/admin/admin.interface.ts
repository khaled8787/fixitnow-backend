import { Role, UserStatus, BookingStatus } from "@prisma/client";

export interface IUpdateUserStatusPayload {
  status: UserStatus;
}

export interface IAdminUserFilterRequest {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
}

export interface IAdminBookingFilterRequest {
  status?: BookingStatus;
  technicianId?: string;
  customerId?: string;
  bookingDate?: string;
}

export interface IAdminCategoryPayload {
  name: string;
  description?: string;
}

export interface IAdminCategoryUpdatePayload {
  name?: string;
  description?: string;
}