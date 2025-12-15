import { Response, NextFunction } from 'express';
import {
  createTask,
  getTasks,
  getTask,
} from '../../src/controllers/taskController';
import prisma from '../../src/config/db';
import { CustomError } from '../../src/middleware/errorHandler';
import { AuthenticatedRequest } from '../../src/middleware/auth';

describe('Task Controller - Unit Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeAll(async () => {
    await prisma.$connect();
    // Reset the database (truncate tables)
    await prisma.$executeRaw`TRUNCATE TABLE "Task" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    await prisma.user.create({
      data: { id: 'user1', email: 'test@example.com', password: 'hashed' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.task.createMany({
      data: [
        { id: 'task1', title: 'Task 1', userId: 'user1' },
        { id: 'task2', title: 'Task 2', userId: 'user1' },
        { id: 'task3', title: 'Task 3', userId: 'user1' },
      ],
    });
    mockReq = { user: { id: 'user1' }, body: {}, query: {}, params: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      mockReq.body = { title: 'Test Task', description: 'Test' };
      await createTask(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      const task = await prisma.task.findFirst({
        where: { title: 'Test Task' },
      });
      expect(task).toBeTruthy();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test Task' })
      );
    });
  });

  describe('getTasks', () => {
    it('should get tasks with cursor pagination after cursor task', async () => {
      mockReq.query = { limit: '2', cursor: 'task1' };

      await getTasks(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          tasks: [
            expect.objectContaining({ id: 'task2' }),
            expect.objectContaining({ id: 'task3' }),
          ],
          total: 3,
          nextCursor: 'task3',
          hasNext: false,
        })
      );
    });
  });

  describe('getTask', () => {
    it('should get a task successfully', async () => {
      await prisma.task.create({
        data: { id: 'task4', title: 'Test', userId: 'user1' },
      });
      mockReq.params = { id: 'task4' };

      await getTask(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'task4' })
      );
    });

    it('should throw 404 if task not found', async () => {
      mockReq.params = { id: 'task5' };

      await getTask(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        new CustomError(404, 'Task not found')
      );
    });
  });
});
