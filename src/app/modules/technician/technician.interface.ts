import { Prisma, TechnicianProfile } from "@prisma/client";

export interface ITechnicianProfilePayload {
  bio?: string;
  experience: number;
  hourlyRate: Prisma.Decimal | number | string;
  location: string;
  isAvailable: boolean;
}

export interface ITechnicianProfileUpdatePayload {
  bio?: string;
  experience?: number;
  hourlyRate?: Prisma.Decimal | number | string;
  location?: string;
  isAvailable?: boolean;
}

export interface ITechnicianFilterRequest {
  searchTerm?: string;
  location?: string;
  isAvailable?: boolean;
}

export type ITechnicianResponse = TechnicianProfile;