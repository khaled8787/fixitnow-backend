import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodType } from "zod";

const validateRequest = <T>(schema: ZodType<T>): RequestHandler => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;