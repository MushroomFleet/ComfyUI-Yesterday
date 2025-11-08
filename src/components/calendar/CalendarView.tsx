import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ScheduledTask, TaskStatus } from '@/types/scheduled-task.types';
import { useMemo, useState } from 'react';
import './calendar-styles.css';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  tasks: ScheduledTask[];
  onSelectSlot?: (date: Date) => void;
  onSelectEvent?: (task: ScheduledTask) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ScheduledTask;
}

export function CalendarView({ tasks, onSelectSlot, onSelectEvent }: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert tasks to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return tasks.map(task => {
      const start = new Date(task.scheduledTime);
      const end = new Date(start.getTime() + 3600000); // 1 hour duration default

      return {
        id: task.id,
        title: task.workflowName,
        start,
        end,
        resource: task,
      };
    });
  }, [tasks]);

  // Custom event styling based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '';
    let borderColor = '';

    switch (task.status) {
      case TaskStatus.PENDING:
        backgroundColor = 'hsl(263 70% 60%)';
        borderColor = 'hsl(263 80% 70%)';
        break;
      case TaskStatus.RUNNING:
        backgroundColor = 'hsl(263 80% 70%)';
        borderColor = 'hsl(263 90% 80%)';
        break;
      case TaskStatus.COMPLETED:
        backgroundColor = 'hsl(142 71% 45%)';
        borderColor = 'hsl(142 81% 55%)';
        break;
      case TaskStatus.FAILED:
        backgroundColor = 'hsl(0 72% 51%)';
        borderColor = 'hsl(0 82% 61%)';
        break;
      case TaskStatus.CANCELLED:
        backgroundColor = 'hsl(250 10% 65%)';
        borderColor = 'hsl(250 20% 75%)';
        break;
      case TaskStatus.MISSED:
        backgroundColor = 'hsl(38 92% 50%)';
        borderColor = 'hsl(38 100% 60%)';
        break;
      default:
        backgroundColor = 'hsl(263 70% 60%)';
        borderColor = 'hsl(263 80% 70%)';
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(start);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource);
    }
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={currentView}
        onView={setCurrentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        popup
        views={['month', 'week', 'day', 'agenda']}
        tooltipAccessor={(event) => {
          const task = event.resource as ScheduledTask;
          return `${task.workflowName}\nStatus: ${task.status}\nTime: ${moment(task.scheduledTime).format('LT')}`;
        }}
      />
    </div>
  );
}
