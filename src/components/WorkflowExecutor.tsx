import React from 'react';
import { Workflow } from '../types/comfyui.types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Play, FileJson } from 'lucide-react';

interface WorkflowExecutorProps {
  workflow: Workflow | null;
  workflowName: string;
  onExecute: () => void;
  isExecuting: boolean;
  disabled?: boolean;
}

export const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({
  workflow,
  workflowName,
  onExecute,
  isExecuting,
  disabled
}) => {
  if (!workflow) return null;

  const nodeCount = Object.keys(workflow).length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" />
          Loaded Workflow
        </CardTitle>
        <CardDescription>Ready to execute</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Filename:</span>
            <span className="font-medium">{workflowName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Nodes:</span>
            <span className="font-medium">{nodeCount}</span>
          </div>
        </div>
        
        <Button
          onClick={onExecute}
          disabled={disabled || isExecuting}
          size="lg"
          className="w-full gap-2"
        >
          <Play className="h-5 w-5" />
          {isExecuting ? 'Executing...' : 'Execute Workflow'}
        </Button>
      </CardContent>
    </Card>
  );
};
