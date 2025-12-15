import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomError } from '../middleware/errorHandler';

interface LoginRequestBody {
  email: string;
  password: string;
}

interface RefreshTokenRequestBody {
  refreshToken: string;
}

export const register = async (
  req: Request<{}, { message: string; userId: string }, LoginRequestBody>,
  res: Response<{ message: string; userId: string }>,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<
    {},
    { accessToken: string; refreshToken: string },
    LoginRequestBody
  >,
  res: Response<{ accessToken: string; refreshToken: string }>,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new CustomError(401, 'Invalid credentials');

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) throw new CustomError(401, 'Invalid credentials');

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
      {
        expiresIn: '7d',
      }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request<{}, { accessToken: string }, RefreshTokenRequestBody>,
  res: Response<{ accessToken: string }>,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) throw new CustomError(401, 'Refresh token required');

    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });

    if (!user) throw new CustomError(403, 'Invalid refresh token');

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'refresh-secret'
    ) as {
      id: string;
    };

    if (decoded.id !== user.id)
      throw new CustomError(403, 'Invalid refresh token');

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '15m',
      }
    );

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};
