// src/services/database.ts

import Dexie, { Table } from 'dexie';
import { WorkflowLibraryItem } from '../types/workflow-library.types';
import { ScheduledTask, TaskStatus, TaskPriority } from '../types/scheduled-task.types';

/**
 * IndexedDB database for DJZ-Yesterday
 * 
 * Stores workflow library items and scheduled tasks
 */
export class YesterdayDatabase extends Dexie {
  // Declare tables
  workflowLibrary!: Table<WorkflowLibraryItem, string>;
  scheduledTasks!: Table<ScheduledTask, string>;

  constructor() {
    super('DJZ-Yesterday');

    // Define schema
    // Version 1 - Initial schema
    this.version(1).stores({
      workflowLibrary: 'id, name, createdAt, *tags',
      scheduledTasks: 'id, workflowId, scheduledTime, status, createdAt',
    });

    // Map tables to classes (optional, but provides better TypeScript support)
    this.workflowLibrary.mapToClass(WorkflowLibraryItemClass);
    this.scheduledTasks.mapToClass(ScheduledTaskClass);
  }

  /**
   * Clear all data from database (useful for testing/reset)
   */
  async clearAll(): Promise<void> {
    await this.workflowLibrary.clear();
    await this.scheduledTasks.clear();
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const [workflowCount, taskCount] = await Promise.all([
      this.workflowLibrary.count(),
      this.scheduledTasks.count(),
    ]);

    return {
      workflowCount,
      taskCount,
      databaseSize: await this.getDatabaseSize(),
    };
  }

  /**
   * Estimate database size (approximate)
   */
  private async getDatabaseSize(): Promise<number> {
    // IndexedDB doesn't provide exact size, this is an estimate
    const workflows = await this.workflowLibrary.toArray();
    const tasks = await this.scheduledTasks.toArray();

    const size = JSON.stringify([...workflows, ...tasks]).length;
    return size;
  }
}

/**
 * Class wrapper for WorkflowLibraryItem
 * Provides helper methods on instances
 */
class WorkflowLibraryItemClass implements WorkflowLibraryItem {
  id!: string;
  name!: string;
  fileName!: string;
  workflow!: Record<string, { class_type: string; inputs: Record<string, unknown>; _meta?: { title?: string } }>;
  tags!: string[];
  createdAt!: Date;
  updatedAt!: Date;
  metadata!: {
    nodeCount?: number;
    estimatedDuration?: number;
    description?: string;
    lastExecuted?: Date;
    executionCount?: number;
  };

  /**
   * Check if workflow has a specific tag
   */
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Get node count from workflow
   */
  getNodeCount(): number {
    return Object.keys(this.workflow).length;
  }
}

/**
 * Class wrapper for ScheduledTask
 * Provides helper methods on instances
 */
class ScheduledTaskClass implements ScheduledTask {
  id!: string;
  workflowId!: string;
  workflowName!: string;
  scheduledTime!: Date;
  status!: TaskStatus;
  createdAt!: Date;
  startedAt?: Date;
  completedAt?: Date;
  promptId?: string;
  error?: string;
  outputs?: {
    images?: string[];
    videos?: string[];
    metadata?: Record<string, unknown>;
  };
  retryCount!: number;
  maxRetries!: number;
  priority!: TaskPriority;

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    return new Date() > this.scheduledTime && this.status === TaskStatus.PENDING;
  }

  /**
   * Check if task can be retried
   */
  canRetry(): boolean {
    return this.status === TaskStatus.FAILED && this.retryCount < this.maxRetries;
  }

  /**
   * Get time until scheduled execution
   */
  getTimeUntilExecution(): number {
    return this.scheduledTime.getTime() - Date.now();
  }
}

// Create singleton instance
export const db = new YesterdayDatabase();

// Export for testing
export const resetDatabase = async () => {
  await db.clearAll();
};
