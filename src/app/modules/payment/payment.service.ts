import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import AppError from "../../errors/AppError";
import {prisma} from "../../utils/prisma";
import { IPaymentPayload, IPaymentFilterRequest, IPaymentStatusPayload } from "./payment.interface";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: Stripe.API_VERSION,
});

const createPayment = async (
  userId: string,
  payload: IPaymentPayload
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found"
    );
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },
    include: {
      customer: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Booking not found"
    );
  }

  if (booking.customerId !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to pay for this booking"
    );
  }

  if (booking.payment) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Payment already exists for this booking."
    );
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Booking is not ready for payment."
    );
  }

  const amount = new Prisma.Decimal(booking.servicePrice);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount.toNumber() * 100),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  const transactionId = randomUUID();

  const payment = await prisma.$transaction(async (tx) => {
    return tx.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        transactionId,
        amount,
        provider: payload.provider,
        status: PaymentStatus.PENDING,
      },
    });
  });

  return {
    payment,
    client_secret: paymentIntent.client_secret,
  };
};


const getAllPayments = async (
  filters: IPaymentFilterRequest
) => {
  const where: Prisma.PaymentWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.provider) {
    where.provider = filters.provider;
  }

  if (filters.bookingId) {
    where.bookingId = filters.bookingId;
  }

  if (filters.transactionId) {
    where.transactionId = filters.transactionId;
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      booking: {
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
      },
    },
  });

  return payments;
};


const getSinglePayment = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      booking: {
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
      },
    },
  });

  if (!payment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Payment not found"
    );
  }

  return payment;
};


const updatePaymentStatus = async (
  id: string,
  payload: IPaymentStatusPayload
) => {
  const existingPayment = await prisma.payment.findUnique({
    where: {
      id,
    },
    include: {
      booking: true,
    },
  });

  if (!existingPayment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Payment not found"
    );
  }

  if (existingPayment.status === PaymentStatus.COMPLETED) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Payment has already been completed"
    );
  }

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: {
        id,
      },
      data: {
        status: payload.status,
        paidAt:
          payload.status === PaymentStatus.COMPLETED
            ? new Date()
            : existingPayment.paidAt,
      },
    });

    if (payload.status === PaymentStatus.COMPLETED) {
      await tx.booking.update({
        where: {
          id: existingPayment.bookingId,
        },
        data: {
          status: BookingStatus.PAID,
        },
      });
    }

    return tx.payment.findUnique({
      where: {
        id: payment.id,
      },
      include: {
        user: true,
        booking: {
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
        },
      },
    });
  });

  return updatedPayment;
};


export const PaymentService = {
  createPayment,
  getAllPayments,
  getSinglePayment,
  updatePaymentStatus,
};