// src/components/library/WorkflowDeleteDialog.tsx

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { WorkflowLibraryItem } from '../../types/workflow-library.types';
import { useWorkflowLibrary } from '../../hooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useToast } from '../../hooks/use-toast';

interface WorkflowDeleteDialogProps {
  workflow: WorkflowLibraryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowDeleteDialog({ workflow, open, onOpenChange }: WorkflowDeleteDialogProps) {
  const { deleteWorkflow } = useWorkflowLibrary();
  const { toast } = useToast();
  
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteWorkflow(workflow.id);

      toast({
        title: 'Workflow deleted',
        description: `"${workflow.name}" has been permanently deleted`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to delete',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete <span className="font-semibold">"{workflow.name}"</span>?
            This action cannot be undone.
            {workflow.tags.length > 0 && (
              <div className="mt-3 rounded-md bg-muted p-3">
                <p className="text-sm font-medium text-foreground mb-1">Workflow details:</p>
                <ul className="text-sm space-y-1">
                  <li>• File: {workflow.fileName}</li>
                  <li>• {workflow.metadata.nodeCount || 0} nodes</li>
                  <li>• Tags: {workflow.tags.join(', ')}</li>
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Workflow
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
