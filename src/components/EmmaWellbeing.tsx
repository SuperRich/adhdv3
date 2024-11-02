import React, { useState, useEffect } from 'react';

import { AlertCircle, HeartHandshake, Calendar } from 'lucide-react';

import { format } from 'date-fns';

import { enGB } from 'date-fns/locale';

import { ScheduleMoment } from './ScheduleMoment';

import { CalendarEvents } from './CalendarEvents';

import { emailService } from '../services/emailService';

import { toast } from 'sonner';

import { googleCalendarService } from '../services/googleCalendarService';

import type { ScheduledMoment, Desire } from '../lib/db';



interface Props {

  onSchedule: (moment: Omit<ScheduledMoment, "id">) => void;

  desires: Desire[];

  isHotMode: boolean;

  isEmmaMode: boolean;

}



export function EmmaWellbeing({ onSchedule, desires, isHotMode, isEmmaMode }: Props) {

  const [weeklyIssues, setWeeklyIssues] = useState<Array<{text: string; priority: number}>>([]);

  const [wellbeing, setWellbeing] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);



  useEffect(() => {

    loadCalendarEvents();

  }, []);



  const loadCalendarEvents = async () => {

    try {

      const events = await googleCalendarService.getUpcomingEvents();

      setCalendarEvents(events || []); // Provide empty array fallback if events is undefined

    } catch (error) {

      console.error('Error loading calendar events:', error);

    }

  };



  const handleAddToCalendar = async (activity: string) => {

    const startTime = new Date();

    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration



    try {

      await googleCalendarService.addWellbeingEvent(

        `Wellbeing Activity: ${activity}`,

        startTime,

        endTime,

        `Scheduled wellbeing activity: ${activity}`

      );

      await loadCalendarEvents();

    } catch (error) {

      console.error('Error adding event to calendar:', error);

    }

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setIsSubmitting(true);

    

    const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: enGB });

    

    const emailBody = `

Weekly Challenges:



${weeklyIssues.map(issue => issue.text).join('\n')}



Current Wellbeing:



${wellbeing}



Sent on: ${currentDate}

    `.trim();



    try {

      const success = await emailService.sendEmail({

        subject: `Emma NEEDS - ${format(new Date(), 'dd/MM/yyyy', { locale: enGB })}`,

        body: emailBody,

      });

      

      if (success) {

        setWeeklyIssues([]);

        setWellbeing('');

        toast.success('Weekly update shared successfully!');

      } else {

        toast.error('Failed to share. Please try again.');

      }

    } catch (error) {

      toast.error('Something went wrong. Please try again.');

    } finally {

      setIsSubmitting(false);

    }

  };



  return (

    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-4 sm:space-y-8">

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">

        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">

          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />

          This Week's Priorities

        </h2>

        

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

          <div className="weekly-priorities space-y-3 sm:space-y-4">

            <div className="grid gap-3 sm:gap-4">

              {[1, 2, 3].map((priority) => {

                const existingIssue = weeklyIssues.find(issue => issue.priority === priority);

                return (

                  <div 

                    key={priority}

                    className="relative group bg-gradient-to-r from-pink-50 to-purple-50 p-3 sm:p-4 rounded-lg border border-pink-100 hover:border-pink-300 transition-all"

                  >

                    <div className="absolute -left-2 -top-2 sm:-left-3 sm:-top-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg">

                      {priority}

                    </div>

                    <input

                      type="text"

                      value={existingIssue?.text || ''}

                      onChange={(e) => {

                        const newIssues = weeklyIssues.filter(i => i.priority !== priority);

                        if (e.target.value) {

                          newIssues.push({ priority, text: e.target.value });

                        }

                        setWeeklyIssues(newIssues.sort((a, b) => a.priority - b.priority));

                      }}

                      placeholder={[

                        "Help me stay focused during meetings",

                        "Remind me about daily medication",

                        "Support my sleep schedule"

                      ][priority - 1]}

                      className="w-full bg-transparent border-none focus:ring-2 focus:ring-pink-300 rounded-md pl-4 sm:pl-6 pr-2 sm:pr-4 py-1.5 sm:py-2 placeholder-gray-400 text-sm sm:text-base"

                      required

                    />

                  </div>

                );

              })}

            </div>

          </div>



          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 sm:p-6 rounded-lg border border-pink-100">

            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">

              <HeartHandshake className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2 text-pink-500" />

              How can Richard best support you this week?

            </label>

            <textarea

              value={wellbeing}

              onChange={(e) => setWellbeing(e.target.value)}

              placeholder="Share your current emotional state, energy levels, and any specific support you need..."

              className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50 resize-none text-sm sm:text-base"

              rows={4}

              required

            />

          </div>



          <button

            type="submit"

            disabled={isSubmitting || weeklyIssues.length < 3 || !wellbeing.trim()}

            className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-white text-sm sm:text-base font-medium bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-md"

          >

            {isSubmitting ? (

              <span className="flex items-center justify-center gap-2">

                <span className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></span>

                Sharing...

              </span>

            ) : (

              'Share Weekly Update'

            )}

          </button>

        </form>

      </div>



      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">

        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">

          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />

          Schedule a Moment

        </h2>

        

        <ScheduleMoment

          onSchedule={(moment: Omit<ScheduledMoment, "id">) => {

            onSchedule(moment);

            if (moment.title) {

              handleAddToCalendar(moment.title);

            }

          }}

          desires={desires}

          isHotMode={isHotMode}

          isEmmaMode={isEmmaMode}

        />

      </div>



      <div className="mt-4 sm:mt-8">

        <CalendarEvents />

      </div>

    </div>

  );

}
