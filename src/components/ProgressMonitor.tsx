import React from 'react';
import { ExecutionStatus } from '../types/comfyui.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { AlertCircle, Activity } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface ProgressMonitorProps {
  status: ExecutionStatus;
}

export const ProgressMonitor: React.FC<ProgressMonitorProps> = ({ status }) => {
  if (!status.isExecuting && !status.error) return null;

  const progressPercentage = status.maxProgress > 0 
    ? Math.round((status.progress / status.maxProgress) * 100)
    : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          Execution Status
        </CardTitle>
        <CardDescription>Real-time progress monitoring</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        ) : (
          <>
            {status.currentNode && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Node</p>
                <p className="font-mono text-sm font-medium">{status.currentNode}</p>
              </div>
            )}
            
            {status.maxProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground text-right">
                  {status.progress} / {status.maxProgress}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
