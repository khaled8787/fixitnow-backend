import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  Application,
  Request,
  Response,
} from "express";

import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { AppRoutes } from "./app/modules/auth";

const app: Application = express();

app.use(cors());

app.post(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
  }),
  PaymentController.handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", AppRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "FixItNow Backend Server Running",
  });
});

app.use(notFound);

app.use(globalErrorHandler);

export default app;