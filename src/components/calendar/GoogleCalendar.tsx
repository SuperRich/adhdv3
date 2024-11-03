import { useState, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
  isSameMonth,
  format,
} from 'date-fns';
import { googleCalendarService } from '../../services/googleCalendarService';
import { CalendarEvent } from '../../types/calendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

export function GoogleCalendar({ onDateSelect, selectedDate }: GoogleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthEvents();
  }, [currentDate]);

  useEffect(() => {
    const handleCalendarUpdate = () => {
      fetchMonthEvents();
    };

    window.addEventListener('calendar-updated', handleCalendarUpdate);
    return () => {
      window.removeEventListener('calendar-updated', handleCalendarUpdate);
    };
  }, []);

  const fetchMonthEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const monthEvents = await googleCalendarService.getMonthEvents(start, end);
      setEvents(monthEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfMonth = getDay(start);
    const paddingDays = Array(firstDayOfMonth).fill(null);
    return [...paddingDays, ...days];
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start), date) && 
      isSameMonth(new Date(event.start), currentDate)
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
          onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
        />
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        
        {getDaysInMonth().map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="calendar-day disabled" />;
          }

          const dayEvents = getEventsForDay(date);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={`calendar-day ${
                isToday(date) ? 'today' : ''
              } ${
                selectedDate && isSameDay(date, selectedDate) ? 'selected' : ''
              } ${
                hasEvents ? 'has-slots' : ''
              }`}
            >
              <span>{format(date, 'd')}</span>
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative group"
                >
                  <div
                    className="time-slot available group-hover:bg-pink-100"
                    title={`${event.summary}\n${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`}
                  >
                    {format(new Date(event.start), 'HH:mm')}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this event?')) {
                          googleCalendarService.deleteEvent(event.id)
                            .then(() => {
                              window.dispatchEvent(new Event('calendar-updated'));
                              toast.success('Event deleted successfully');
                            })
                            .catch(() => {
                              toast.error('Failed to delete event');
                            });
                        }
                      }}
                      className="absolute right-0 top-0 hidden group-hover:block p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}