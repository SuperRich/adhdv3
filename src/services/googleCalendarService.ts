import { googleAuthService } from './googleAuthService';
import { GoogleCalendarEvent, CalendarEvent } from '../types/calendar';

export class GoogleCalendarService {
  private static CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
  private static CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

  async listEvents(timeMin: Date, timeMax: Date): Promise<GoogleCalendarEvent[]> {
    try {
      console.log('Attempting to fetch events for calendar:', GoogleCalendarService.CALENDAR_ID);
      console.log('Time range:', { timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString() });
      
      const accessToken = await googleAuthService.signIn();
      console.log('Got access token:', accessToken ? 'Yes' : 'No');

      const url = `${GoogleCalendarService.CALENDAR_API_BASE}/calendars/${encodeURIComponent(GoogleCalendarService.CALENDAR_ID)}/events`;
      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      console.log('Fetching from URL:', `${url}?${params}`);

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Calendar API Error Response:', errorData);
        throw new Error(`Failed to fetch calendar events: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully fetched events:', data.items?.length || 0);
      return data.items || [];
    } catch (error) {
      console.error('Detailed error in listEvents:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    try {
      console.log('Getting upcoming events for next', days, 'days');
      const now = new Date();
      const timeMax = new Date();
      timeMax.setDate(now.getDate() + days);

      console.log('Time range:', {
        from: now.toISOString(),
        to: timeMax.toISOString()
      });

      const events = await this.listEvents(now, timeMax);
      console.log('Raw events received:', events);

      const mappedEvents = events.map((event: GoogleCalendarEvent) => {
        const mappedEvent = {
          id: event.id || '',
          summary: event.summary || '',
          start: event.start?.dateTime || event.start?.date || '',
          end: event.end?.dateTime || event.end?.date || '',
          description: event.description,
          location: event.location
        };
        console.log('Mapped event:', mappedEvent);
        return mappedEvent;
      });

      console.log('Total mapped events:', mappedEvents.length);
      return mappedEvents;
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      throw error;
    }
  }

  async getMonthEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    const events = await this.listEvents(start, end);
    return events.map((event: GoogleCalendarEvent) => ({
      id: event.id || '',
      summary: event.summary || '',
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
      description: event.description,
      location: event.location
    }));
  }

  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const accessToken = await googleAuthService.signIn();
      
      const response = await fetch(
        `${GoogleCalendarService.CALENDAR_API_BASE}/calendars/${encodeURIComponent(GoogleCalendarService.CALENDAR_ID)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.summary,
            description: event.description,
            start: {
              dateTime: event.start,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: event.end,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();