import { useState } from 'react';
import { useScheduledTasks } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from '@/components/calendar/TaskCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { History as HistoryIcon, Filter, Trash2 } from 'lucide-react';
import { TaskStatus } from '@/types/scheduled-task.types';
import { taskStorage } from '@/services/storage.service';
import { useToast } from '@/hooks/use-toast';
import { PageTransition } from '@/components/shared/PageTransition';

export function History() {
  const { tasks, deleteTask } = useScheduledTasks();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter tasks to show only completed, failed, cancelled, or missed
  const completedStatuses = [
    TaskStatus.COMPLETED,
    TaskStatus.FAILED,
    TaskStatus.CANCELLED,
    TaskStatus.MISSED,
  ];

  let filteredTasks = tasks.filter(t => completedStatuses.includes(t.status));

  // Apply status filter
  if (statusFilter !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
  }

  // Sort by completion time (most recent first)
  filteredTasks.sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA;
  });

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all completed task history? This cannot be undone.')) {
      return;
    }

    try {
      // Delete all completed tasks
      for (const task of filteredTasks) {
        await deleteTask(task.id);
      }

      toast({
        title: 'History cleared',
        description: `Removed ${filteredTasks.length} task(s) from history`,
      });
    } catch (error) {
      toast({
        title: 'Error clearing history',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Task History</h1>
        <p className="text-muted-foreground mt-1">
          View completed, failed, and cancelled workflow executions
        </p>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle>Filters</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={filteredTasks.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={TaskStatus.FAILED}>Failed</SelectItem>
                  <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
                  <SelectItem value={TaskStatus.MISSED}>Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Total</p>
              <p className="text-2xl font-bold text-primary">{filteredTasks.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} in history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No task history found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {statusFilter !== 'all'
                  ? 'Try changing the status filter'
                  : 'Completed tasks will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={async (t) => await deleteTask(t.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </PageTransition>
  );
}
