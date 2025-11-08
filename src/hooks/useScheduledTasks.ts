// src/hooks/useScheduledTasks.ts

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { taskStorage } from '../services/storage.service';
import {
  ScheduledTask,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskFilterOptions,
} from '../types/scheduled-task.types';

/**
 * Hook for accessing and managing scheduled tasks
 */
export function useScheduledTasks(filters?: TaskFilterOptions) {
  // Live query - automatically updates when database changes
  const tasks = useLiveQuery(
    () => filters
      ? taskStorage.getFilteredTasks(filters)
      : taskStorage.getAllTasks(),
    [filters]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a new task
   */
  const createTask = useCallback(async (input: CreateTaskInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const task = await taskStorage.createTask(input);
      return task;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update a task
   */
  const updateTask = useCallback(async (id: string, updates: UpdateTaskInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const task = await taskStorage.updateTask(id, updates);
      return task;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update task status
   */
  const updateTaskStatus = useCallback(async (
    id: string,
    status: TaskStatus,
    metadata?: Parameters<typeof taskStorage.updateTaskStatus>[2]
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const task = await taskStorage.updateTaskStatus(id, status, metadata);
      return task;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await taskStorage.deleteTask(id);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tasks: tasks || [],
    isLoading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
}

/**
 * Hook for tasks on a specific date
 */
export function useTasksForDate(date: Date) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await taskStorage.getTasksForDate(date);
      setTasks(result);
    } catch (err) {
      console.error('Error loading tasks for date:', err);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  // Load tasks on mount and when date changes
  useState(() => {
    loadTasks();
  });

  return { tasks, isLoading, refresh: loadTasks };
}

/**
 * Hook for upcoming tasks
 */
export function useUpcomingTasks(limit: number = 10) {
  const tasks = useLiveQuery(
    () => taskStorage.getUpcomingTasks(limit),
    [limit]
  );

  return tasks || [];
}

/**
 * Hook for task statistics
 */
export function useTaskStatistics() {
  const stats = useLiveQuery(
    () => taskStorage.getStatistics(),
    []
  );

  return stats;
}
