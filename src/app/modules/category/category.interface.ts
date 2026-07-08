import { Category } from "@prisma/client";

export interface ICreateCategoryPayload {
  name: string;
  description?: string;
  icon?: string;
}

export interface IUpdateCategoryPayload {
  name?: string;
  description?: string;
  icon?: string;
}

export interface ICategoryFilterRequest {
  searchTerm?: string;
}

export type ICategoryResponse = Category;