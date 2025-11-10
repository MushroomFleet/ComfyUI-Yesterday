import { ScheduledTask, TaskStatus, RecurrenceType } from '@/types/scheduled-task.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Play, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Ban,
  Settings2,
  Repeat,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getOverridesSummary } from '@/utils/workflow-parameters';
import { getRecurrenceLabel, getRecurrenceColorClasses } from '@/utils/recurring-tasks';

interface TaskCardProps {
  task: ScheduledTask;
  onDelete?: (task: ScheduledTask) => void;
  onExecute?: (task: ScheduledTask) => void;
  onCancel?: (task: ScheduledTask) => void;
}

const statusConfig = {
  [TaskStatus.PENDING]: {
    icon: Clock,
    label: 'Pending',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary',
  },
  [TaskStatus.RUNNING]: {
    icon: Play,
    label: 'Running',
    color: 'text-primary-glow',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary-glow',
  },
  [TaskStatus.COMPLETED]: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
  },
  [TaskStatus.FAILED]: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive',
  },
  [TaskStatus.CANCELLED]: {
    icon: Ban,
    label: 'Cancelled',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/10',
    borderColor: 'border-muted',
  },
  [TaskStatus.MISSED]: {
    icon: AlertCircle,
    label: 'Missed',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent',
  },
};

export function TaskCard({ task, onDelete, onExecute, onCancel }: TaskCardProps) {
  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        'bg-card rounded-lg border-l-4 p-4 shadow-sm',
        'hover:shadow-glow transition-all duration-200',
        config.borderColor
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Workflow Name */}
          <h3 className="font-medium text-foreground truncate">
            {task.workflowName}
          </h3>

          {/* Scheduled Time */}
          <p className="text-sm text-muted-foreground mt-1">
            <Clock className="inline h-3 w-3 mr-1" />
            {format(new Date(task.scheduledTime), 'PPp')}
          </p>

          {/* Status Badge */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge
              variant="secondary"
              className={cn('text-xs', config.color, config.bgColor)}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>

            {/* Priority Badge */}
            {task.priority > 1 && (
              <Badge variant="outline" className="text-xs">
                {task.priority === 3 ? 'Urgent' : 'High'} Priority
              </Badge>
            )}

            {/* Recurrence Badge */}
            {task.recurrenceType && task.recurrenceType !== RecurrenceType.NONE && (
              <Badge variant="outline" className={cn('text-xs', getRecurrenceColorClasses(task.recurrenceType))}>
                <Repeat className="h-3 w-3 mr-1" />
                {getRecurrenceLabel(task.recurrenceType)}
              </Badge>
            )}

            {/* Parameter Customization Badge */}
            {task.parameterOverrides && (
              <Badge variant="outline" className="text-xs text-accent border-accent/50">
                <Settings2 className="h-3 w-3 mr-1" />
                {getOverridesSummary(task.parameterOverrides)}
              </Badge>
            )}
          </div>

          {/* Error Message */}
          {task.error && (
            <p className="text-xs text-destructive mt-2 line-clamp-2">
              Error: {task.error}
            </p>
          )}

          {/* Execution Times */}
          {task.startedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Started: {format(new Date(task.startedAt), 'Pp')}
            </p>
          )}
          {task.completedAt && (
            <p className="text-xs text-muted-foreground">
              Completed: {format(new Date(task.completedAt), 'Pp')}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {task.status === TaskStatus.PENDING && onExecute && (
              <>
                <DropdownMenuItem onClick={() => onExecute(task)}>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Now
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {task.status === TaskStatus.PENDING && onCancel && (
              <>
                <DropdownMenuItem onClick={() => onCancel(task)}>
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(task)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
