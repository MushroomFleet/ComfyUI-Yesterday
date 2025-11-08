import { useState, useEffect } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ScheduleTaskModal } from '@/components/calendar/ScheduleTaskModal';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, Power } from 'lucide-react';
import { useScheduledTasks, useScheduler } from '@/hooks';
import { TaskCard } from '@/components/calendar/TaskCard';
import { ScheduledTask } from '@/types/scheduled-task.types';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/shared/PageTransition';

export function Calendar() {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | undefined>();
  const { tasks, isLoading, deleteTask } = useScheduledTasks();
  const { isRunning, stats, start, stop, executeTaskNow, cancelTask } = useScheduler();

  // Start scheduler on mount
  useEffect(() => {
    if (!isRunning) {
      start();
    }
  }, [isRunning, start]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleClick = () => {
    setSelectedDate(new Date());
    setIsScheduleModalOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Calendar Scheduler</h1>
              <p className="text-muted-foreground">
                Schedule workflows for automatic execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={isRunning ? 'default' : 'secondary'}
              className={isRunning ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              <Power className="h-3 w-3 mr-1" />
              Scheduler {isRunning ? 'Running' : 'Stopped'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={isRunning ? stop : start}
            >
              {isRunning ? 'Stop' : 'Start'} Scheduler
            </Button>
            <Button
              onClick={handleScheduleClick}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Task
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-card rounded-lg p-6 shadow-elegant">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            </div>
          ) : (
            <CalendarView
              tasks={tasks}
              onSelectSlot={handleDateSelect}
              onSelectEvent={(task) => {
                setSelectedTask(task);
              }}
            />
          )}
        </div>

        {/* Selected Task Details */}
        {selectedTask && (
          <div className="bg-card rounded-lg p-6 shadow-elegant">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Task Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTask(undefined)}
              >
                Close
              </Button>
            </div>
            <TaskCard
              task={selectedTask}
              onDelete={async (task) => {
                await deleteTask(task.id);
                setSelectedTask(undefined);
              }}
              onExecute={async (task) => {
                await executeTaskNow(task.id);
                setSelectedTask(undefined);
              }}
              onCancel={async (task) => {
                await cancelTask(task.id);
                setSelectedTask(undefined);
              }}
            />
          </div>
        )}

        {/* Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-primary">
              {tasks.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-500">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-destructive">
              {tasks.filter(t => t.status === 'failed').length}
            </p>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Queue</p>
            <p className="text-2xl font-bold text-accent">
              {stats.queueStats.ready}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Task Modal */}
      <ScheduleTaskModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        defaultDate={selectedDate}
      />
      </div>
    </PageTransition>
  );
}
