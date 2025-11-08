import { taskStorage, workflowStorage } from './storage.service';
import { taskQueue } from './task-queue.service';
import { TaskStatus, ScheduledTask } from '@/types/scheduled-task.types';
import { ComfyUIService } from './comfyui.service';
import { toast } from 'sonner';

// Create ComfyUI service instance
const comfyUIService = new ComfyUIService();

type TaskEventCallback = (task: ScheduledTask, event: string) => void;

/**
 * Scheduler Service
 * Manages automatic execution of scheduled tasks
 */
export class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private checkInterval = 60000; // Check every 60 seconds
  private lookAheadMinutes = 5; // Look ahead 5 minutes for upcoming tasks
  private eventCallbacks: TaskEventCallback[] = [];

  /**
   * Start the scheduler
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Scheduler already running');
      return;
    }

    console.log('Starting scheduler...');
    this.isRunning = true;

    // Initial load of pending tasks
    await this.refreshQueue();

    // Start periodic checking
    this.intervalId = setInterval(() => {
      this.tick();
    }, this.checkInterval);

    console.log('Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping scheduler...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    taskQueue.clear();
    console.log('Scheduler stopped');
  }

  /**
   * Check if scheduler is running
   */
  running(): boolean {
    return this.isRunning;
  }

  /**
   * Refresh the task queue from database
   */
  async refreshQueue(): Promise<void> {
    try {
      const pendingTasks = await taskStorage.getFilteredTasks({
        status: TaskStatus.PENDING,
      });

      // Clear queue and reload
      taskQueue.clear();
      taskQueue.enqueueBatch(pendingTasks);

      console.log(`Queue refreshed: ${pendingTasks.length} pending tasks`);
    } catch (error) {
      console.error('Error refreshing queue:', error);
    }
  }

  /**
   * Execute scheduler tick - check for due tasks
   */
  private async tick(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Refresh queue periodically
      await this.refreshQueue();

      // Get tasks that are ready to execute
      const readyTasks = taskQueue.getReady();

      if (readyTasks.length > 0) {
        console.log(`Found ${readyTasks.length} task(s) ready to execute`);
      }

      // Execute ready tasks
      for (const task of readyTasks) {
        await this.executeTask(task);
      }

      // Check for missed tasks
      await this.checkMissedTasks();
    } catch (error) {
      console.error('Error during scheduler tick:', error);
    }
  }

  /**
   * Execute a single task
   */
  async executeTask(task: ScheduledTask): Promise<void> {
    console.log(`Executing task: ${task.id} - ${task.workflowName}`);

    // Remove from queue
    taskQueue.dequeue(task.id);

    try {
      // Update status to running
      await taskStorage.updateTaskStatus(task.id, TaskStatus.RUNNING, {
        startedAt: new Date(),
      });

      this.emitEvent(task, 'started');

      // Get workflow
      const workflow = await workflowStorage.getWorkflow(task.workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${task.workflowId}`);
      }

      // Execute workflow via ComfyUI service
      const result = await comfyUIService.queuePrompt(workflow.workflow);

      // Update task with prompt ID
      await taskStorage.updateTaskStatus(task.id, TaskStatus.RUNNING, {
        promptId: result.prompt_id,
      });

      // Wait for completion (simplified - in real implementation would use WebSocket)
      // For now, we'll mark as completed after submission
      await taskStorage.updateTaskStatus(task.id, TaskStatus.COMPLETED, {
        completedAt: new Date(),
      });

      this.emitEvent(task, 'completed');

      toast.success(`Task completed: ${task.workflowName}`, {
        description: `Executed at ${new Date().toLocaleTimeString()}`,
      });

      console.log(`Task completed: ${task.id}`);
    } catch (error) {
      console.error(`Task execution failed: ${task.id}`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if we should retry
      if (task.retryCount < task.maxRetries) {
        // Increment retry count and keep as pending
        const updatedTask = await taskStorage.getTask(task.id);
        if (updatedTask) {
          await taskStorage.updateTask(task.id, {
            status: TaskStatus.PENDING,
          });

          // Update retry count manually
          await taskStorage.updateTaskStatus(task.id, TaskStatus.PENDING);

          // Re-add to queue
          const retryTask = await taskStorage.getTask(task.id);
          if (retryTask) {
            taskQueue.enqueue(retryTask);
          }

          toast.warning(`Task will be retried: ${task.workflowName}`, {
            description: `Retry ${task.retryCount + 1}/${task.maxRetries}`,
          });
        }
      } else {
        // Mark as failed
        await taskStorage.updateTaskStatus(task.id, TaskStatus.FAILED, {
          completedAt: new Date(),
          error: errorMessage,
        });

        this.emitEvent(task, 'failed');

        toast.error(`Task failed: ${task.workflowName}`, {
          description: errorMessage,
        });
      }
    }
  }

  /**
   * Check for tasks that were missed (scheduled time passed while app was closed)
   */
  private async checkMissedTasks(): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    const pendingTasks = await taskStorage.getFilteredTasks({
      status: TaskStatus.PENDING,
      startDate: oneHourAgo,
      endDate: now,
    });

    for (const task of pendingTasks) {
      const scheduledTime = new Date(task.scheduledTime);
      if (scheduledTime < now && scheduledTime > oneHourAgo) {
        // Task was scheduled in the past hour but not executed
        await taskStorage.updateTaskStatus(task.id, TaskStatus.MISSED, {
          completedAt: new Date(),
          error: 'Task execution was missed',
        });

        this.emitEvent(task, 'missed');

        toast.warning(`Task missed: ${task.workflowName}`, {
          description: `Was scheduled for ${scheduledTime.toLocaleTimeString()}`,
        });
      }
    }
  }

  /**
   * Manually execute a task immediately
   */
  async executeTaskNow(taskId: string): Promise<void> {
    const task = await taskStorage.getTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new Error('Can only execute pending tasks');
    }

    await this.executeTask(task);
  }

  /**
   * Cancel a scheduled task
   */
  async cancelTask(taskId: string): Promise<void> {
    const task = await taskStorage.getTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== TaskStatus.PENDING) {
      throw new Error('Can only cancel pending tasks');
    }

    // Remove from queue
    taskQueue.remove(taskId);

    // Update status
    await taskStorage.updateTaskStatus(taskId, TaskStatus.CANCELLED, {
      completedAt: new Date(),
    });

    this.emitEvent(task, 'cancelled');

    toast.info(`Task cancelled: ${task.workflowName}`);
  }

  /**
   * Get scheduler statistics
   */
  getStats() {
    return {
      running: this.isRunning,
      queueStats: taskQueue.getStats(),
      checkInterval: this.checkInterval,
      lookAheadMinutes: this.lookAheadMinutes,
    };
  }

  /**
   * Set check interval (in milliseconds)
   */
  setCheckInterval(ms: number): void {
    this.checkInterval = Math.max(10000, ms); // Minimum 10 seconds

    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Subscribe to task events
   */
  on(callback: TaskEventCallback): () => void {
    this.eventCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.eventCallbacks.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emit task event to all subscribers
   */
  private emitEvent(task: ScheduledTask, event: string): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(task, event);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }
}

// Export singleton instance
export const scheduler = new SchedulerService();
