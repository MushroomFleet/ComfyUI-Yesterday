// src/components/library/TagFilterPanel.tsx

import { X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface TagFilterPanelProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

export function TagFilterPanel({
  allTags,
  selectedTags,
  onTagToggle,
  onClearFilters,
}: TagFilterPanelProps) {
  if (allTags.length === 0) {
    return (
      <Card className="mb-6 p-4 bg-card/50">
        <p className="text-sm text-muted-foreground text-center">
          No tags available. Add tags to workflows to enable filtering.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mb-6 p-4 bg-card/50 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-auto py-1 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear ({selectedTags.length})
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-smooth ${
                isSelected
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'hover:bg-secondary'
              }`}
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
    </Card>
  );
}
