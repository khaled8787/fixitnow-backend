import { Response } from "express";

interface ISendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ISendResponse<T>
): Response => {
  return res.status(statusCode).json({
    success: payload.success,
    message: payload.message,
    data: payload.data,
  });
};

export default sendResponse;