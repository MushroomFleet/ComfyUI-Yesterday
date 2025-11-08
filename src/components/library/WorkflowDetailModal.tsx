// src/components/library/WorkflowDetailModal.tsx

import { WorkflowLibraryItem } from '../../types/workflow-library.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { format } from 'date-fns';

interface WorkflowDetailModalProps {
  workflow: WorkflowLibraryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowDetailModal({ workflow, open, onOpenChange }: WorkflowDetailModalProps) {
  const nodeCount = workflow.metadata.nodeCount || Object.keys(workflow.workflow).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{workflow.name}</DialogTitle>
          <DialogDescription>{workflow.fileName}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {/* Description */}
            {workflow.metadata.description && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{workflow.metadata.description}</p>
              </div>
            )}

            {/* Tags */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {workflow.tags.length > 0 ? (
                  workflow.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground italic">No tags</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Node Count:</span>
                <span className="ml-2 font-medium">{nodeCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2 font-medium">
                  {format(workflow.createdAt, 'PPp')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>
                <span className="ml-2 font-medium">
                  {format(workflow.updatedAt, 'PPp')}
                </span>
              </div>
              {workflow.metadata.executionCount !== undefined && (
                <div>
                  <span className="text-muted-foreground">Executions:</span>
                  <span className="ml-2 font-medium">{workflow.metadata.executionCount}</span>
                </div>
              )}
              {workflow.metadata.lastExecuted && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Last Executed:</span>
                  <span className="ml-2 font-medium">
                    {format(workflow.metadata.lastExecuted, 'PPp')}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Workflow Structure Preview */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Workflow Structure</h4>
              <div className="bg-muted/50 rounded-md p-3 max-h-60 overflow-auto">
                <pre className="text-xs font-mono">
                  {JSON.stringify(
                    Object.entries(workflow.workflow).reduce((acc, [id, node]) => {
                      acc[id] = {
                        class_type: node.class_type,
                        ...(node._meta?.title && { title: node._meta.title }),
                      };
                      return acc;
                    }, {} as Record<string, unknown>),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
