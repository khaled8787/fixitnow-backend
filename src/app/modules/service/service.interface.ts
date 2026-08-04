import { Prisma, Service } from "@prisma/client";

export interface IServicePayload {
  categoryId: string;
  title: string;
  description: string;
  price: Prisma.Decimal | number | string;
  duration: number;
  image?: string;
}

export interface IServiceUpdatePayload {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: Prisma.Decimal | number | string;
  duration?: number;
  image?: string;
  isActive?: boolean;
}

export interface IServiceFilterRequest {
  searchTerm?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export type IServiceResponse = Service;