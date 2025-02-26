import request from 'supertest';
import express from 'express';
import taskRoutes from '../../src/routes/taskRoutes';
import authRoutes from '../../src/routes/authRoutes';
import prisma from '../../src/config/db';
import { errorHandler } from '../../src/middleware/errorHandler';

describe('API E2E Tests', () => {
  let app: express.Express;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;
  let taskId: string;

  beforeAll(async () => {
    await prisma.$connect();
    // Reset the database (truncate tables)
    await prisma.$executeRaw`TRUNCATE TABLE "Task" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    app = express();
    app.use(express.json());
    app.use('/api/tasks', taskRoutes);
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication', () => {
    it('should register a user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userId');
      userId = res.body.userId;
    });

    it('should login a user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('should refresh access token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      accessToken = res.body.accessToken;
    });
  });

  describe('Tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Test Task', description: 'Test Description' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Task');
      taskId = res.body.id; // First task ID, e.g., a UUID
    });

    it('should get tasks with pagination', async () => {
      await prisma.task.create({
        data: { id: 'task2', title: 'Task 2', userId },
      });

      const res = await request(app)
        .get(`/api/tasks?limit=1&cursor=${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].id).toBe('task2'); // Next task after taskId in ascending order
      expect(res.body).toHaveProperty('nextCursor', 'task2');
      expect(res.body.hasNext).toBe(false); // Only 2 tasks total, 1 after cursor
      expect(res.body.total).toBe(2); // Total tasks for user
    });

    it('should get a specific task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(taskId);
    });
  });
});
