import {
  BookingStatus,
  Prisma,
  Role,
} from "@prisma/client";

import { StatusCodes } from "http-status-codes";

import AppError from "../../errors/AppError";
import { prisma } from "../../utils/prisma";

import {
  IBookingFilterRequest,
  IBookingPayload,
  IBookingStatusPayload,
  IBookingUpdatePayload,
} from "./booking.interface";

/**
 * ============================================================
 * CREATE BOOKING
 * ============================================================
 */

const createBooking = async (
  customerId: string,
  payload: IBookingPayload
) => {
  const customer =
    await prisma.user.findUnique({
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

  if (customer.role !== Role.CUSTOMER) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only customers can create bookings"
    );
  }

  const technician =
    await prisma.technicianProfile.findUnique({
      where: {
        id: payload.technicianId,
      },
    });

  if (!technician) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician not found"
    );
  }

  if (!technician.isAvailable) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Technician is currently unavailable"
    );
  }

  const service =
    await prisma.service.findUnique({
      where: {
        id: payload.serviceId,
      },
    });

  if (!service) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Service not found"
    );
  }

  if (service.technicianId !== technician.id) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Selected service does not belong to the selected technician"
    );
  }

  const booking =
    await prisma.booking.create({
      data: {
        customerId,
        technicianId: technician.id,
        serviceId: service.id,
        servicePrice: new Prisma.Decimal(
          service.price
        ),
        bookingDate: new Date(
          payload.bookingDate
        ),
        bookingTime: new Date(
          payload.bookingTime
        ),
        address: payload.address.trim(),
        notes:
          payload.notes?.trim() || null,
        status: BookingStatus.REQUESTED,
      },

      include: {
        customer: true,

        technician: {
          include: {
            user: true,
          },
        },

        service: {
          include: {
            category: true,
          },
        },
      },
    });

  return booking;
};

/**
 * ============================================================
 * ADMIN - ALL BOOKINGS
 * ============================================================
 */

const getAllBookings = async (
  filters: IBookingFilterRequest
) => {
  const {
    searchTerm,
    status,
    bookingDate,
    technicianId,
  } = filters;

  const andConditions: Prisma.BookingWhereInput[] =
    [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          customer: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          customer: {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          service: {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          address: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (status) {
    andConditions.push({
      status,
    });
  }

  if (bookingDate) {
    const date = new Date(
      bookingDate
    );

    if (!Number.isNaN(date.getTime())) {
      const nextDate = new Date(date);

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      andConditions.push({
        bookingDate: {
          gte: date,
          lt: nextDate,
        },
      });
    }
  }

  if (technicianId) {
    andConditions.push({
      technicianId,
    });
  }

  const where: Prisma.BookingWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  return prisma.booking.findMany({
    where,

    include: {
      customer: true,

      technician: {
        include: {
          user: true,
        },
      },

      service: {
        include: {
          category: true,
        },
      },

      payment: true,
      review: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ============================================================
 * CUSTOMER - OWN BOOKINGS ONLY
 * ============================================================
 */

const getCustomerBookings = async (
  customerId: string,
  filters: IBookingFilterRequest
) => {
  const {
    searchTerm,
    status,
    bookingDate,
  } = filters;

  const andConditions: Prisma.BookingWhereInput[] =
    [
      {
        customerId,
      },
    ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          service: {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          address: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (status) {
    andConditions.push({
      status,
    });
  }

  if (bookingDate) {
    const date = new Date(
      bookingDate
    );

    if (!Number.isNaN(date.getTime())) {
      const nextDate = new Date(date);

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      andConditions.push({
        bookingDate: {
          gte: date,
          lt: nextDate,
        },
      });
    }
  }

  return prisma.booking.findMany({
    where: {
      AND: andConditions,
    },

    include: {
      customer: true,

      technician: {
        include: {
          user: true,
        },
      },

      service: {
        include: {
          category: true,
        },
      },

      payment: true,
      review: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ============================================================
 * TECHNICIAN - OWN BOOKINGS ONLY
 * ============================================================
 */

const getTechnicianBookings = async (
  technicianUserId: string,
  filters: IBookingFilterRequest
) => {
  const technician =
    await prisma.technicianProfile.findUnique({
      where: {
        userId: technicianUserId,
      },
    });

  if (!technician) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician profile not found"
    );
  }

  const {
    searchTerm,
    status,
    bookingDate,
  } = filters;

  const andConditions: Prisma.BookingWhereInput[] =
    [
      {
        technicianId: technician.id,
      },
    ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          customer: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          customer: {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          service: {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          address: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (status) {
    andConditions.push({
      status,
    });
  }

  if (bookingDate) {
    const date = new Date(
      bookingDate
    );

    if (!Number.isNaN(date.getTime())) {
      const nextDate = new Date(date);

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      andConditions.push({
        bookingDate: {
          gte: date,
          lt: nextDate,
        },
      });
    }
  }

  return prisma.booking.findMany({
    where: {
      AND: andConditions,
    },

    include: {
      customer: true,

      technician: {
        include: {
          user: true,
        },
      },

      service: {
        include: {
          category: true,
        },
      },

      payment: true,
      review: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ============================================================
 * SINGLE BOOKING
 * ============================================================
 *
 * SECURITY:
 *
 * ADMIN -> can see any booking
 * CUSTOMER -> only own booking
 * TECHNICIAN -> only assigned booking
 */

const getSingleBooking = async (
  id: string,
  userId: string,
  role: Role
) => {
  const booking =
    await prisma.booking.findUnique({
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

        service: {
          include: {
            category: true,
          },
        },

        payment: true,
        review: true,
      },
    });

  if (!booking) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Booking not found"
    );
  }

  /**
   * ADMIN can access everything
   */
  if (role === Role.ADMIN) {
    return booking;
  }

  /**
   * CUSTOMER can access own booking only
   */
  if (
    role === Role.CUSTOMER &&
    booking.customerId !== userId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to access this booking"
    );
  }

  /**
   * TECHNICIAN can access assigned booking only
   */
  if (role === Role.TECHNICIAN) {
    const technician =
      await prisma.technicianProfile.findUnique({
        where: {
          userId,
        },
      });

    if (
      !technician ||
      booking.technicianId !== technician.id
    ) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You are not authorized to access this booking"
      );
    }
  }

  return booking;
};

/**
 * ============================================================
 * CUSTOMER - UPDATE
 * ============================================================
 */

const updateBooking = async (
  id: string,
  customerId: string,
  payload: IBookingUpdatePayload
) => {
  const booking =
    await prisma.booking.findUnique({
      where: {
        id,
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
      "You are not authorized to update this booking"
    );
  }

  if (
    booking.status !==
    BookingStatus.REQUESTED
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Booking cannot be updated after it has been accepted"
    );
  }

  const updateData: Prisma.BookingUpdateInput =
    {};

  if (payload.bookingDate) {
    updateData.bookingDate =
      new Date(payload.bookingDate);
  }

  if (payload.bookingTime) {
    updateData.bookingTime =
      new Date(payload.bookingTime);
  }

  if (payload.address !== undefined) {
    updateData.address =
      payload.address.trim();
  }

  if (payload.notes !== undefined) {
    updateData.notes =
      payload.notes?.trim() || null;
  }

  return prisma.booking.update({
    where: {
      id,
    },

    data: updateData,

    include: {
      customer: true,

      technician: {
        include: {
          user: true,
        },
      },

      service: {
        include: {
          category: true,
        },
      },
    },
  });
};

/**
 * ============================================================
 * TECHNICIAN - STATUS UPDATE
 * ============================================================
 */

const updateBookingStatus = async (
  id: string,
  technicianUserId: string,
  payload: IBookingStatusPayload
) => {
  const technician =
    await prisma.technicianProfile.findUnique({
      where: {
        userId: technicianUserId,
      },
    });

  if (!technician) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Technician profile not found"
    );
  }

  const booking =
    await prisma.booking.findUnique({
      where: {
        id,
      },
    });

  if (!booking) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Booking not found"
    );
  }

  if (
    booking.technicianId !==
    technician.id
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this booking status"
    );
  }

  const validTransitions: Record<
    BookingStatus,
    BookingStatus[]
  > = {
    [BookingStatus.REQUESTED]: [
      BookingStatus.ACCEPTED,
      BookingStatus.DECLINED,
    ],

    [BookingStatus.ACCEPTED]: [
      BookingStatus.PAID,
    ],

    [BookingStatus.PAID]: [
      BookingStatus.IN_PROGRESS,
    ],

    [BookingStatus.IN_PROGRESS]: [
      BookingStatus.COMPLETED,
    ],

    [BookingStatus.DECLINED]: [],

    [BookingStatus.COMPLETED]: [],

    [BookingStatus.CANCELLED]: [],
  };

  const allowedStatuses =
    validTransitions[booking.status] ?? [];

  if (
    !allowedStatuses.includes(
      payload.status
    )
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid booking status transition"
    );
  }

  return prisma.booking.update({
    where: {
      id,
    },

    data: {
      status: payload.status,
    },

    include: {
      customer: true,

      technician: {
        include: {
          user: true,
        },
      },

      service: {
        include: {
          category: true,
        },
      },
    },
  });
};

/**
 * ============================================================
 * CUSTOMER - CANCEL
 * ============================================================
 */

const cancelBooking = async (
  id: string,
  customerId: string
) => {
  const booking =
    await prisma.booking.findUnique({
      where: {
        id,
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
      "You are not authorized to cancel this booking"
    );
  }

  if (
    booking.status ===
    BookingStatus.CANCELLED
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Booking is already cancelled"
    );
  }

  if (
    booking.status === BookingStatus.PAID ||
    booking.status ===
      BookingStatus.IN_PROGRESS ||
    booking.status ===
      BookingStatus.COMPLETED
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This booking can no longer be cancelled"
    );
  }

  return prisma.booking.update({
    where: {
      id,
    },

    data: {
      status: BookingStatus.CANCELLED,
    },

    include: {
      customer: true,

      technician: {
        include: {
          user: true,
        },
      },

      service: {
        include: {
          category: true,
        },
      },
    },
  });
};

/**
 * ============================================================
 * ADMIN - DELETE BOOKING
 * ============================================================
 */

const deleteBooking = async (
  id: string
) => {
  const booking =
    await prisma.booking.findUnique({
      where: {
        id,
      },

      include: {
        payment: true,
        review: true,
      },
    });

  if (!booking) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Booking not found"
    );
  }

  /**
   * Prevent deleting paid bookings accidentally.
   *
   * If you want admin to be able to delete
   * paid bookings too, remove this block.
   */
  if (
    booking.payment &&
    booking.payment.status ===
      "COMPLETED"
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Completed payment booking cannot be deleted"
    );
  }

  /**
   * Delete related records first if
   * your Prisma schema does not use Cascade.
   */

  await prisma.$transaction(
    async (tx) => {
      if (booking.review) {
        await tx.review.delete({
          where: {
            id: booking.review.id,
          },
        });
      }

      if (booking.payment) {
        await tx.payment.delete({
          where: {
            id: booking.payment.id,
          },
        });
      }

      await tx.booking.delete({
        where: {
          id,
        },
      });
    }
  );

  return {
    id,
    deleted: true,
  };
};

export const BookingService = {
  createBooking,
  getAllBookings,
  getCustomerBookings,
  getTechnicianBookings,
  getSingleBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
};