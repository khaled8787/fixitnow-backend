import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import AppError from "../../errors/AppError";
import { prisma } from "../../utils/prisma";

import {
  IReviewFilterRequest,
  IReviewPayload,
  IReviewUpdatePayload,
} from "./review.interface";

/**
 * ============================================================
 * CREATE REVIEW
 * ============================================================
 */

const createReview = async (
  customerId: string,
  payload: IReviewPayload
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },
    include: {
      service: true,
      technician: {
        include: {
          user: true,
        },
      },
      customer: true,
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

  if (booking.status !== "COMPLETED") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You can only review completed bookings"
    );
  }

  if (booking.review) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You have already reviewed this booking"
    );
  }

  if (
    payload.rating < 1 ||
    payload.rating > 5
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Rating must be between 1 and 5"
    );
  }

  const review = await prisma.$transaction(
    async (tx) => {
      const createdReview =
        await tx.review.create({
          data: {
            bookingId: booking.id,
            customerId,
            technicianId: booking.technicianId,
            rating: payload.rating,
            comment:
              payload.comment?.trim() || null,
          },

          include: {
            customer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },

            technician: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },

            booking: {
              include: {
                service: true,
              },
            },
          },
        });

      const aggregate =
        await tx.review.aggregate({
          where: {
            technicianId:
              booking.technicianId,
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
          averageRating:
            aggregate._avg.rating ?? 0,

          totalReviews:
            aggregate._count.rating,
        },
      });

      return createdReview;
    }
  );

  return review;
};

/**
 * ============================================================
 * GET ALL REVIEWS
 * ============================================================
 */

const getAllReviews = async (
  filters: IReviewFilterRequest
) => {
  const {
    technicianId,
    bookingId,
    rating,
  } = filters;

  const where: Prisma.ReviewWhereInput = {};

  if (technicianId) {
    where.technicianId = technicianId;
  }

  if (bookingId) {
    where.bookingId = bookingId;
  }

  if (
    rating !== undefined &&
    !Number.isNaN(rating)
  ) {
    where.rating = rating;
  }

  const reviews =
    await prisma.review.findMany({
      where,

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        technician: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },

        booking: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return reviews;
};

/**
 * ============================================================
 * GET SINGLE REVIEW
 * ============================================================
 */

const getSingleReview = async (
  id: string
) => {
  const review =
    await prisma.review.findUnique({
      where: {
        id,
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        technician: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },

        booking: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
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

/**
 * ============================================================
 * UPDATE REVIEW
 * ============================================================
 */

const updateReview = async (
  id: string,
  customerId: string,
  payload: IReviewUpdatePayload
) => {
  const review =
    await prisma.review.findUnique({
      where: {
        id,
      },
    });

  if (!review) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Review not found"
    );
  }

  if (
    review.customerId !== customerId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this review"
    );
  }

  if (
    payload.rating !== undefined &&
    (payload.rating < 1 ||
      payload.rating > 5)
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Rating must be between 1 and 5"
    );
  }

  const updatedReview =
    await prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.review.update({
            where: {
              id,
            },

            data: {
              ...(payload.rating !==
              undefined
                ? {
                    rating:
                      payload.rating,
                  }
                : {}),

              ...(payload.comment !==
              undefined
                ? {
                    comment:
                      payload.comment.trim() ||
                      null,
                  }
                : {}),
            },

            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },

              technician: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },

              booking: {
                include: {
                  service: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          });

        const aggregate =
          await tx.review.aggregate({
            where: {
              technicianId:
                review.technicianId,
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
            id: review.technicianId,
          },

          data: {
            averageRating:
              aggregate._avg.rating ?? 0,

            totalReviews:
              aggregate._count.rating,
          },
        });

        return updated;
      }
    );

  return updatedReview;
};

/**
 * ============================================================
 * DELETE REVIEW
 * ============================================================
 */

const deleteReview = async (
  id: string,
  customerId: string
) => {
  const review =
    await prisma.review.findUnique({
      where: {
        id,
      },
    });

  if (!review) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Review not found"
    );
  }

  if (
    review.customerId !== customerId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this review"
    );
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.review.delete({
        where: {
          id,
        },
      });

      const aggregate =
        await tx.review.aggregate({
          where: {
            technicianId:
              review.technicianId,
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
          id: review.technicianId,
        },

        data: {
          averageRating:
            aggregate._avg.rating ?? 0,

          totalReviews:
            aggregate._count.rating,
        },
      });
    }
  );

  return {
    id,
    deleted: true,
  };
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};