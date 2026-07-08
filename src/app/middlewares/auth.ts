import { NextFunction, Request, RequestHandler, Response } from "express";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt";
import { IJwtPayload } from "../modules/auth/auth.interface";
import AppError from "../errors/AppError";

declare global {
  namespace Express {
    interface Request {
      user: IJwtPayload;
    }
  }
}

const auth = (...allowedRoles: Role[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          "Authorization token is required"
        );
      }

      const [scheme, token] = authorization.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          "Invalid authorization header format"
        );
      }

      const decoded = verifyToken(token);

      req.user = decoded;

      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(decoded.role)
      ) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You are not authorized to access this resource"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;