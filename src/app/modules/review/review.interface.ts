import { Review } from "@prisma/client";

export interface IReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface IReviewUpdatePayload {
  rating?: number;
  comment?: string;
}

export interface IReviewFilterRequest {
  technicianId?: string;
  bookingId?: string;
  rating?: number;
}

export type IReviewResponse = Review;