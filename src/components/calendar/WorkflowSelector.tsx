import { useState } from 'react';
import { useWorkflowLibrary } from '@/hooks';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, FileJson, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowSelectorProps {
  selectedWorkflowId: string;
  onSelectWorkflow: (workflowId: string) => void;
}

export function WorkflowSelector({
  selectedWorkflowId,
  onSelectWorkflow,
}: WorkflowSelectorProps) {
  const { workflows, isLoading } = useWorkflowLibrary();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter workflows based on search query
  const filteredWorkflows = workflows.filter((workflow) => {
    const query = searchQuery.toLowerCase();
    return (
      workflow.name.toLowerCase().includes(query) ||
      workflow.fileName.toLowerCase().includes(query) ||
      workflow.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center p-4 border-2 border-dashed rounded-lg border-border">
        <FileJson className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">No workflows available</p>
        <p className="text-xs text-muted-foreground">
          Add workflows to your library first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Workflow List */}
      <ScrollArea className="h-64 rounded-md border border-border">
        <div className="p-2 space-y-2">
          {filteredWorkflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-sm text-muted-foreground">No workflows found</p>
            </div>
          ) : (
            filteredWorkflows.map((workflow) => (
              <button
                key={workflow.id}
                onClick={() => onSelectWorkflow(workflow.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  'hover:border-primary hover:shadow-sm',
                  selectedWorkflowId === workflow.id
                    ? 'border-primary bg-primary/5 shadow-glow'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4 text-primary flex-shrink-0" />
                      <h4 className="font-medium text-sm truncate">
                        {workflow.name}
                      </h4>
                      {selectedWorkflowId === workflow.id && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {workflow.fileName}
                    </p>
                    {workflow.metadata.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {workflow.metadata.description}
                      </p>
                    )}
                    {workflow.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {workflow.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-1.5 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {workflow.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0"
                          >
                            +{workflow.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Selected workflow info */}
      {selectedWorkflowId && (
        <div className="text-xs text-muted-foreground">
          {filteredWorkflows.find((w) => w.id === selectedWorkflowId)?.name || 'Unknown'} selected
        </div>
      )}
    </div>
  );
}
