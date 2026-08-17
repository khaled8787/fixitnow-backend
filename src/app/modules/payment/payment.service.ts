import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  Role,
} from "@prisma/client";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";

import AppError from "../../errors/AppError";
import { prisma } from "../../utils/prisma";

import {
  IPaymentFilterRequest,
  IPaymentPayload,
  IPaymentStatusPayload,
} from "./payment.interface";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: Stripe.API_VERSION,
  }
);

/**
 * ============================================================
 * CREATE PAYMENT
 * ============================================================
 */

const createPayment = async (
  userId: string,
  payload: IPaymentPayload
) => {
  /**
   * Verify customer
   */
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

  if (user.role !== Role.CUSTOMER) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Only customers can make payments"
    );
  }

  /**
   * Find booking
   */
  const booking =
    await prisma.booking.findUnique({
      where: {
        id: payload.bookingId,
      },
      include: {
        customer: true,
        payment: true,
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

  if (!booking) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Booking not found"
    );
  }

  /**
   * Ownership check
   */
  if (booking.customerId !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to pay for this booking"
    );
  }

  /**
   * Payment can only happen after technician accepts
   */
  if (
    booking.status !==
    BookingStatus.ACCEPTED
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Booking must be accepted by technician before payment"
    );
  }

  /**
   * Prevent duplicate completed payment
   */
  if (booking.payment) {
    if (
      booking.payment.status ===
      PaymentStatus.COMPLETED
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "This booking has already been paid"
      );
    }

    /**
     * Remove stale pending/failed payment
     * so a fresh PaymentIntent can be created.
     */
    if (
      booking.payment.status ===
        PaymentStatus.PENDING ||
      booking.payment.status ===
        PaymentStatus.FAILED
    ) {
      await prisma.payment.delete({
        where: {
          id: booking.payment.id,
        },
      });
    }
  }

  /**
   * Provider validation
   */
  if (payload.provider !== "STRIPE") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only Stripe payments are currently supported"
    );
  }

  /**
   * Validate amount
   */
  const amount = new Prisma.Decimal(
    booking.servicePrice
  );

  if (amount.lessThanOrEqualTo(0)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid booking amount"
    );
  }

  /**
   * Transaction ID
   */
  const transactionId = randomUUID();

  /**
   * Create local payment
   */
  const payment =
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        transactionId,
        amount,
        provider: "STRIPE",
        status: PaymentStatus.PENDING,
      },
    });

  try {
    /**
     * Stripe amount must be smallest currency unit.
     *
     * Example:
     * $50.00 => 5000 cents
     */
    const stripeAmount =
      Math.round(
        amount.toNumber() * 100
      );

    /**
     * Create PaymentIntent
     */
    const paymentIntent =
      await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: "usd",

        automatic_payment_methods: {
          enabled: true,
        },

        metadata: {
          paymentId: payment.id,
          bookingId: booking.id,
          customerId: userId,
          transactionId,
        },
      });

    /**
     * Save Stripe PaymentIntent ID
     *
     * This requires your Payment model
     * to have stripePaymentIntentId.
     */
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        stripePaymentIntentId:
          paymentIntent.id,
      },
    });

    const updatedPayment =
      await prisma.payment.findUnique({
        where: {
          id: payment.id,
        },
      });

    return {
      payment: updatedPayment,

      client_secret:
        paymentIntent.client_secret,

      payment_intent_id:
        paymentIntent.id,
    };
  } catch (error) {
    /**
     * Rollback local payment if Stripe fails.
     */
    await prisma.payment.delete({
      where: {
        id: payment.id,
      },
    });

    console.error(
      "STRIPE PAYMENT INITIALIZATION ERROR:",
      error
    );

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to initialize Stripe payment"
    );
  }
};

/**
 * ============================================================
 * GET ALL PAYMENTS
 * ============================================================
 */

const getAllPayments = async (
  filters: IPaymentFilterRequest
) => {
  const where: Prisma.PaymentWhereInput =
    {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.provider) {
    where.provider = filters.provider;
  }

  if (filters.bookingId) {
    where.bookingId =
      filters.bookingId;
  }

  if (filters.transactionId) {
    where.transactionId =
      filters.transactionId;
  }

  return prisma.payment.findMany({
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
};

/**
 * ============================================================
 * GET SINGLE PAYMENT
 * ============================================================
 */

const getSinglePayment = async (
  id: string,
  userId: string,
  role: Role
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

  /**
   * Customer can only see own payment.
   */
  if (
    role === Role.CUSTOMER &&
    payment.userId !== userId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to view this payment"
    );
  }

  return payment;
};

/**
 * ============================================================
 * ADMIN UPDATE PAYMENT STATUS
 * ============================================================
 */

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
      PaymentStatus.COMPLETED &&
    payload.status !==
      PaymentStatus.COMPLETED
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Completed payment cannot be reversed"
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        const payment =
          await tx.payment.update({
            where: {
              id,
            },

            data: {
              status:
                payload.status,

              paidAt:
                payload.status ===
                PaymentStatus.COMPLETED
                  ? new Date()
                  : existingPayment.paidAt,
            },
          });

        /**
         * Payment completed
         * => Booking becomes PAID
         */
        if (
          payload.status ===
          PaymentStatus.COMPLETED
        ) {
          await tx.booking.update({
            where: {
              id: existingPayment.bookingId,
            },

            data: {
              status:
                BookingStatus.PAID,
            },
          });
        }

        return payment;
      }
    );

  return prisma.payment.findUnique({
    where: {
      id: result.id,
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
};

/**
 * ============================================================
 * STRIPE WEBHOOK
 * ============================================================
 */

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
  } catch (error) {
    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );

    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid Stripe webhook signature"
    );
  }

  /**
   * ========================================================
   * PAYMENT SUCCESS
   * ========================================================
   */

  if (
    event.type ===
    "payment_intent.succeeded"
  ) {
    const paymentIntent =
      event.data.object as Stripe.PaymentIntent;

    const paymentId =
      paymentIntent.metadata?.paymentId;

    const bookingId =
      paymentIntent.metadata?.bookingId;

    if (!paymentId || !bookingId) {
      return {
        message:
          "Payment metadata is incomplete",
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
        message:
          "Payment record not found",
      };
    }

    /**
     * Idempotency
     *
     * Stripe can send the same webhook more than once.
     */
    if (
      payment.status ===
      PaymentStatus.COMPLETED
    ) {
      return {
        message:
          "Payment already completed",
        paymentId,
      };
    }

    /**
     * Verify Stripe PaymentIntent
     */
    if (
      payment.stripePaymentIntentId &&
      payment.stripePaymentIntentId !==
        paymentIntent.id
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Stripe payment intent does not match payment record"
      );
    }

    /**
     * Verify amount
     */
    const expectedAmount =
      Math.round(
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

    /**
     * Verify currency
     */
    if (
      paymentIntent.currency !==
      "usd"
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Unsupported payment currency"
      );
    }

    /**
     * Update payment + booking atomically
     */
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

      bookingId:
        payment.bookingId,
    };
  }

  /**
   * ========================================================
   * PAYMENT FAILED
   * ========================================================
   */

  if (
    event.type ===
    "payment_intent.payment_failed"
  ) {
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
        message:
          "Payment record not found",
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
      message:
        "Payment marked as failed",

      paymentId,
    };
  }

  return {
    message:
      `Unhandled Stripe event: ${event.type}`,
  };
};

export const PaymentService = {
  createPayment,
  getAllPayments,
  getSinglePayment,
  updatePaymentStatus,
  handleStripeWebhook,
};