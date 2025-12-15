import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  const status = err instanceof CustomError ? err.status : 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};

export class CustomError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
