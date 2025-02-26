import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { Task } from '../schemas';

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response<Task>,
  next: NextFunction
) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response<{
    tasks: Task[];
    total: number;
    nextCursor: string | null;
    hasNext: boolean;
  }>,
  next: NextFunction
) => {
  try {
    const { status, priority, cursor, limit = '10' } = req.query;

    const take = Number(limit);
    const where: any = { userId: req.user!.id };

    if (status) where.status = status.toString().toUpperCase();
    if (priority) where.priority = priority.toString().toUpperCase();

    if (cursor) {
      where.id = { gt: cursor as string }; // Changed to gt
    }

    const tasks = await prisma.task.findMany({
      where,
      take: take + 1,
      orderBy: { id: 'asc' }, // Changed to ascending order
    });

    const hasNext = tasks.length > take;
    const resultTasks = hasNext ? tasks.slice(0, take) : tasks;
    const nextCursor =
      resultTasks.length > 0 ? resultTasks[resultTasks.length - 1].id : null;

    const totalWhere: any = { userId: req.user!.id };
    if (status) totalWhere.status = status.toString().toUpperCase();
    if (priority) totalWhere.priority = priority.toString().toUpperCase();
    const total = await prisma.task.count({ where: totalWhere });

    res.json({
      tasks: resultTasks,
      total,
      nextCursor,
      hasNext,
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: AuthenticatedRequest,
  res: Response<Task>,
  next: NextFunction
) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) throw new CustomError(404, 'Task not found');
    if (task.userId !== req.user!.id)
      throw new CustomError(403, 'Unauthorized');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response<Task>,
  next: NextFunction
) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) throw new CustomError(404, 'Task not found');
    if (task.userId !== req.user!.id)
      throw new CustomError(403, 'Unauthorized');

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response<{ message: string }>,
  next: NextFunction
) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) throw new CustomError(404, 'Task not found');
    if (task.userId !== req.user!.id)
      throw new CustomError(403, 'Unauthorized');

    await prisma.task.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
