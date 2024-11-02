import { format } from 'date-fns';
import { CalendarEvent } from '../../types/calendar';

interface CalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
  onSelect: (date: Date) => void;
}

export function CalendarDay({ date, events, isToday, isSelected, onSelect }: CalendarDayProps) {
  return (
    <div
      onClick={() => onSelect(date)}
      className={`
        min-h-[100px] p-2 border border-gray-200 cursor-pointer
        transition-colors hover:bg-gray-50 relative
        ${isToday ? 'bg-pink-50' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-pink-500 ring-inset' : ''}
      `}
    >
      <div className={`
        text-sm font-medium mb-1
        ${isToday ? 'text-pink-600' : 'text-gray-900'}
      `}>
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="text-xs p-1 rounded bg-pink-100 truncate hover:bg-pink-200"
            title={`${event.summary}\n${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`}
          >
            <div className="font-medium">{event.summary}</div>
            <div className="text-pink-600">
              {format(new Date(event.start), 'HH:mm')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}