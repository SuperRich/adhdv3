import React, { useEffect, useState } from 'react';
import { googleCalendarService } from '../services/googleCalendarService';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const CalendarEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const fetchedEvents = await googleCalendarService.getUpcomingEvents();
      setEvents(fetchedEvents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Listen for calendar updates
    const handleCalendarUpdate = () => {
      loadEvents();
    };

    window.addEventListener('calendar-updated', handleCalendarUpdate);
    return () => {
      window.removeEventListener('calendar-updated', handleCalendarUpdate);
    };
  }, []);

  const handleDelete = async (eventId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this event?')) {
        await googleCalendarService.deleteEvent(eventId);
        window.dispatchEvent(new Event('calendar-updated'));
        await loadEvents(); // Refresh the list
        toast.success('Event deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  if (isLoading) {
    return <div className="p-3 sm:p-4 text-center text-sm sm:text-base">Loading calendar events...</div>;
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 text-red-500 text-center text-sm sm:text-base">
        <p>Error loading events:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div key="calendar-events" className="calendar-events p-3 sm:p-4">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Next 7 Days Events</h2>
      {events.length === 0 ? (
        <p className="text-center text-gray-500 text-sm sm:text-base">No upcoming events in the next 7 days</p>
      ) : (
        <ul className="space-y-3 sm:space-y-4">
          {events.map((event) => (
            <li key={event.id} className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-base sm:text-lg">{event.summary}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {event.start && `Start: ${formatEventDate(event.start)}`}
                    <br />
                    {event.end && `End: ${formatEventDate(event.end)}`}
                  </p>
                  {event.description && (
                    <div className="mt-2 text-xs sm:text-sm">
                      <p className="whitespace-pre-wrap break-words overflow-hidden">
                        {event.description}
                      </p>
                    </div>
                  )}
                  {event.location && (
                    <p className="mt-2 text-xs sm:text-sm text-gray-500 break-words">
                      Location: {event.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => event.id && handleDelete(event.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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