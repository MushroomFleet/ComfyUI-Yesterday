// src/components/library/WorkflowRenameDialog.tsx

import { useState } from 'react';
import { Edit } from 'lucide-react';
import { WorkflowLibraryItem } from '../../types/workflow-library.types';
import { useWorkflowLibrary } from '../../hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';

interface WorkflowRenameDialogProps {
  workflow: WorkflowLibraryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowRenameDialog({ workflow, open, onOpenChange }: WorkflowRenameDialogProps) {
  const { updateWorkflow } = useWorkflowLibrary();
  const { toast } = useToast();
  
  const [newName, setNewName] = useState(workflow.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast({
        title: 'Name required',
        description: 'Please enter a valid workflow name',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedName === workflow.name) {
      onOpenChange(false);
      return;
    }

    setIsRenaming(true);

    try {
      await updateWorkflow(workflow.id, { name: trimmedName });

      toast({
        title: 'Workflow renamed',
        description: `Renamed to "${trimmedName}"`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to rename',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isRenaming) {
      setNewName(workflow.name);
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Workflow</DialogTitle>
          <DialogDescription>
            Enter a new name for this workflow
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter workflow name..."
                disabled={isRenaming}
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Current name: <span className="font-medium">{workflow.name}</span>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRenaming || !newName.trim() || newName.trim() === workflow.name}
            >
              {isRenaming ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Renaming...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
