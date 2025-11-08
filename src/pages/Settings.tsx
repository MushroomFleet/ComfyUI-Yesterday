import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useScheduler } from '@/hooks';
import { Settings as SettingsIcon, Power, Clock, Database, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scheduler } from '@/services/scheduler.service';
import { db } from '@/services/database';
import { PageTransition } from '@/components/shared/PageTransition';

export function Settings() {
  const { isRunning, start, stop } = useScheduler();
  const { toast } = useToast();
  const [checkInterval, setCheckInterval] = useState(60); // seconds

  const handleSchedulerToggle = async (enabled: boolean) => {
    if (enabled) {
      await start();
      toast({
        title: 'Scheduler started',
        description: 'Background task execution is now active',
      });
    } else {
      stop();
      toast({
        title: 'Scheduler stopped',
        description: 'Background task execution has been paused',
      });
    }
  };

  const handleIntervalChange = (value: number[]) => {
    const seconds = value[0];
    setCheckInterval(seconds);
    const milliseconds = seconds * 1000;
    scheduler.setCheckInterval(milliseconds);
    
    toast({
      title: 'Check interval updated',
      description: `Scheduler will check for tasks every ${seconds} seconds`,
    });
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }

    try {
      await db.clearAll();
      toast({
        title: 'Data cleared',
        description: 'All workflows and tasks have been removed',
      });
    } catch (error) {
      toast({
        title: 'Error clearing data',
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
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your workflow scheduler preferences
        </p>
      </div>

      {/* Scheduler Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Power className="h-5 w-5 text-primary" />
            <CardTitle>Scheduler Settings</CardTitle>
          </div>
          <CardDescription>
            Control the background task execution engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-start Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="scheduler-enabled" className="text-base">
                Enable Scheduler
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically execute scheduled tasks in the background
              </p>
            </div>
            <Switch
              id="scheduler-enabled"
              checked={isRunning}
              onCheckedChange={handleSchedulerToggle}
            />
          </div>

          {/* Check Interval */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="check-interval" className="text-base">
                Check Interval: {checkInterval} seconds
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              How often the scheduler checks for tasks due for execution
            </p>
            <Slider
              id="check-interval"
              min={10}
              max={300}
              step={10}
              value={[checkInterval]}
              onValueChange={handleIntervalChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10s (Frequent)</span>
              <span>5min (Infrequent)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Data Management</CardTitle>
          </div>
          <CardDescription>
            Manage your workflows and scheduled tasks data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Clear All Data</p>
              <p className="text-sm text-muted-foreground">
                Remove all workflows and scheduled tasks from the database
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearData}
            >
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle>About</CardTitle>
          </div>
          <CardDescription>
            Application information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Application</span>
            <span className="font-medium">DJZ-Yesterday</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ComfyUI Integration</span>
            <span className="font-medium">localhost:8188</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Storage</span>
            <span className="font-medium">IndexedDB (Dexie)</span>
          </div>
        </CardContent>
      </Card>
      </div>
    </PageTransition>
  );
}
