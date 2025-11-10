// src/utils/recurring-tasks.ts

import { addDays, addWeeks, addMonths, differenceInDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskInput, RecurrenceType } from '../types/scheduled-task.types';

/**
 * Generate recurring task inputs for a 3-month period
 * @param baseInput - The initial task configuration
 * @param recurrenceType - Type of recurrence (daily, weekly, monthly)
 * @returns Array of CreateTaskInput for all occurrences
 */
export function generateRecurringTasks(
  baseInput: Omit<CreateTaskInput, 'recurrenceType' | 'seriesId'>,
  recurrenceType: RecurrenceType
): CreateTaskInput[] {
  // For non-recurring tasks, return single task
  if (recurrenceType === RecurrenceType.NONE) {
    return [{
      ...baseInput,
      recurrenceType: RecurrenceType.NONE,
    }];
  }

  const tasks: CreateTaskInput[] = [];
  const seriesId = uuidv4(); // Generate unique series ID for all tasks in this series
  const startDate = new Date(baseInput.scheduledTime);
  const endDate = addMonths(startDate, 3); // 3 months from start date

  let currentDate = new Date(startDate);

  // Generate tasks based on recurrence type
  switch (recurrenceType) {
    case RecurrenceType.DAILY:
      // Generate daily tasks for 3 months (~90 tasks)
      while (currentDate <= endDate) {
        tasks.push({
          ...baseInput,
          scheduledTime: new Date(currentDate),
          recurrenceType: RecurrenceType.DAILY,
          seriesId,
        });
        currentDate = addDays(currentDate, 1);
      }
      break;

    case RecurrenceType.WEEKLY:
      // Generate weekly tasks for 3 months (~13 tasks)
      while (currentDate <= endDate) {
        tasks.push({
          ...baseInput,
          scheduledTime: new Date(currentDate),
          recurrenceType: RecurrenceType.WEEKLY,
          seriesId,
        });
        currentDate = addWeeks(currentDate, 1);
      }
      break;

    case RecurrenceType.MONTHLY:
      // Generate monthly tasks for 3 months (3 tasks)
      while (currentDate <= endDate) {
        tasks.push({
          ...baseInput,
          scheduledTime: new Date(currentDate),
          recurrenceType: RecurrenceType.MONTHLY,
          seriesId,
        });
        currentDate = addMonths(currentDate, 1);
      }
      break;

    default:
      // Fallback to single task
      tasks.push({
        ...baseInput,
        recurrenceType: RecurrenceType.NONE,
      });
  }

  return tasks;
}

/**
 * Get a summary of how many tasks will be generated
 * @param startDate - The start date for the recurrence
 * @param recurrenceType - Type of recurrence
 * @returns Human-readable summary string
 */
export function getRecurrenceSummary(startDate: Date, recurrenceType: RecurrenceType): string {
  const endDate = addMonths(startDate, 3);
  const totalDays = differenceInDays(endDate, startDate);

  switch (recurrenceType) {
    case RecurrenceType.NONE:
      return 'This will create 1 task';
    
    case RecurrenceType.DAILY:
      const dailyCount = totalDays + 1; // +1 to include start date
      return `This will create ${dailyCount} tasks over 3 months (daily)`;
    
    case RecurrenceType.WEEKLY:
      const weeklyCount = Math.floor(totalDays / 7) + 1;
      return `This will create ~${weeklyCount} tasks over 3 months (weekly)`;
    
    case RecurrenceType.MONTHLY:
      return 'This will create 3 tasks over 3 months (monthly)';
    
    default:
      return 'This will create 1 task';
  }
}

/**
 * Get display label for recurrence type
 */
export function getRecurrenceLabel(recurrenceType: RecurrenceType): string {
  switch (recurrenceType) {
    case RecurrenceType.NONE:
      return 'One-time';
    case RecurrenceType.DAILY:
      return 'Daily';
    case RecurrenceType.WEEKLY:
      return 'Weekly';
    case RecurrenceType.MONTHLY:
      return 'Monthly';
    default:
      return 'One-time';
  }
}

/**
 * Get color classes for recurrence type badges
 */
export function getRecurrenceColorClasses(recurrenceType: RecurrenceType): string {
  switch (recurrenceType) {
    case RecurrenceType.NONE:
      return 'bg-primary/10 text-primary border-primary/50'; // Purple (default)
    case RecurrenceType.DAILY:
      return 'bg-blue-500/10 text-blue-400 border-blue-500/50'; // Blue
    case RecurrenceType.WEEKLY:
      return 'bg-green-500/10 text-green-400 border-green-500/50'; // Green
    case RecurrenceType.MONTHLY:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/50'; // Amber/Gold
    default:
      return 'bg-primary/10 text-primary border-primary/50';
  }
}
