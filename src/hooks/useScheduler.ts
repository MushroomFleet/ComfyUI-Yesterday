import { useState, useEffect, useCallback } from 'react';
import { scheduler } from '@/services/scheduler.service';
import { ScheduledTask } from '@/types/scheduled-task.types';

/**
 * Hook for interacting with the scheduler service
 */
export function useScheduler() {
  const [isRunning, setIsRunning] = useState(scheduler.running());
  const [stats, setStats] = useState(scheduler.getStats());

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(scheduler.getStats());
      setIsRunning(scheduler.running());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Subscribe to task events
  useEffect(() => {
    const unsubscribe = scheduler.on((task: ScheduledTask, event: string) => {
      console.log(`Task event: ${event}`, task);
      // Update stats when tasks change
      setStats(scheduler.getStats());
    });

    return unsubscribe;
  }, []);

  const start = useCallback(async () => {
    await scheduler.start();
    setIsRunning(true);
    setStats(scheduler.getStats());
  }, []);

  const stop = useCallback(() => {
    scheduler.stop();
    setIsRunning(false);
    setStats(scheduler.getStats());
  }, []);

  const executeTaskNow = useCallback(async (taskId: string) => {
    await scheduler.executeTaskNow(taskId);
  }, []);

  const cancelTask = useCallback(async (taskId: string) => {
    await scheduler.cancelTask(taskId);
  }, []);

  const refreshQueue = useCallback(async () => {
    await scheduler.refreshQueue();
    setStats(scheduler.getStats());
  }, []);

  return {
    isRunning,
    stats,
    start,
    stop,
    executeTaskNow,
    cancelTask,
    refreshQueue,
  };
}
