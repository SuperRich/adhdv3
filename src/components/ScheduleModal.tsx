import { useState } from 'react';
import { CalendarEvent } from '../types/calendar';
import { format } from 'date-fns';

interface ScheduleModalProps {
  date: Date;
  onClose: () => void;
  onSchedule: (event: Partial<CalendarEvent>) => Promise<{
    success: boolean;
    conflicts?: CalendarEvent[];
  }>;
  existingEvents: CalendarEvent[];
}

export const ScheduleModal = ({ date, onClose, onSchedule, existingEvents }: ScheduleModalProps) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent = {
      summary: title,
      description,
      start: new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`).toISOString(),
      end: new Date(`${format(date, 'yyyy-MM-dd')}T${endTime}`).toISOString(),
    };

    const result = await onSchedule(newEvent);
    
    if (!result.success && result.conflicts) {
      setError(`Scheduling conflict with: ${result.conflicts.map(e => e.summary).join(', ')}`);
    } else if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          Schedule for {format(date, 'dd MMMM yyyy')}
        </h2>

        {existingEvents.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Existing Events:</h3>
            <ul className="text-sm space-y-1">
              {existingEvents.map(event => (
                <li key={event.id} className="text-gray-600">
                  {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}: {event.summary}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded p-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 