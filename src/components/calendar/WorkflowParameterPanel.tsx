import { useState } from 'react';
import { WorkflowLibraryItem } from '@/types/workflow-library.types';
import { ParameterOverrides } from '@/types/workflow-parameters.types';
import {
  analyzeWorkflowParameters,
  validatePromptText,
} from '@/utils/workflow-parameters';
import { SeedRandomizationToggle } from './SeedRandomizationToggle';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, RotateCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkflowParameterPanelProps {
  workflow: WorkflowLibraryItem;
  onOverridesChange: (overrides: ParameterOverrides) => void;
}

export function WorkflowParameterPanel({
  workflow,
  onOverridesChange,
}: WorkflowParameterPanelProps) {
  const analysis = analyzeWorkflowParameters(workflow.workflow);
  
  const [randomizeSeeds, setRandomizeSeeds] = useState(false);
  const [promptOverrides, setPromptOverrides] = useState<Record<string, string>>({});
  const [promptErrors, setPromptErrors] = useState<Record<string, string>>({});

  // Update parent whenever overrides change
  const updateOverrides = (newRandomize: boolean, newPrompts: Record<string, string>) => {
    const hasPromptChanges = Object.keys(newPrompts).length > 0;
    onOverridesChange({
      randomizeSeeds: newRandomize,
      promptOverrides: hasPromptChanges ? newPrompts : undefined,
    });
  };

  const handleSeedToggle = (enabled: boolean) => {
    setRandomizeSeeds(enabled);
    updateOverrides(enabled, promptOverrides);
  };

  const handlePromptChange = (nodeId: string, value: string) => {
    const validation = validatePromptText(value);
    
    // Update errors
    const newErrors = { ...promptErrors };
    if (validation.isValid) {
      delete newErrors[nodeId];
    } else {
      newErrors[nodeId] = validation.error || 'Invalid prompt';
    }
    setPromptErrors(newErrors);

    // Update prompts
    const newPrompts = { ...promptOverrides };
    if (value.trim() === '') {
      delete newPrompts[nodeId];
    } else {
      newPrompts[nodeId] = value;
    }
    setPromptOverrides(newPrompts);
    updateOverrides(randomizeSeeds, newPrompts);
  };

  const handleResetPrompt = (nodeId: string, originalValue: string) => {
    const newPrompts = { ...promptOverrides };
    delete newPrompts[nodeId];
    setPromptOverrides(newPrompts);
    
    const newErrors = { ...promptErrors };
    delete newErrors[nodeId];
    setPromptErrors(newErrors);
    
    updateOverrides(randomizeSeeds, newPrompts);
  };

  const hasAnyParameters = analysis.hasSeedNodes || analysis.hasPromptNodes;

  if (!hasAnyParameters) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This workflow does not have any editable seed or prompt parameters.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seeds Section */}
      {analysis.hasSeedNodes && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Seed Parameters</h3>
            <Badge variant="secondary" className="text-xs">
              {analysis.seeds.length} node{analysis.seeds.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <SeedRandomizationToggle
            enabled={randomizeSeeds}
            onToggle={handleSeedToggle}
          />

          {/* Display detected seed nodes */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Detected Seed Nodes:</p>
            <div className="space-y-1">
              {analysis.seeds.map((seed) => (
                <div key={seed.nodeId} className="text-sm flex justify-between items-center">
                  <span className="text-muted-foreground">{seed.nodeName}</span>
                  <code className="text-xs bg-background px-2 py-0.5 rounded">
                    {randomizeSeeds ? 'Random' : `seed: ${seed.currentValue}`}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Separator if both sections present */}
      {analysis.hasSeedNodes && analysis.hasPromptNodes && <Separator />}

      {/* Prompts Section */}
      {analysis.hasPromptNodes && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Prompt Parameters</h3>
            <Badge variant="secondary" className="text-xs">
              {analysis.prompts.length} node{analysis.prompts.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Edit prompt text for any node. Leave unchanged to use original values.
          </p>

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4 pr-4">
              {analysis.prompts.map((prompt) => {
                const isModified = promptOverrides[prompt.nodeId] !== undefined;
                const currentValue = promptOverrides[prompt.nodeId] || prompt.currentValue;
                const error = promptErrors[prompt.nodeId];
                const charCount = currentValue.length;

                return (
                  <div
                    key={prompt.nodeId}
                    className="space-y-2 rounded-lg border border-border bg-card/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`prompt-${prompt.nodeId}`} className="text-sm font-medium">
                        {prompt.nodeName}
                      </Label>
                      <div className="flex items-center gap-2">
                        {isModified && (
                          <Badge variant="outline" className="text-xs">
                            Modified
                          </Badge>
                        )}
                        {isModified && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPrompt(prompt.nodeId, prompt.currentValue)}
                            className="h-7 px-2"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>

                    <Textarea
                      id={`prompt-${prompt.nodeId}`}
                      value={currentValue}
                      onChange={(e) => handlePromptChange(prompt.nodeId, e.target.value)}
                      className="min-h-[100px] font-mono text-xs"
                      placeholder="Enter prompt text..."
                    />

                    <div className="flex justify-between items-center text-xs">
                      <span className={`${charCount > 10000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {charCount.toLocaleString()} characters
                      </span>
                      {error && (
                        <span className="text-destructive">{error}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
