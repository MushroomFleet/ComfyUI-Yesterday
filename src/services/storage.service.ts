// src/services/storage.service.ts

import { db } from './database';
import {
  WorkflowLibraryItem,
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from '../types/workflow-library.types';
import {
  ScheduledTask,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority,
  TaskFilterOptions,
  TaskStatistics,
  RecurrenceType,
} from '../types/scheduled-task.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage service for workflow library operations
 */
export class WorkflowStorageService {
  /**
   * Create a new workflow in the library
   */
  async createWorkflow(input: CreateWorkflowInput): Promise<WorkflowLibraryItem> {
    const workflow: WorkflowLibraryItem = {
      id: uuidv4(),
      name: input.name,
      fileName: input.fileName,
      workflow: input.workflow,
      tags: input.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        nodeCount: Object.keys(input.workflow).length,
        description: input.description,
        executionCount: 0,
      },
    };

    await db.workflowLibrary.add(workflow);
    return workflow;
  }

  /**
   * Get a workflow by ID
   */
  async getWorkflow(id: string): Promise<WorkflowLibraryItem | undefined> {
    return await db.workflowLibrary.get(id);
  }

  /**
   * Get all workflows
   */
  async getAllWorkflows(): Promise<WorkflowLibraryItem[]> {
    return await db.workflowLibrary.toArray();
  }

  /**
   * Get workflows by tags (any of the provided tags)
   */
  async getWorkflowsByTags(tags: string[]): Promise<WorkflowLibraryItem[]> {
    if (tags.length === 0) {
      return this.getAllWorkflows();
    }

    return await db.workflowLibrary
      .where('tags')
      .anyOf(tags)
      .toArray();
  }

  /**
   * Search workflows by name
   */
  async searchWorkflows(query: string): Promise<WorkflowLibraryItem[]> {
    const lowerQuery = query.toLowerCase();
    return await db.workflowLibrary
      .filter(workflow => 
        workflow.name.toLowerCase().includes(lowerQuery) ||
        workflow.fileName.toLowerCase().includes(lowerQuery) ||
        workflow.metadata.description?.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(
    id: string,
    updates: UpdateWorkflowInput
  ): Promise<WorkflowLibraryItem> {
    const workflow = await this.getWorkflow(id);
    if (!workflow) {
      throw new Error(`Workflow with ID ${id} not found`);
    }

    await db.workflowLibrary.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    const updated = await this.getWorkflow(id);
    return updated!;
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    // Check if workflow is used by any scheduled tasks
    const tasksUsingWorkflow = await db.scheduledTasks
      .where('workflowId')
      .equals(id)
      .count();

    if (tasksUsingWorkflow > 0) {
      throw new Error(
        `Cannot delete workflow: ${tasksUsingWorkflow} scheduled task(s) are using it`
      );
    }

    await db.workflowLibrary.delete(id);
  }

  /**
   * Get all unique tags from workflows
   */
  async getAllTags(): Promise<string[]> {
    const workflows = await this.getAllWorkflows();
    const tagsSet = new Set<string>();

    workflows.forEach(workflow => {
      workflow.tags.forEach(tag => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  }

  /**
   * Bulk import workflows
   */
  async bulkImport(inputs: CreateWorkflowInput[]): Promise<WorkflowLibraryItem[]> {
    const workflows = inputs.map(input => ({
      id: uuidv4(),
      name: input.name,
      fileName: input.fileName,
      workflow: input.workflow,
      tags: input.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        nodeCount: Object.keys(input.workflow).length,
        description: input.description,
        executionCount: 0,
      },
    }));

    await db.workflowLibrary.bulkAdd(workflows);
    return workflows;
  }

  /**
   * Export workflows as JSON
   */
  async exportWorkflows(ids?: string[]): Promise<string> {
    let workflows: WorkflowLibraryItem[];

    if (ids && ids.length > 0) {
      workflows = await db.workflowLibrary.bulkGet(ids).then(
        items => items.filter(Boolean) as WorkflowLibraryItem[]
      );
    } else {
      workflows = await this.getAllWorkflows();
    }

    return JSON.stringify(workflows, null, 2);
  }
}

/**
 * Storage service for scheduled tasks operations
 */
export class TaskStorageService {
  /**
   * Create a new scheduled task
   */
  async createTask(input: CreateTaskInput): Promise<ScheduledTask> {
    // Verify workflow exists
    const workflow = await db.workflowLibrary.get(input.workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${input.workflowId} not found`);
    }

    const task: ScheduledTask = {
      id: uuidv4(),
      workflowId: input.workflowId,
      workflowName: workflow.name,
      scheduledTime: input.scheduledTime,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: input.maxRetries ?? 3,
      priority: input.priority ?? TaskPriority.NORMAL,
      parameterOverrides: input.parameterOverrides,
      recurrenceType: input.recurrenceType ?? RecurrenceType.NONE,
      seriesId: input.seriesId,
    };

    await db.scheduledTasks.add(task);
    return task;
  }

  /**
   * Create multiple tasks in bulk (for recurring tasks)
   */
  async createTasksBulk(inputs: CreateTaskInput[]): Promise<ScheduledTask[]> {
    if (inputs.length === 0) {
      return [];
    }

    // Verify workflow exists (use first input's workflowId, all should be same)
    const workflow = await db.workflowLibrary.get(inputs[0].workflowId);
    if (!workflow) {
      throw new Error(`Workflow with ID ${inputs[0].workflowId} not found`);
    }

    const tasks: ScheduledTask[] = inputs.map(input => ({
      id: uuidv4(),
      workflowId: input.workflowId,
      workflowName: workflow.name,
      scheduledTime: input.scheduledTime,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: input.maxRetries ?? 3,
      priority: input.priority ?? TaskPriority.NORMAL,
      parameterOverrides: input.parameterOverrides,
      recurrenceType: input.recurrenceType ?? RecurrenceType.NONE,
      seriesId: input.seriesId,
    }));

    await db.scheduledTasks.bulkAdd(tasks);
    return tasks;
  }

  /**
   * Get a task by ID
   */
  async getTask(id: string): Promise<ScheduledTask | undefined> {
    return await db.scheduledTasks.get(id);
  }

  /**
   * Get all tasks
   */
  async getAllTasks(): Promise<ScheduledTask[]> {
    return await db.scheduledTasks.orderBy('scheduledTime').toArray();
  }

  /**
   * Get tasks with filters
   */
  async getFilteredTasks(filters: TaskFilterOptions): Promise<ScheduledTask[]> {
    let query = db.scheduledTasks.toCollection();

    // Filter by status
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      query = db.scheduledTasks.where('status').anyOf(statuses);
    }

    // Get results
    let tasks = await query.toArray();

    // Filter by date range
    if (filters.startDate) {
      tasks = tasks.filter(task => task.scheduledTime >= filters.startDate!);
    }
    if (filters.endDate) {
      tasks = tasks.filter(task => task.scheduledTime <= filters.endDate!);
    }

    // Filter by workflow
    if (filters.workflowId) {
      tasks = tasks.filter(task => task.workflowId === filters.workflowId);
    }

    return tasks.sort((a, b) => 
      a.scheduledTime.getTime() - b.scheduledTime.getTime()
    );
  }

  /**
   * Get tasks for a specific date
   */
  async getTasksForDate(date: Date): Promise<ScheduledTask[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getFilteredTasks({
      startDate: startOfDay,
      endDate: endOfDay,
    });
  }

  /**
   * Get upcoming tasks (next N tasks)
   */
  async getUpcomingTasks(limit: number = 10): Promise<ScheduledTask[]> {
    const now = new Date();
    return await db.scheduledTasks
      .where('scheduledTime')
      .above(now)
      .and(task => task.status === TaskStatus.PENDING)
      .sortBy('scheduledTime')
      .then(tasks => tasks.slice(0, limit));
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<ScheduledTask[]> {
    const now = new Date();
    return await db.scheduledTasks
      .where('scheduledTime')
      .below(now)
      .and(task => task.status === TaskStatus.PENDING)
      .toArray();
  }

  /**
   * Update a task
   */
  async updateTask(
    id: string,
    updates: UpdateTaskInput
  ): Promise<ScheduledTask> {
    const task = await this.getTask(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    await db.scheduledTasks.update(id, updates as Partial<ScheduledTask>);

    const updated = await this.getTask(id);
    return updated!;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    metadata?: Partial<Pick<ScheduledTask, 'startedAt' | 'completedAt' | 'error' | 'promptId' | 'outputs'>>
  ): Promise<ScheduledTask> {
    const task = await this.getTask(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const updates: Partial<ScheduledTask> = { status, ...metadata };

    if (status === TaskStatus.RUNNING && !metadata?.startedAt) {
      updates.startedAt = new Date();
    }

    if ([TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(status)) {
      if (!metadata?.completedAt) {
        updates.completedAt = new Date();
      }
    }

    await db.scheduledTasks.update(id, updates);

    const updated = await this.getTask(id);
    return updated!;
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    await db.scheduledTasks.delete(id);
  }

  /**
   * Delete tasks by workflow ID
   */
  async deleteTasksByWorkflow(workflowId: string): Promise<number> {
    return await db.scheduledTasks
      .where('workflowId')
      .equals(workflowId)
      .delete();
  }

  /**
   * Get task statistics
   */
  async getStatistics(): Promise<TaskStatistics> {
    const tasks = await this.getAllTasks();

    const stats: TaskStatistics = {
      total: tasks.length,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      missed: 0,
    };

    tasks.forEach(task => {
      switch (task.status) {
        case TaskStatus.PENDING:
          stats.pending++;
          break;
        case TaskStatus.RUNNING:
          stats.running++;
          break;
        case TaskStatus.COMPLETED:
          stats.completed++;
          break;
        case TaskStatus.FAILED:
          stats.failed++;
          break;
        case TaskStatus.CANCELLED:
          stats.cancelled++;
          break;
        case TaskStatus.MISSED:
          stats.missed++;
          break;
      }
    });

    return stats;
  }

  /**
   * Clean up old completed tasks
   */
  async cleanupOldTasks(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await db.scheduledTasks
      .where('completedAt')
      .below(cutoffDate)
      .and(task => task.status === TaskStatus.COMPLETED)
      .delete();
  }
}

// Export service instances
export const workflowStorage = new WorkflowStorageService();
export const taskStorage = new TaskStorageService();
