import {
  BookingStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { StatusCodes } from "http-status-codes";

import AppError from "../../errors/AppError";
import { prisma } from "../../utils/prisma";

import {
  IReviewPayload,
  IReviewFilterRequest,
  IReviewUpdatePayload,
} from "./review.interface";

/* ============================================================
   CREATE REVIEW
============================================================ */

const createReview = async (
  customerId: string,
  payload: IReviewPayload,
) => {
  /* ----------------------------------------------------------
     CHECK CUSTOMER
  ---------------------------------------------------------- */

  const customer = await prisma.user.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Customer not found",
    );
  }

  /* ----------------------------------------------------------
     GET BOOKING
  ---------------------------------------------------------- */

  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },

    include: {
      review: true,

      payment: true,

      service: true,

      technician: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!booking) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Booking not found",
    );
  }

  /* ----------------------------------------------------------
     CUSTOMER OWNERSHIP
  ---------------------------------------------------------- */

  if (booking.customerId !== customerId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to review this booking",
    );
  }

  /* ----------------------------------------------------------
     PAYMENT CHECK
     
     Review is allowed when:
     
     1. Booking status is PAID
     
     OR
     
     2. Related Payment status is COMPLETED
     
     COMPLETED booking status is NOT required.
  ---------------------------------------------------------- */

  const isBookingPaid =
    booking.status === BookingStatus.PAID;

  const isPaymentCompleted =
    booking.payment?.status ===
    PaymentStatus.COMPLETED;

  if (
    !isBookingPaid &&
    !isPaymentCompleted
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only paid bookings can be reviewed",
    );
  }

  /* ----------------------------------------------------------
     PREVENT DUPLICATE REVIEW
  ---------------------------------------------------------- */

  if (booking.review) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Review already submitted for this booking",
    );
  }

  /* ----------------------------------------------------------
     CREATE REVIEW + UPDATE TECHNICIAN RATING
  ---------------------------------------------------------- */

  const result =
    await prisma.$transaction(async (tx) => {
      const review =
        await tx.review.create({
          data: {
            bookingId:
              payload.bookingId,

            customerId,

            technicianId:
              booking.technicianId,

            rating:
              payload.rating,

            comment:
              payload.comment?.trim() ||
              null,
          },
        });

      /* ------------------------------------------------------
         RECALCULATE TECHNICIAN RATING
      ------------------------------------------------------ */

      const aggregated =
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
            aggregated._avg.rating ?? 0,

          totalReviews:
            aggregated._count.rating,
        },
      });

      /* ------------------------------------------------------
         RETURN COMPLETE REVIEW
      ------------------------------------------------------ */

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

          booking: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },

              payment: true,
            },
          },
        },
      });
    });

  return result;
};

/* ============================================================
   GET ALL REVIEWS
============================================================ */

const getAllReviews = async (
  filters: IReviewFilterRequest,
) => {
  const where: Prisma.ReviewWhereInput = {};

  if (filters.technicianId) {
    where.technicianId =
      filters.technicianId;
  }

  if (filters.bookingId) {
    where.bookingId =
      filters.bookingId;
  }

  if (
    typeof filters.rating === "number"
  ) {
    where.rating =
      filters.rating;
  }

  const reviews =
    await prisma.review.findMany({
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

            payment: true,
          },
        },
      },
    });

  return reviews;
};

/* ============================================================
   GET SINGLE REVIEW
============================================================ */

const getSingleReview = async (
  id: string,
) => {
  const review =
    await prisma.review.findUnique({
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

            payment: true,
          },
        },
      },
    });

  if (!review) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Review not found",
    );
  }

  return review;
};

/* ============================================================
   UPDATE REVIEW
============================================================ */

const updateReview = async (
  id: string,
  customerId: string,
  payload: IReviewUpdatePayload,
) => {
  const review =
    await prisma.review.findUnique({
      where: {
        id,
      },

      include: {
        booking: {
          include: {
            payment: true,
          },
        },
      },
    });

  if (!review) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Review not found",
    );
  }

  /* ----------------------------------------------------------
     OWNERSHIP
  ---------------------------------------------------------- */

  if (
    review.customerId !== customerId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this review",
    );
  }

  /* ----------------------------------------------------------
     UPDATE + RECALCULATE RATING
  ---------------------------------------------------------- */

  const result =
    await prisma.$transaction(async (tx) => {
      const updatedReview =
        await tx.review.update({
          where: {
            id,
          },

          data: {
            ...(payload.rating !==
              undefined && {
              rating:
                payload.rating,
            }),

            ...(payload.comment !==
              undefined && {
              comment:
                payload.comment.trim() ||
                null,
            }),
          },
        });

      const aggregated =
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
            aggregated._avg.rating ?? 0,

          totalReviews:
            aggregated._count.rating,
        },
      });

      return tx.review.findUnique({
        where: {
          id: updatedReview.id,
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

              payment: true,
            },
          },
        },
      });
    });

  return result;
};

/* ============================================================
   DELETE REVIEW
============================================================ */

const deleteReview = async (
  id: string,
  customerId: string,
) => {
  const review =
    await prisma.review.findUnique({
      where: {
        id,
      },

      include: {
        booking: true,
      },
    });

  if (!review) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Review not found",
    );
  }

  /* ----------------------------------------------------------
     OWNERSHIP
  ---------------------------------------------------------- */

  if (
    review.customerId !== customerId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this review",
    );
  }

  /* ----------------------------------------------------------
     DELETE + RECALCULATE
  ---------------------------------------------------------- */

  const result =
    await prisma.$transaction(async (tx) => {
      const deletedReview =
        await tx.review.delete({
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

      const aggregated =
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
            aggregated._avg.rating ?? 0,

          totalReviews:
            aggregated._count.rating,
        },
      });

      return deletedReview;
    });

  return result;
};

/* ============================================================
   EXPORT
============================================================ */

export const ReviewService = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};