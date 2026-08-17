import {
  PaymentProvider,
  PaymentStatus,
} from "@prisma/client";

export interface IPaymentPayload {
  bookingId: string;
  provider: PaymentProvider;
}

export interface IPaymentStatusPayload {
  status: PaymentStatus;
}

export interface IPaymentFilterRequest {
  status?: PaymentStatus;
  provider?: PaymentProvider;
  bookingId?: string;
  transactionId?: string;
}