import { Request, Response, NextFunction } from 'express';
import {
  register,
  login,
  refreshToken,
} from '../../src/controllers/authController';
import prisma from '../../src/config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Auth Controller - Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeAll(async () => {
    await prisma.$connect();
    // Reset the database (truncate tables)
    await prisma.$executeRaw`TRUNCATE TABLE "Task" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      await register(mockReq as Request, mockRes as Response, mockNext);

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });
      expect(user).toBeTruthy();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User created',
        userId: user!.id,
      });
    });
  });

  describe('login', () => {
    it('should login user successfully with tokens', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      await prisma.user.create({
        data: { email: 'test@example.com', password: hashedPassword },
      });
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      jest
        .spyOn(jwt, 'sign')
        .mockReturnValueOnce(accessToken as never)
        .mockReturnValueOnce(refreshToken as never);

      await login(mockReq as Request, mockRes as Response, mockNext);

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(user?.refreshToken).toBe(refreshToken);
      expect(mockRes.json).toHaveBeenCalledWith({ accessToken, refreshToken });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenSign = jwt.sign({ id: 'user1' }, 'refresh-secret', {
        expiresIn: '7d',
      });
      await prisma.user.create({
        data: {
          id: 'user1',
          email: 'test@example.com',
          password: 'hashed',
          refreshToken: refreshTokenSign,
        },
      });
      mockReq.body = { refreshToken: refreshTokenSign };
      const accessToken = 'newAccessToken';
      jest.spyOn(jwt, 'sign').mockReturnValue(accessToken as never);
      jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'user1' } as never);

      await refreshToken(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ accessToken });
    });
  });
});
