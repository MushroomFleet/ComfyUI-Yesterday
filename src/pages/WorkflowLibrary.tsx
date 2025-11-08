// src/pages/WorkflowLibrary.tsx

import { useState } from 'react';
import { Upload, Search, Filter } from 'lucide-react';
import { useWorkflowLibrary, useWorkflowTags } from '@/hooks';
import { WorkflowCard } from '@/components/library/WorkflowCard';
import { WorkflowUploadModal } from '@/components/library/WorkflowUploadModal';
import { TagFilterPanel } from '@/components/library/TagFilterPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTransition } from '@/components/shared/PageTransition';

export default function WorkflowLibrary() {
  const { workflows, isLoading, error } = useWorkflowLibrary();
  const allTags = useWorkflowTags();
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter workflows based on search and tags
  const filteredWorkflows = workflows.filter(workflow => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => workflow.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">API Flow Manager</h1>
              <p className="text-muted-foreground mt-1">
                Organize and manage your ComfyUI workflows
              </p>
            </div>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Workflow
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workflows by name, filename, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="transition-smooth"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {selectedTags.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {selectedTags.length}
              </span>
            )}
          </Button>
        </div>

        {/* Tag Filter Panel */}
        {showFilters && (
          <TagFilterPanel
            allTags={allTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Active Filters Summary */}
        {(selectedTags.length > 0 || searchQuery) && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {filteredWorkflows.length} of {workflows.length} workflows
            </span>
            {(selectedTags.length > 0 || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-auto py-1 text-xs"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground">Loading workflows...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && workflows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-card rounded-lg p-8 shadow-elegant max-w-md">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first ComfyUI workflow to get started
              </p>
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Workflow
              </Button>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && workflows.length > 0 && filteredWorkflows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-card rounded-lg p-8 shadow-elegant max-w-md">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}

        {/* Workflow Grid */}
        {!isLoading && filteredWorkflows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && workflows.length > 0 && (
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              Total: {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} •{' '}
              {allTags.length} unique tag{allTags.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <WorkflowUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      />
      </div>
    </PageTransition>
  );
}
