import { useEffect, useState } from 'react';
import { googleAuthService } from '../services/googleAuthService';
import { googleCalendarService } from '../services/googleCalendarService';
import { CalendarEvent } from '../types/calendar';

export const CalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAndLoadEvents = async () => {
      try {
        console.log('Setting loading state to true');
        setIsLoading(true);
        
        if (!googleAuthService.isInitialized()) {
          await googleAuthService.initialize();
        }

        const upcomingEvents = await googleCalendarService.getUpcomingEvents(7);
        console.log('Events before setting state:', upcomingEvents);
        
        if (mounted) {
          const sortedEvents = upcomingEvents.sort((a, b) => 
            new Date(a.start).getTime() - new Date(b.start).getTime()
          );
          setEvents(sortedEvents);
          console.log('Events set in state:', sortedEvents);
        }
      } catch (err) {
        console.error('Error in CalendarEvents:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load calendar events');
        }
      } finally {
        if (mounted) {
          console.log('Setting loading state to false');
          setIsLoading(false);
        }
      }
    };

    initializeAndLoadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  console.log('Current state:', { isLoading, events: events.length, error });

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Invalid date';
      }
      return date.toLocaleString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error formatting date';
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading calendar events...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        <p>Error loading events:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div key="calendar-events" className="calendar-events p-4">
      <h2 className="text-xl font-semibold mb-4">Next 7 Days Events</h2>
      {events.length === 0 ? (
        <p className="text-center text-gray-500">No upcoming events in the next 7 days</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-lg">{event.summary}</h3>
              <p className="text-sm text-gray-600">
                {event.start && `Start: ${formatEventDate(event.start)}`}
                <br />
                {event.end && `End: ${formatEventDate(event.end)}`}
              </p>
              {event.description && (
                <div className="mt-2 text-sm">
                  <p className="whitespace-pre-wrap break-words overflow-hidden">
                    {event.description}
                  </p>
                </div>
              )}
              {event.location && (
                <p className="mt-2 text-sm text-gray-500 break-words">
                  Location: {event.location}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 