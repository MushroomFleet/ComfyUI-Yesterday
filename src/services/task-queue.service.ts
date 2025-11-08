import { ScheduledTask, TaskStatus, TaskPriority } from '@/types/scheduled-task.types';

/**
 * Task Queue Service
 * Manages the queue of tasks to be executed
 */
export class TaskQueueService {
  private queue: ScheduledTask[] = [];
  private processing = false;

  /**
   * Add a task to the queue
   */
  enqueue(task: ScheduledTask): void {
    // Only add pending tasks
    if (task.status !== TaskStatus.PENDING) {
      return;
    }

    // Check if task is already in queue
    if (this.queue.some(t => t.id === task.id)) {
      return;
    }

    this.queue.push(task);
    this.sortQueue();
  }

  /**
   * Add multiple tasks to the queue
   */
  enqueueBatch(tasks: ScheduledTask[]): void {
    const pendingTasks = tasks.filter(
      task => task.status === TaskStatus.PENDING && 
      !this.queue.some(t => t.id === task.id)
    );

    this.queue.push(...pendingTasks);
    this.sortQueue();
  }

  /**
   * Remove a task from the queue
   */
  dequeue(taskId: string): ScheduledTask | undefined {
    const index = this.queue.findIndex(t => t.id === taskId);
    if (index === -1) {
      return undefined;
    }

    const [task] = this.queue.splice(index, 1);
    return task;
  }

  /**
   * Get the next task to execute
   */
  getNext(): ScheduledTask | undefined {
    if (this.queue.length === 0) {
      return undefined;
    }

    // Return the first task (highest priority, earliest scheduled)
    return this.queue[0];
  }

  /**
   * Peek at the next task without removing it
   */
  peek(): ScheduledTask | undefined {
    return this.queue[0];
  }

  /**
   * Get all tasks in the queue
   */
  getAll(): ScheduledTask[] {
    return [...this.queue];
  }

  /**
   * Get tasks that are ready to execute (scheduled time has passed)
   */
  getReady(): ScheduledTask[] {
    const now = new Date();
    return this.queue.filter(task => 
      new Date(task.scheduledTime) <= now
    );
  }

  /**
   * Get tasks scheduled within a time window
   */
  getWithinWindow(minutes: number): ScheduledTask[] {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + minutes * 60 * 1000);

    return this.queue.filter(task => {
      const scheduledTime = new Date(task.scheduledTime);
      return scheduledTime >= now && scheduledTime <= windowEnd;
    });
  }

  /**
   * Remove a task from the queue by ID
   */
  remove(taskId: string): boolean {
    const index = this.queue.findIndex(t => t.id === taskId);
    if (index === -1) {
      return false;
    }

    this.queue.splice(index, 1);
    return true;
  }

  /**
   * Clear all tasks from the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Sort queue by priority (descending) and scheduled time (ascending)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // First sort by priority (higher priority first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Then sort by scheduled time (earlier first)
      return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
    });
  }

  /**
   * Set processing flag
   */
  setProcessing(value: boolean): void {
    this.processing = value;
  }

  /**
   * Check if queue is currently processing
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const now = new Date();
    const ready = this.getReady().length;
    const upcoming = this.queue.filter(
      task => new Date(task.scheduledTime) > now
    ).length;

    const priorityCounts = {
      urgent: this.queue.filter(t => t.priority === TaskPriority.URGENT).length,
      high: this.queue.filter(t => t.priority === TaskPriority.HIGH).length,
      normal: this.queue.filter(t => t.priority === TaskPriority.NORMAL).length,
      low: this.queue.filter(t => t.priority === TaskPriority.LOW).length,
    };

    return {
      total: this.queue.length,
      ready,
      upcoming,
      processing: this.processing,
      priorityCounts,
    };
  }
}

// Export singleton instance
export const taskQueue = new TaskQueueService();
