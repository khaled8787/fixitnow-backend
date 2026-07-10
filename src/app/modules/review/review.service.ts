import { BookingStatus, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import AppError from "../../errors/AppError";
import {prisma} from "../../utils/prisma";
import { IReviewPayload, IReviewFilterRequest } from "./review.interface";

const createReview = async (
  customerId: string,
  payload: IReviewPayload
) => {
  const customer = await prisma.user.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Customer not found"
    );
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },
    include: {
      review: true,
    },
  });

  if (!booking) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Booking not found"
    );
  }

  if (booking.customerId !== customerId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to review this booking"
    );
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only completed bookings can be reviewed"
    );
  }

  if (booking.review) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Review already submitted for this booking"
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        bookingId: payload.bookingId,
        customerId,
        technicianId: booking.technicianId,
        rating: payload.rating,
        comment: payload.comment?.trim(),
      },
    });

    const aggregated = await tx.review.aggregate({
      where: {
        technicianId: booking.technicianId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    await tx.technicianProfile.update({
      where: {
        id: booking.technicianId,
      },
      data: {
        averageRating: aggregated._avg.rating ?? 0,
        totalReviews: aggregated._count.rating,
      },
    });

    return tx.review.findUnique({
      where: {
        id: review.id,
      },
      include: {
        customer: true,
        technician: {
          include: {
            user: true,
          },
        },
        booking: true,
      },
    });
  });

  return result;
};


const getAllReviews = async (
  filters: IReviewFilterRequest
) => {
  const where: Prisma.ReviewWhereInput = {};

  if (filters.technicianId) {
    where.technicianId = filters.technicianId;
  }

  if (filters.bookingId) {
    where.bookingId = filters.bookingId;
  }

  if (typeof filters.rating === "number") {
    where.rating = filters.rating;
  }

  const reviews = await prisma.review.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: true,
      technician: {
        include: {
          user: true,
        },
      },
      booking: {
        include: {
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return reviews;
};


const getSingleReview = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      technician: {
        include: {
          user: true,
        },
      },
      booking: {
        include: {
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!review) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Review not found"
    );
  }

  return review;
};