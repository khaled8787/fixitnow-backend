import {
  Booking,
  BookingStatus,
  Prisma,
} from "@prisma/client";

export interface IBookingPayload {
  technicianId: string;
  serviceId: string;
  bookingDate: Date | string;
  bookingTime: Date | string;
  address: string;
  notes?: string;
}

export interface IBookingUpdatePayload {
  bookingDate?: Date | string;
  bookingTime?: Date | string;
  address?: string;
  notes?: string;
}

export interface IBookingStatusPayload {
  status: BookingStatus;
}

export interface IBookingFilterRequest {
  searchTerm?: string;
  status?: BookingStatus;
  bookingDate?: string;
  technicianId?: string;
}

export type IBookingResponse = Booking;

export type IBookingPrice = Prisma.Decimal;