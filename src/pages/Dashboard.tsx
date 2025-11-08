import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkflowLibrary, useScheduledTasks, useTaskStatistics, useScheduler } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from '@/components/calendar/TaskCard';
import { PageTransition } from '@/components/shared/PageTransition';
import { 
  CalendarPlus, 
  Upload, 
  Zap, 
  TrendingUp,
  Clock,
  CheckCircle2,
  LibraryBig
} from 'lucide-react';
import { TaskStatus } from '@/types/scheduled-task.types';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { workflows } = useWorkflowLibrary();
  const { tasks, deleteTask } = useScheduledTasks();
  const stats = useTaskStatistics();
  const { isRunning, start, executeTaskNow, cancelTask } = useScheduler();

  // Auto-start scheduler if not running
  useEffect(() => {
    if (!isRunning) {
      start();
    }
  }, [isRunning, start]);

  // Get upcoming tasks (next 10)
  const upcomingTasks = tasks
    .filter(t => t.status === TaskStatus.PENDING)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 10);

  // Get completed tasks today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = tasks.filter(t => 
    t.status === TaskStatus.COMPLETED && 
    t.completedAt && 
    new Date(t.completedAt) >= today
  ).length;

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your workflow scheduling system
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <LibraryBig className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-muted-foreground">In your library</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled ahead</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{completedToday}</div>
            <p className="text-xs text-muted-foreground">Tasks executed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/library">
              <Upload className="h-4 w-4 mr-2" />
              Upload Workflow
            </Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/calendar">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule Task
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/test">
              <Zap className="h-4 w-4 mr-2" />
              Test Workflow
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Next {upcomingTasks.length} scheduled workflows</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/calendar">View Calendar</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming tasks scheduled</p>
              <Button asChild className="mt-4" variant="outline">
                <Link to="/calendar">Schedule Your First Task</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-4">
                  <div className="flex-1">
                    <TaskCard
                      task={task}
                      onDelete={async (t) => await deleteTask(t.id)}
                      onExecute={async (t) => await executeTaskNow(t.id)}
                      onCancel={async (t) => await cancelTask(t.id)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap pt-4">
                    {formatDistanceToNow(new Date(task.scheduledTime), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </PageTransition>
  );
}
