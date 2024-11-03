import React, { useState } from 'react';
import { Calendar, Clock, Heart, Flame } from 'lucide-react';
import { GoogleCalendar } from './calendar/GoogleCalendar';
import type { ScheduledMoment, Desire } from '../lib/db';
import { format as dateFormat } from 'date-fns';
import { toast } from 'sonner';

interface Props {
  onSchedule: (moment: Omit<ScheduledMoment, 'id'>) => Promise<boolean>;
  desires: Desire[];
  isHotMode: boolean;
  isEmmaMode: boolean;
}

const INTIMATE_CATEGORIES = [
  'Roleplay',
  'New Position',
  'Massage',
  'Toys',
  'Location',
  'Outfit',
  'Foreplay',
  'Fantasy',
  'Sensual',
  'Experiment',
  'Romantic',
  'Adventure',
] as const;

type IntimateCategory = typeof INTIMATE_CATEGORIES[number];

export function ScheduleMoment({ onSchedule, desires, isHotMode, isEmmaMode }: Props) {
  const [isCustomMoment, setIsCustomMoment] = useState(true);
  const [selectedDesireId, setSelectedDesireId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<IntimateCategory>(INTIMATE_CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);

  const richardsDesires = desires.filter(d => d.author === 'Richard' && d.isHot === isHotMode);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !time) return;
    if (!isCustomMoment && !selectedDesireId) return;
    if (isCustomMoment && !title) return;

    setIsLoading(true);
    try {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = time.split(':').map(Number);
      dateTime.setHours(hours, minutes);

      let momentData: Omit<ScheduledMoment, 'id'>;

      if (isCustomMoment) {
        momentData = {
          title,
          description,
          date: dateTime,
        };
      } else {
        const selectedDesire = desires.find(d => d.id === selectedDesireId);
        if (!selectedDesire) throw new Error('Selected desire not found');
        
        momentData = {
          title: selectedDesire.title,
          description: selectedDesire.description,
          date: dateTime,
          desireId: selectedDesire.id,
        };
      }

      const success = await onSchedule(momentData);
      
      if (success) {
        setTitle('');
        setDescription('');
        setSelectedDate(null);
        setTime('');
        setCategory(INTIMATE_CATEGORIES[0]);
        setSelectedDesireId('');
        setIsCustomMoment(true);
        setShowCalendarView(false);
        toast.success('Moment scheduled successfully');
      }
    } catch (error) {
      console.error('Failed to schedule moment:', error);
      toast.error('Failed to schedule moment');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={() => setShowCalendarView(!showCalendarView)}
          className="mb-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          {showCalendarView ? 'Hide Calendar' : 'Show Calendar'}
        </button>

        {showCalendarView && (
          <div className="mb-6">
            <GoogleCalendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isEmmaMode && richardsDesires.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCustomMoment(false);
                  setTitle('');
                  setDescription('');
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  !isCustomMoment
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className="w-4 h-4 inline-block mr-1" />
                Richard's Desires
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCustomMoment(true);
                  setSelectedDesireId('');
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  isCustomMoment
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Flame className="w-4 h-4 inline-block mr-1" />
                Your Own Desire
              </button>
            </div>
          )}

          <div className="space-y-4">
            {isEmmaMode && !isCustomMoment && richardsDesires.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Richard's Desire
                </label>
                <select
                  value={selectedDesireId}
                  onChange={(e) => {
                    setSelectedDesireId(e.target.value);
                    const desire = desires.find(d => d.id === e.target.value);
                    if (desire) {
                      setTitle(desire.title);
                      setDescription(desire.description);
                      if (desire.category) {
                        setCategory(desire.category as IntimateCategory);
                      }
                    }
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  disabled={isLoading}
                  required
                >
                  <option value="">Choose a desire...</option>
                  {richardsDesires.map((desire) => (
                    <option key={desire.id} value={desire.id}>
                      {desire.title} - {desire.category}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isHotMode ? "What's your intimate desire?" : "What's the plan?"}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    disabled={isLoading || (!isCustomMoment && isEmmaMode)}
                    required
                  />
                </div>

                {isHotMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IntimateCategory)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                      disabled={isLoading || (!isCustomMoment && isEmmaMode)}
                      required
                    >
                      {INTIMATE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    rows={3}
                    placeholder={isHotMode ? "Describe your intimate desire..." : "Add some details..."}
                    disabled={isLoading || (!isCustomMoment && isEmmaMode)}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Selected Date
              </label>
              <div className="text-gray-900 py-2">
                {selectedDate ? (
                  formatDate(selectedDate)
                ) : (
                  <span className="text-gray-500">No date selected</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline-block mr-1" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedDate || !time || (!isCustomMoment && !selectedDesireId) || (isCustomMoment && !title)}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-all ${
              isHotMode
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            } ${
              isLoading || !selectedDate || !time || (!isCustomMoment && !selectedDesireId) || (isCustomMoment && !title)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isLoading ? 'Scheduling...' : `Schedule ${isHotMode ? 'Intimate ' : ''}Moment`}
          </button>
        </form>
      </div>
    </div>
  );
}