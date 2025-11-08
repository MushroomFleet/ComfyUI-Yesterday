# Phase 1: Data Models and Storage Layer

## Phase Overview

**Goal:** Establish the data structure and persistence layer for workflows and scheduled tasks using IndexedDB

**Prerequisites:** 
- Existing comfy-flow-runner-basic project cloned
- Node.js 18+ or Bun installed
- Development environment set up

**Estimated Duration:** 2-3 days

**Key Deliverables:**
- TypeScript interfaces for all data models
- IndexedDB schema and database initialization
- Storage service with CRUD operations
- React hooks for data access
- Migration utilities for future schema changes
- Unit tests for storage operations

---

## Step 1: Install Required Dependencies

**Purpose:** Add IndexedDB wrapper library and development utilities

**Duration:** 15 minutes

### Instructions

1. Install Dexie.js (IndexedDB wrapper) and related dependencies:

```bash
npm install dexie
npm install --save-dev @types/dexie
```

2. Verify installation by checking `package.json`:

```json
{
  "dependencies": {
    "dexie": "^3.2.4",
    // ... other dependencies
  },
  "devDependencies": {
    "@types/dexie": "^3.2.4",
    // ... other dev dependencies
  }
}
```

### Why Dexie.js?

- Provides a clean, promise-based API over IndexedDB
- Excellent TypeScript support
- Handles migrations automatically
- Cross-browser compatibility
- Better error handling than raw IndexedDB

### Verification

```bash
npm list dexie
# Should show: dexie@3.2.4 (or latest version)
```

---

## Step 2: Create TypeScript Type Definitions

**Purpose:** Define all data models and enums for type safety

**Duration:** 45 minutes

### Instructions

1. Create `src/types/workflow-library.types.ts`:

```typescript
// src/types/workflow-library.types.ts

/**
 * Represents a workflow stored in the library
 */
export interface WorkflowLibraryItem {
  id: string;                    // UUID v4
  name: string;                  // Display name for the workflow
  fileName: string;              // Original filename when uploaded
  workflow: ComfyUIWorkflow;     // Complete ComfyUI API format JSON
  tags: string[];                // User-defined tags for organization
  createdAt: Date;               // When workflow was added to library
  updatedAt: Date;               // Last modification time
  metadata: WorkflowMetadata;    // Additional information
}

/**
 * Metadata about a workflow
 */
export interface WorkflowMetadata {
  nodeCount?: number;            // Number of nodes in workflow
  estimatedDuration?: number;    // Estimated execution time in seconds
  description?: string;          // User-provided description
  lastExecuted?: Date;           // Last time this workflow was executed
  executionCount?: number;       // Number of times executed
}

/**
 * ComfyUI workflow structure (from existing types)
 * This should match the API format from ComfyUI
 */
export interface ComfyUIWorkflow {
  [nodeId: string]: ComfyUINode;
}

/**
 * Individual node in ComfyUI workflow
 */
export interface ComfyUINode {
  class_type: string;
  inputs: Record<string, any>;
  _meta?: {
    title?: string;
  };
}

/**
 * Tag categories for organization
 */
export interface TagCategories {
  taskType: string[];      // e.g., ["t2i", "i2i", "video", "upscale"]
  mediaFormat: string[];   // e.g., ["image", "video", "audio"]
  modelName: string[];     // e.g., ["SDXL", "SD15", "Flux"]
  custom: string[];        // User-defined tags
}

/**
 * Common tag suggestions
 */
export const COMMON_TAGS = {
  taskType: ['t2i', 'i2i', 'video', 'upscale', 'animation', 'inpaint', 'outpaint'],
  mediaFormat: ['image', 'video', 'audio', 'batch'],
  modelName: ['SDXL', 'SD15', 'SD21', 'Flux', 'AnimateDiff', 'SVD'],
} as const;

/**
 * Input for creating a new workflow library item
 */
export interface CreateWorkflowInput {
  name: string;
  fileName: string;
  workflow: ComfyUIWorkflow;
  tags?: string[];
  description?: string;
}

/**
 * Input for updating a workflow library item
 */
export interface UpdateWorkflowInput {
  name?: string;
  tags?: string[];
  description?: string;
}
```

2. Create `src/types/scheduled-task.types.ts`:

```typescript
// src/types/scheduled-task.types.ts

/**
 * Status of a scheduled task
 */
export enum TaskStatus {
  PENDING = 'pending',       // Task is scheduled, waiting for execution time
  RUNNING = 'running',       // Task is currently executing
  COMPLETED = 'completed',   // Task completed successfully
  FAILED = 'failed',         // Task failed with error
  CANCELLED = 'cancelled',   // Task was cancelled by user
  MISSED = 'missed',         // Task execution time passed while app was closed
}

/**
 * Represents a scheduled task (workflow execution at specific time)
 */
export interface ScheduledTask {
  id: string;                    // UUID v4
  workflowId: string;            // Reference to WorkflowLibraryItem.id
  workflowName: string;          // Cached workflow name for display
  scheduledTime: Date;           // When to execute this task
  status: TaskStatus;            // Current status
  createdAt: Date;               // When task was scheduled
  startedAt?: Date;              // When execution began
  completedAt?: Date;            // When execution finished
  promptId?: string;             // ComfyUI prompt_id (set during execution)
  error?: string;                // Error message if failed
  outputs?: TaskOutputs;         // Generated outputs
  retryCount: number;            // Number of retry attempts
  maxRetries: number;            // Maximum allowed retries
  priority: TaskPriority;        // Execution priority
}

/**
 * Priority levels for task execution
 */
export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

/**
 * Outputs generated by task execution
 */
export interface TaskOutputs {
  images?: string[];             // Array of image URLs
  videos?: string[];             // Array of video URLs
  metadata?: Record<string, any>; // Additional metadata from execution
}

/**
 * Input for creating a new scheduled task
 */
export interface CreateTaskInput {
  workflowId: string;
  scheduledTime: Date;
  priority?: TaskPriority;
  maxRetries?: number;
}

/**
 * Input for updating a scheduled task
 */
export interface UpdateTaskInput {
  scheduledTime?: Date;
  status?: TaskStatus;
  priority?: TaskPriority;
}

/**
 * Filter options for querying tasks
 */
export interface TaskFilterOptions {
  status?: TaskStatus | TaskStatus[];
  startDate?: Date;
  endDate?: Date;
  workflowId?: string;
}

/**
 * Statistics about tasks
 */
export interface TaskStatistics {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  missed: number;
}
```

3. Update `src/types/comfyui.types.ts` if needed to ensure compatibility:

```typescript
// Add any missing types that workflow-library.types.ts references
// Most likely this file already has ComfyUIWorkflow and related types
// Just ensure they're exported properly
```

### Verification

```bash
# Run TypeScript compiler to check for errors
npx tsc --noEmit
# Should complete with no errors
```

---

## Step 3: Create IndexedDB Database Schema

**Purpose:** Set up the database structure using Dexie.js

**Duration:** 30 minutes

### Instructions

1. Create `src/services/database.ts`:

```typescript
// src/services/database.ts

import Dexie, { Table } from 'dexie';
import { WorkflowLibraryItem } from '../types/workflow-library.types';
import { ScheduledTask } from '../types/scheduled-task.types';

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
  workflow!: any;
  tags!: string[];
  createdAt!: Date;
  updatedAt!: Date;
  metadata!: any;

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
  status!: any;
  createdAt!: Date;
  startedAt?: Date;
  completedAt?: Date;
  promptId?: string;
  error?: string;
  outputs?: any;
  retryCount!: number;
  maxRetries!: number;
  priority!: any;

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    return new Date() > this.scheduledTime && this.status === 'pending';
  }

  /**
   * Check if task can be retried
   */
  canRetry(): boolean {
    return this.status === 'failed' && this.retryCount < this.maxRetries;
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
```

### Schema Explanation

**workflowLibrary store:**
- Primary key: `id` (UUID)
- Indexed fields: `name` (for searching), `createdAt` (for sorting), `*tags` (multi-entry index for filtering)

**scheduledTasks store:**
- Primary key: `id` (UUID)
- Indexed fields: `workflowId` (for finding tasks by workflow), `scheduledTime` (for chronological queries), `status` (for filtering), `createdAt` (for sorting)

### Verification

```typescript
// Create a test file: src/services/database.test.ts
import { db } from './database';

// Test database initialization
db.open().then(() => {
  console.log('Database opened successfully');
  db.getStats().then(stats => {
    console.log('Database stats:', stats);
  });
});
```

---

## Step 4: Create Storage Service

**Purpose:** Implement CRUD operations for workflows and tasks

**Duration:** 90 minutes

### Instructions

1. Create `src/services/storage.service.ts`:

```typescript
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

    const updated: WorkflowLibraryItem = {
      ...workflow,
      ...updates,
      updatedAt: new Date(),
    };

    await db.workflowLibrary.update(id, updated);
    return updated;
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
    };

    await db.scheduledTasks.add(task);
    return task;
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

    const updated: ScheduledTask = {
      ...task,
      ...updates,
    };

    await db.scheduledTasks.update(id, updated);
    return updated;
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
    return { ...task, ...updates } as ScheduledTask;
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
```

2. Install uuid library:

```bash
npm install uuid
npm install --save-dev @types/uuid
```

### Verification

Create a test script to verify CRUD operations work:

```typescript
// src/services/storage.test.ts

import { workflowStorage, taskStorage } from './storage.service';

async function testStorage() {
  console.log('Testing Workflow Storage...');

  // Create workflow
  const workflow = await workflowStorage.createWorkflow({
    name: 'Test Workflow',
    fileName: 'test.json',
    workflow: { '1': { class_type: 'LoadImage', inputs: {} } },
    tags: ['t2i', 'test'],
    description: 'Test workflow',
  });
  console.log('✓ Created workflow:', workflow.id);

  // Get workflow
  const retrieved = await workflowStorage.getWorkflow(workflow.id);
  console.log('✓ Retrieved workflow:', retrieved?.name);

  // Create task
  const task = await taskStorage.createTask({
    workflowId: workflow.id,
    scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
  });
  console.log('✓ Created task:', task.id);

  // Get statistics
  const stats = await taskStorage.getStatistics();
  console.log('✓ Task statistics:', stats);

  console.log('All tests passed!');
}

testStorage().catch(console.error);
```

---

## Step 5: Create React Hooks

**Purpose:** Provide easy data access for React components using hooks

**Duration:** 60 minutes

### Instructions

1. Create `src/hooks/useWorkflowLibrary.ts`:

```typescript
// src/hooks/useWorkflowLibrary.ts

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { workflowStorage } from '../services/storage.service';
import {
  WorkflowLibraryItem,
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from '../types/workflow-library.types';

/**
 * Hook for accessing and managing workflow library
 */
export function useWorkflowLibrary() {
  // Live query - automatically updates when database changes
  const workflows = useLiveQuery(
    () => workflowStorage.getAllWorkflows(),
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a new workflow
   */
  const createWorkflow = useCallback(async (input: CreateWorkflowInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const workflow = await workflowStorage.createWorkflow(input);
      return workflow;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update a workflow
   */
  const updateWorkflow = useCallback(async (id: string, updates: UpdateWorkflowInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const workflow = await workflowStorage.updateWorkflow(id, updates);
      return workflow;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a workflow
   */
  const deleteWorkflow = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await workflowStorage.deleteWorkflow(id);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    workflows: workflows || [],
    isLoading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  };
}

/**
 * Hook for filtered workflows
 */
export function useFilteredWorkflows(tags?: string[], searchQuery?: string) {
  const [workflows, setWorkflows] = useState<WorkflowLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadWorkflows = async () => {
      setIsLoading(true);
      try {
        let result: WorkflowLibraryItem[];

        if (searchQuery) {
          result = await workflowStorage.searchWorkflows(searchQuery);
        } else if (tags && tags.length > 0) {
          result = await workflowStorage.getWorkflowsByTags(tags);
        } else {
          result = await workflowStorage.getAllWorkflows();
        }

        setWorkflows(result);
      } catch (err) {
        console.error('Error loading workflows:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflows();
  }, [tags, searchQuery]);

  return { workflows, isLoading };
}

/**
 * Hook for all available tags
 */
export function useWorkflowTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    workflowStorage.getAllTags().then(setTags);
  }, []);

  return tags;
}
```

2. Create `src/hooks/useScheduledTasks.ts`:

```typescript
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

  // Load tasks whenever date changes
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
```

3. Install dexie-react-hooks:

```bash
npm install dexie-react-hooks
```

### Verification

Create a test component:

```typescript
// src/components/test/StorageTest.tsx

import { useWorkflowLibrary, useScheduledTasks, useTaskStatistics } from '../../hooks';

export function StorageTest() {
  const { workflows } = useWorkflowLibrary();
  const { tasks } = useScheduledTasks();
  const stats = useTaskStatistics();

  return (
    <div>
      <h2>Workflow Library</h2>
      <p>Total workflows: {workflows.length}</p>

      <h2>Scheduled Tasks</h2>
      <p>Total tasks: {tasks.length}</p>

      <h2>Statistics</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}
```

---

## Step 6: Testing and Validation

**Purpose:** Ensure all storage operations work correctly

**Duration:** 30 minutes

### Instructions

1. Create `src/utils/test-data.ts` for generating test data:

```typescript
// src/utils/test-data.ts

import { workflowStorage, taskStorage } from '../services/storage.service';
import { TaskPriority } from '../types/scheduled-task.types';

/**
 * Generate sample workflows for testing
 */
export async function generateSampleWorkflows() {
  const sampleWorkflows = [
    {
      name: 'SDXL Text to Image',
      fileName: 'sdxl-t2i.json',
      workflow: {
        '1': { class_type: 'LoadCheckpoint', inputs: { ckpt_name: 'sdxl.safetensors' } },
        '2': { class_type: 'CLIPTextEncode', inputs: { text: 'beautiful landscape' } },
        '3': { class_type: 'KSampler', inputs: {} },
        '4': { class_type: 'SaveImage', inputs: {} },
      },
      tags: ['t2i', 'image', 'SDXL'],
      description: 'Basic SDXL text to image workflow',
    },
    {
      name: 'AnimateDiff Video',
      fileName: 'animatediff-video.json',
      workflow: {
        '1': { class_type: 'LoadCheckpoint', inputs: {} },
        '2': { class_type: 'AnimateDiffLoader', inputs: {} },
        '3': { class_type: 'KSampler', inputs: {} },
        '4': { class_type: 'SaveAnimatedWebP', inputs: {} },
      },
      tags: ['video', 'animation', 'AnimateDiff'],
      description: 'AnimateDiff video generation',
    },
    {
      name: 'Image to Image Upscale',
      fileName: 'i2i-upscale.json',
      workflow: {
        '1': { class_type: 'LoadImage', inputs: {} },
        '2': { class_type: 'UpscaleModel', inputs: {} },
        '3': { class_type: 'SaveImage', inputs: {} },
      },
      tags: ['i2i', 'upscale', 'image'],
      description: 'Image upscaling workflow',
    },
  ];

  for (const workflow of sampleWorkflows) {
    await workflowStorage.createWorkflow(workflow);
  }

  console.log(`✓ Generated ${sampleWorkflows.length} sample workflows`);
}

/**
 * Generate sample tasks for testing
 */
export async function generateSampleTasks() {
  const workflows = await workflowStorage.getAllWorkflows();
  
  if (workflows.length === 0) {
    console.error('No workflows found. Generate sample workflows first.');
    return;
  }

  const now = new Date();
  const tasks = [
    {
      workflowId: workflows[0].id,
      scheduledTime: new Date(now.getTime() + 3600000), // 1 hour from now
      priority: TaskPriority.HIGH,
    },
    {
      workflowId: workflows[1]?.id || workflows[0].id,
      scheduledTime: new Date(now.getTime() + 7200000), // 2 hours from now
      priority: TaskPriority.NORMAL,
    },
    {
      workflowId: workflows[2]?.id || workflows[0].id,
      scheduledTime: new Date(now.getTime() + 86400000), // 1 day from now
      priority: TaskPriority.LOW,
    },
  ];

  for (const task of tasks) {
    await taskStorage.createTask(task);
  }

  console.log(`✓ Generated ${tasks.length} sample tasks`);
}

/**
 * Run all test data generation
 */
export async function generateAllTestData() {
  console.log('Generating test data...');
  await generateSampleWorkflows();
  await generateSampleTasks();
  console.log('✓ Test data generation complete');
}
```

2. Add test command to `package.json`:

```json
{
  "scripts": {
    "test:storage": "tsx src/utils/test-data.ts"
  }
}
```

3. Install tsx for running TypeScript:

```bash
npm install --save-dev tsx
```

### Verification Checklist

Run through these checks:

- [ ] **Database opens successfully**
  ```typescript
  import { db } from './services/database';
  await db.open();
  console.log('✓ Database opened');
  ```

- [ ] **Can create workflow**
  ```typescript
  const workflow = await workflowStorage.createWorkflow({
    name: 'Test',
    fileName: 'test.json',
    workflow: {},
    tags: ['test'],
  });
  console.log('✓ Workflow created:', workflow.id);
  ```

- [ ] **Can retrieve workflow**
  ```typescript
  const retrieved = await workflowStorage.getWorkflow(workflow.id);
  console.log('✓ Workflow retrieved:', retrieved?.name);
  ```

- [ ] **Can update workflow**
  ```typescript
  await workflowStorage.updateWorkflow(workflow.id, { name: 'Updated' });
  console.log('✓ Workflow updated');
  ```

- [ ] **Can delete workflow**
  ```typescript
  await workflowStorage.deleteWorkflow(workflow.id);
  console.log('✓ Workflow deleted');
  ```

- [ ] **Can create task**
  ```typescript
  const task = await taskStorage.createTask({
    workflowId: workflow.id,
    scheduledTime: new Date(),
  });
  console.log('✓ Task created:', task.id);
  ```

- [ ] **Can filter tasks**
  ```typescript
  const pendingTasks = await taskStorage.getFilteredTasks({
    status: TaskStatus.PENDING,
  });
  console.log('✓ Filtered tasks:', pendingTasks.length);
  ```

- [ ] **React hooks work**
  ```typescript
  // In a React component
  const { workflows } = useWorkflowLibrary();
  const { tasks } = useScheduledTasks();
  // Should render without errors
  ```

---

## Phase 1 Complete - Handoff Checklist

### Files Created
- [ ] `src/types/workflow-library.types.ts`
- [ ] `src/types/scheduled-task.types.ts`
- [ ] `src/services/database.ts`
- [ ] `src/services/storage.service.ts`
- [ ] `src/hooks/useWorkflowLibrary.ts`
- [ ] `src/hooks/useScheduledTasks.ts`
- [ ] `src/utils/test-data.ts`

### Dependencies Installed
- [ ] dexie
- [ ] dexie-react-hooks
- [ ] uuid
- [ ] @types/dexie
- [ ] @types/uuid
- [ ] tsx (dev dependency)

### Functionality Verified
- [ ] Database initializes without errors
- [ ] All CRUD operations work for workflows
- [ ] All CRUD operations work for tasks
- [ ] React hooks provide live data updates
- [ ] Filtering and search work correctly
- [ ] Test data can be generated
- [ ] No TypeScript errors

### Database Schema
- [ ] `workflowLibrary` store with correct indexes
- [ ] `scheduledTasks` store with correct indexes
- [ ] Migrations strategy in place

### Next Steps
When Phase 1 is complete, proceed to **Phase2.md** to build the API Flow Manager UI.

---

**Phase 1 Status:** ✅ Ready for Implementation
**Estimated Completion Time:** 2-3 days
**Last Updated:** November 8, 2025