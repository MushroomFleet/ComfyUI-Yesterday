// src/components/library/WorkflowCard.tsx

import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { WorkflowLibraryItem } from '../../types/workflow-library.types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { WorkflowDetailModal } from './WorkflowDetailModal';
import { WorkflowRenameDialog } from './WorkflowRenameDialog';
import { WorkflowDeleteDialog } from './WorkflowDeleteDialog';
import { format } from 'date-fns';

interface WorkflowCardProps {
  workflow: WorkflowLibraryItem;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <Card className="bg-card hover:shadow-glow transition-smooth hover:-translate-y-1 border border-border hover:border-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate" title={workflow.name}>
                {workflow.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate" title={workflow.fileName}>
                {workflow.fileName}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetail(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRename(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDelete(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Description */}
          {workflow.metadata.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {workflow.metadata.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {workflow.tags.length > 0 ? (
              workflow.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-secondary/50 hover:bg-secondary transition-smooth"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No tags</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center justify-between w-full">
            <span>{workflow.metadata.nodeCount || 0} nodes</span>
            <span title={format(workflow.createdAt, 'PPpp')}>
              {format(workflow.createdAt, 'MMM d, yyyy')}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Modals */}
      <WorkflowDetailModal
        workflow={workflow}
        open={showDetail}
        onOpenChange={setShowDetail}
      />

      <WorkflowRenameDialog
        workflow={workflow}
        open={showRename}
        onOpenChange={setShowRename}
      />

      <WorkflowDeleteDialog
        workflow={workflow}
        open={showDelete}
        onOpenChange={setShowDelete}
      />
    </>
  );
}
