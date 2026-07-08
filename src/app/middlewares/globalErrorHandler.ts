import { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import AppError from "../errors/AppError";

const isDevelopment = process.env.NODE_ENV === "development";

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorDetails: unknown = {};

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        statusCode = 409;
        message = "A record with the provided value already exists.";
        errorDetails = {
          target: error.meta?.target,
        };
        break;

      case "P2025":
        statusCode = 404;
        message = "Requested resource was not found.";
        break;

      default:
        statusCode = 400;
        message = "Database request failed.";
        errorDetails = {
          code: error.code,
        };
    }
  } else if (error instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token has expired.";
  } else if (error instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid authentication token.";
  } else if (error instanceof Error) {
    statusCode = 500;
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
    ...(isDevelopment && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });
};

export default globalErrorHandler;