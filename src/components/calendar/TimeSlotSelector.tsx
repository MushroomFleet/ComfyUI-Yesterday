import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface TimeSlotSelectorProps {
  selectedDate: Date;
  selectedTime: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}

export function TimeSlotSelector({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: TimeSlotSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Date Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="time">
          Time
        </label>
        <Input
          id="time"
          type="time"
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
}
