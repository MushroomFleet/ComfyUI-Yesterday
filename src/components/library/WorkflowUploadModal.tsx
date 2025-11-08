// src/components/library/WorkflowUploadModal.tsx

import { useState } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import { useWorkflowLibrary } from '../../hooks';
import { COMMON_TAGS } from '../../types/workflow-library.types';
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
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

interface WorkflowUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowUploadModal({ open, onOpenChange }: WorkflowUploadModalProps) {
  const { createWorkflow } = useWorkflowLibrary();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-populate name from filename (without extension)
      if (!workflowName) {
        const name = selectedFile.name.replace(/\.[^/.]+$/, '');
        setWorkflowName(name);
      }
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a workflow JSON file',
        variant: 'destructive',
      });
      return;
    }

    if (!workflowName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please provide a name for the workflow',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Read file as JSON
      const text = await file.text();
      const workflow = JSON.parse(text);

      // Create workflow in library
      await createWorkflow({
        name: workflowName.trim(),
        fileName: file.name,
        workflow,
        tags,
        description: description.trim() || undefined,
      });

      toast({
        title: 'Workflow uploaded',
        description: `${workflowName} has been added to your library`,
      });

      // Reset and close
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload workflow',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setWorkflowName('');
    setDescription('');
    setTags([]);
    setCustomTag('');
  };

  const handleClose = () => {
    if (!isUploading) {
      handleReset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Workflow</DialogTitle>
          <DialogDescription>
            Upload a ComfyUI API format JSON workflow to your library
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Workflow File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={isUploading}
                className="flex-1"
              />
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Workflow Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name *</Label>
            <Input
              id="name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="e.g., SDXL Text to Image"
              disabled={isUploading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
              rows={3}
              disabled={isUploading}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            
            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Common Tags */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Common Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(COMMON_TAGS).map(([category, categoryTags]) => (
                  categoryTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer transition-smooth ${
                        tags.includes(tag)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => tags.includes(tag) ? handleRemoveTag(tag) : handleAddTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag..."
                disabled={isUploading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCustomTag}
                disabled={isUploading || !customTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !workflowName.trim() || isUploading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Workflow
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
