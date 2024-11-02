import { useState, useEffect } from 'react';
import { googleCalendarService } from '../services/googleCalendarService';
import { googleAuthService } from '../services/googleAuthService';
import { CalendarEvent } from '../types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns';
import { ScheduleModal } from './ScheduleModal';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAndFetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load the Google API client library
        if (typeof gapi === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.async = true;
          script.defer = true;
          await new Promise((resolve) => {
            script.onload = resolve;
            document.head.appendChild(script);
          });
        }

        // Initialize the client
        await new Promise<void>((resolve) => {
          gapi.load('client', async () => {
            await gapi.client.init({
              apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });
            resolve();
          });
        });

        // Initialize auth and fetch events
        if (!googleAuthService.isInitialized()) {
          await googleAuthService.initialize();
        }

        await fetchMonthEvents();
      } catch (err) {
        console.error('Calendar initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize calendar');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAndFetchEvents();
  }, [currentDate]);

  const fetchMonthEvents = async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      console.log('Fetching events for range:', { start, end });
      
      const monthEvents = await googleCalendarService.getMonthEvents(start, end);
      console.log('Fetched events:', monthEvents);
      
      setEvents(monthEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      throw err;
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding for the first week
    const firstDayOfMonth = getDay(start);
    const paddingDays = Array(firstDayOfMonth).fill(null);
    
    return [...paddingDays, ...days];
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.start), date));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowScheduleModal(true);
  };

  const checkForConflicts = (newEventStart: Date, newEventEnd: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (newEventStart >= eventStart && newEventStart < eventEnd) ||
        (newEventEnd > eventStart && newEventEnd <= eventEnd) ||
        (newEventStart <= eventStart && newEventEnd >= eventEnd)
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-white rounded-lg">
        <div className="text-gray-600 animate-pulse">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-white rounded-lg">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4 p-4">
        <button 
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        >
          Previous
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold p-2 bg-white">
            {day}
          </div>
        ))}
        
        {getDaysInMonth().map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="bg-white p-2 min-h-[100px]" />;
          }

          const dayEvents = getEventsForDay(date);
          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`
                bg-white p-2 min-h-[100px] cursor-pointer transition-colors
                hover:bg-gray-50 relative
                ${isToday(date) ? 'ring-2 ring-pink-500 ring-inset' : ''}
                ${dayEvents.length > 0 ? 'bg-pink-50' : ''}
              `}
            >
              <div className="font-semibold mb-1">
                {format(date, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.map(event => (
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
        })}
      </div>

      {showScheduleModal && selectedDate && (
        <ScheduleModal
          date={selectedDate}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={async (newEvent) => {
            const start = newEvent.start ? new Date(newEvent.start) : null;
            const end = newEvent.end ? new Date(newEvent.end) : null;
            
            if (!start || !end) {
              return {
                success: false,
                error: "Start and end times are required"
              };
            }

            const conflicts = checkForConflicts(start, end);
            if (conflicts.length > 0) {
              return {
                success: false,
                conflicts
              };
            }

            try {
              await googleCalendarService.createEvent(newEvent);
              await fetchMonthEvents();
              return { success: true };
            } catch (error) {
              return {
                success: false,
                error: "Failed to create event"
              };
            }
          }}
          existingEvents={getEventsForDay(selectedDate)}
        />
      )}
    </div>
  );
}; 