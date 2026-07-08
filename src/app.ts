import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { AppRoutes } from "./app/modules/auth";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
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