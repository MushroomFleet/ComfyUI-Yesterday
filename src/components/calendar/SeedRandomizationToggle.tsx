import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dices } from 'lucide-react';

interface SeedRandomizationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function SeedRandomizationToggle({
  enabled,
  onToggle,
  disabled = false,
}: SeedRandomizationToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-start space-x-3 flex-1">
        <Dices className={`h-5 w-5 mt-0.5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
        <div className="space-y-1 flex-1">
          <Label
            htmlFor="randomize-seeds"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Randomize seeds on execution
          </Label>
          <p className="text-sm text-muted-foreground">
            {enabled
              ? 'New random seeds will be generated for each execution'
              : 'Use the original seed values from the workflow'}
          </p>
        </div>
      </div>
      <Switch
        id="randomize-seeds"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
}
