import {
  BookingStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";

import AppError from "../../errors/AppError";
import { prisma } from "../../utils/prisma";
import {
  IPaymentPayload,
  IPaymentFilterRequest,
  IPaymentStatusPayload,
} from "./payment.interface";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: Stripe.API_VERSION,
  }
);

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
      "Payment already exists for this booking"
    );
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Booking is not ready for payment"
    );
  }

  if (payload.provider !== "STRIPE") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only Stripe payments are currently supported"
    );
  }

  const amount = new Prisma.Decimal(
    booking.servicePrice
  );

  const transactionId = randomUUID();

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId,
      transactionId,
      amount,
      provider: payload.provider,
      status: PaymentStatus.PENDING,
    },
  });

  try {
    const paymentIntent =
      await stripe.paymentIntents.create({
        amount: Math.round(
          amount.toNumber() * 100
        ),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          paymentId: payment.id,
          bookingId: booking.id,
          transactionId,
        },
      });

    return {
      payment,
      client_secret:
        paymentIntent.client_secret,
      payment_intent_id:
        paymentIntent.id,
    };
  } catch (error) {
    await prisma.payment.delete({
      where: {
        id: payment.id,
      },
    });

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to initialize Stripe payment"
    );
  }
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
    where.transactionId =
      filters.transactionId;
  }

  const payments =
    await prisma.payment.findMany({
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

const getSinglePayment = async (
  id: string
) => {
  const payment =
    await prisma.payment.findUnique({
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
  const existingPayment =
    await prisma.payment.findUnique({
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

  if (
    existingPayment.status ===
    PaymentStatus.COMPLETED
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Payment has already been completed"
    );
  }

  const updatedPayment =
    await prisma.$transaction(async (tx) => {
      const payment =
        await tx.payment.update({
          where: {
            id,
          },
          data: {
            status: payload.status,
            paidAt:
              payload.status ===
              PaymentStatus.COMPLETED
                ? new Date()
                : existingPayment.paidAt,
          },
        });

      if (
        payload.status ===
        PaymentStatus.COMPLETED
      ) {
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

const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string
) => {
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Stripe webhook secret is not configured"
    );
  }

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
  } catch {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid Stripe webhook signature"
    );
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent =
        event.data.object as Stripe.PaymentIntent;

      const paymentId =
        paymentIntent.metadata?.paymentId;

      if (!paymentId) {
        return {
          message:
            "Payment ID not found in Stripe metadata",
        };
      }

      const payment =
        await prisma.payment.findUnique({
          where: {
            id: paymentId,
          },
          include: {
            booking: true,
          },
        });

      if (!payment) {
        return {
          message: "Payment record not found",
        };
      }

      if (
        payment.status ===
        PaymentStatus.COMPLETED
      ) {
        return {
          message: "Payment already completed",
          paymentId,
        };
      }

      const expectedAmount = Math.round(
        new Prisma.Decimal(
          payment.amount
        ).toNumber() * 100
      );

      if (
        paymentIntent.amount !==
        expectedAmount
      ) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Stripe payment amount does not match booking amount"
        );
      }

      if (
        paymentIntent.currency !==
        "usd"
      ) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Unsupported payment currency"
        );
      }

      await prisma.$transaction(
        async (tx) => {
          await tx.payment.update({
            where: {
              id: payment.id,
            },
            data: {
              status:
                PaymentStatus.COMPLETED,
              paidAt: new Date(),
            },
          });

          await tx.booking.update({
            where: {
              id: payment.bookingId,
            },
            data: {
              status:
                BookingStatus.PAID,
            },
          });
        }
      );

      return {
        message:
          "Payment completed successfully",
        paymentId: payment.id,
        bookingId: payment.bookingId,
      };
    }

    case "payment_intent.payment_failed": {
      const paymentIntent =
        event.data.object as Stripe.PaymentIntent;

      const paymentId =
        paymentIntent.metadata?.paymentId;

      if (!paymentId) {
        return {
          message:
            "Payment ID not found in Stripe metadata",
        };
      }

      const payment =
        await prisma.payment.findUnique({
          where: {
            id: paymentId,
          },
        });

      if (!payment) {
        return {
          message: "Payment record not found",
        };
      }

      if (
        payment.status ===
        PaymentStatus.COMPLETED
      ) {
        return {
          message:
            "Completed payment cannot be marked as failed",
          paymentId,
        };
      }

      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      });

      return {
        message: "Payment marked as failed",
        paymentId,
      };
    }

    default:
      return {
        message:
          `Unhandled Stripe event: ${event.type}`,
      };
  }
};

export const PaymentService = {
  createPayment,
  getAllPayments,
  getSinglePayment,
  updatePaymentStatus,
  handleStripeWebhook,
};