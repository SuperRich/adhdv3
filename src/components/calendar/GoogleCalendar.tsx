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
} from 'date-fns';
import { googleCalendarService } from '../../services/googleCalendarService';
import { CalendarEvent } from '../../types/calendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';

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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
          onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
        />

        <div className="grid grid-cols-7 gap-px">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-sm py-2">
              {day}
            </div>
          ))}
          
          {getDaysInMonth().map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="bg-gray-50" />;
            }

            return (
              <CalendarDay
                key={date.toISOString()}
                date={date}
                events={getEventsForDay(date)}
                isToday={isToday(date)}
                isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                onSelect={onDateSelect}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}