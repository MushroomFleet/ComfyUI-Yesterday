import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useScheduledTasks } from '@/hooks';
import { TaskPriority, RecurrenceType } from '@/types/scheduled-task.types';
import { ParameterOverrides } from '@/types/workflow-parameters.types';
import { WorkflowSelector } from './WorkflowSelector';
import { TimeSlotSelector } from './TimeSlotSelector';
import { WorkflowParameterPanel } from './WorkflowParameterPanel';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowLibrary } from '@/hooks/useWorkflowLibrary';
import { getOverridesSummary } from '@/utils/workflow-parameters';
import { generateRecurringTasks, getRecurrenceSummary } from '@/utils/recurring-tasks';
import { Calendar, Clock, Zap, Settings2, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScheduleTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

export function ScheduleTaskModal({
  open,
  onOpenChange,
  defaultDate,
}: ScheduleTaskModalProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate || new Date());
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.NORMAL);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(RecurrenceType.NONE);
  const [parameterOverrides, setParameterOverrides] = useState<ParameterOverrides>({
    randomizeSeeds: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTask, createTasksBulk } = useScheduledTasks();
  const { workflows } = useWorkflowLibrary();
  const { toast } = useToast();

  // Get the selected workflow
  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId);

  // Update selected date when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setSelectedDate(defaultDate);
    }
  }, [defaultDate]);

  const handleSubmit = async () => {
    if (!selectedWorkflowId) {
      toast({
        title: 'No workflow selected',
        description: 'Please select a workflow to schedule.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Check if scheduled time is in the past
      if (scheduledDateTime < new Date()) {
        toast({
          title: 'Invalid time',
          description: 'Cannot schedule tasks in the past.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare parameter overrides (only include if there are actual overrides)
      const hasOverrides = parameterOverrides.randomizeSeeds || 
                          (parameterOverrides.promptOverrides && Object.keys(parameterOverrides.promptOverrides).length > 0);

      const baseTaskInput = {
        workflowId: selectedWorkflowId,
        scheduledTime: scheduledDateTime,
        priority,
        maxRetries: 3,
        parameterOverrides: hasOverrides ? parameterOverrides : undefined,
      };

      // Generate tasks based on recurrence type
      if (recurrenceType === RecurrenceType.NONE) {
        // Single task
        await createTask(baseTaskInput);
        
        const overridesSummary = hasOverrides ? ` (${getOverridesSummary(parameterOverrides)})` : '';
        toast({
          title: 'Task scheduled',
          description: `Workflow will execute on ${scheduledDateTime.toLocaleDateString()} at ${selectedTime}${overridesSummary}`,
        });
      } else {
        // Recurring tasks
        const taskInputs = generateRecurringTasks(baseTaskInput, recurrenceType);
        await createTasksBulk(taskInputs);
        
        toast({
          title: 'Recurring tasks scheduled',
          description: `Created ${taskInputs.length} ${recurrenceType} tasks over 3 months`,
        });
      }

      // Reset form
      setSelectedWorkflowId('');
      setSelectedTime('12:00');
      setPriority(TaskPriority.NORMAL);
      setRecurrenceType(RecurrenceType.NONE);
      setParameterOverrides({ randomizeSeeds: false });
      onOpenChange(false);
    } catch (error) {
      console.error('Error scheduling task:', error);
      toast({
        title: 'Failed to schedule task',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Workflow Execution
          </DialogTitle>
          <DialogDescription>
            Select a workflow and choose when to execute it automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Workflow Selection */}
          <div className="space-y-2">
            <Label htmlFor="workflow" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              Workflow
            </Label>
            <WorkflowSelector
              selectedWorkflowId={selectedWorkflowId}
              onSelectWorkflow={setSelectedWorkflowId}
            />
          </div>

          {/* Date and Time Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Date & Time
            </Label>
            <TimeSlotSelector
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />
          </div>

          {/* Recurrence Selection */}
          <div className="space-y-2">
            <Label htmlFor="recurrence" className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-accent" />
              Recurrence
            </Label>
            <Select
              value={recurrenceType}
              onValueChange={(value) => setRecurrenceType(value as RecurrenceType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RecurrenceType.NONE}>One-time</SelectItem>
                <SelectItem value={RecurrenceType.DAILY}>Daily</SelectItem>
                <SelectItem value={RecurrenceType.WEEKLY}>Weekly</SelectItem>
                <SelectItem value={RecurrenceType.MONTHLY}>Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getRecurrenceSummary(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 
                  parseInt(selectedTime.split(':')[0]), parseInt(selectedTime.split(':')[1])),
                recurrenceType
              )}
            </p>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority.toString()}
              onValueChange={(value) => setPriority(Number(value) as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskPriority.LOW.toString()}>
                  Low Priority
                </SelectItem>
                <SelectItem value={TaskPriority.NORMAL.toString()}>
                  Normal Priority
                </SelectItem>
                <SelectItem value={TaskPriority.HIGH.toString()}>
                  High Priority
                </SelectItem>
                <SelectItem value={TaskPriority.URGENT.toString()}>
                  Urgent Priority
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Higher priority tasks execute first when multiple tasks are scheduled at the same time.
            </p>
          </div>

          {/* Parameter Customization */}
          {selectedWorkflow && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-accent" />
                  <Label className="text-base">Customize Parameters</Label>
                  {(parameterOverrides.randomizeSeeds || 
                    (parameterOverrides.promptOverrides && Object.keys(parameterOverrides.promptOverrides).length > 0)) && (
                    <Badge variant="default" className="text-xs">
                      {getOverridesSummary(parameterOverrides)}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Customize seed and prompt parameters for this scheduled task.
                </p>
                <WorkflowParameterPanel
                  workflow={selectedWorkflow}
                  onOverridesChange={setParameterOverrides}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedWorkflowId}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
