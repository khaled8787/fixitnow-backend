import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const notFound = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route not found",
    errorDetails: {
      path: req.originalUrl,
      method: req.method,
    },
  });
};

export default notFound;