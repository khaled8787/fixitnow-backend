import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

import { ZodType } from "zod";

const validateRequest = (
  schema: ZodType
): RequestHandler => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsedData =
        await schema.parseAsync({
          body: req.body,
          params: req.params,
          query: req.query,
        });

      if (
        parsedData &&
        typeof parsedData === "object"
      ) {
        const data = parsedData as {
          body?: unknown;
          params?: unknown;
          query?: unknown;
        };

        if (data.body !== undefined) {
          req.body = data.body;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;