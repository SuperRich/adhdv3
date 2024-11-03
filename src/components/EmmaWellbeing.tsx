import React, { useState, useEffect } from 'react';

import { AlertCircle, HeartHandshake, Calendar } from 'lucide-react';

import { format } from 'date-fns';

import { enGB } from 'date-fns/locale';

import { ScheduleMoment } from './ScheduleMoment';

import { CalendarEvents } from './CalendarEvents';

import { emailService } from '../services/emailService';

import { toast } from 'sonner';

import { googleCalendarService } from '../services/googleCalendarService';

import type { ScheduledMoment, Desire, WeeklyPriority } from '../lib/db';

import { weeklyPrioritiesDB } from '../lib/db';



interface Props {

  onSchedule: (moment: Omit<ScheduledMoment, "id">) => void;

  desires: Desire[];

  isHotMode: boolean;

  isEmmaMode: boolean;

}



export function EmmaWellbeing({ onSchedule, desires, isHotMode, isEmmaMode }: Props) {

  const [weeklyIssues, setWeeklyIssues] = useState<WeeklyPriority[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);



  useEffect(() => {

    const unsubscribe = weeklyPrioritiesDB.subscribe((priorities) => {

      setWeeklyIssues(priorities);

    });



    return () => unsubscribe();

  }, []);



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



  const handleAddToCalendar = async (moment: Omit<ScheduledMoment, "id">) => {

    console.log('Attempting to add to calendar:', moment);

    

    try {

      // Verify calendar access first

      const hasAccess = await googleCalendarService.verifyCalendarAccess();

      if (!hasAccess) {

        toast.error('No access to calendar. Please check permissions.');

        throw new Error('No calendar access');

      }



      const startTime = moment.date;

      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);



      console.log('Adding event with times:', {

        start: startTime.toISOString(),

        end: endTime.toISOString()

      });



      const newEvent = await googleCalendarService.addWellbeingEvent(

        moment.title,

        startTime,

        endTime,

        moment.description

      );

      

      if (!newEvent?.id) {

        throw new Error('Failed to create calendar event');

      }



      console.log('Successfully created calendar event:', newEvent);

      

      // Update the event name to 'calendar-updated' to match CalendarEvents

      window.dispatchEvent(new Event('calendar-updated'));

      

      toast.success('Added to calendar successfully');

      return true;

    } catch (error) {

      console.error('Failed to add to calendar:', error);

      toast.error('Failed to add to calendar: ' + (error instanceof Error ? error.message : 'Unknown error'));

      throw error;

    }

  };



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setIsSubmitting(true);

    

    const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: enGB });

    

    const emailBody = `

Weekly Priorities:

${weeklyIssues.map(issue => `
${issue.priority}. ${issue.text}
How:
${issue.howPoints.map(point => `• ${point}`).join('\n')}
`).join('\n')}

Sent on: ${currentDate}

    `.trim();



    try {

      const success = await emailService.sendEmail({

        subject: `Emma NEEDS - ${format(new Date(), 'dd/MM/yyyy', { locale: enGB })}`,

        body: emailBody,

      });

      

      if (success) {

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



  const handleClear = async () => {

    if (window.confirm('Are you sure you want to clear all priorities?')) {

      await weeklyPrioritiesDB.clear();

      toast.success('Priorities cleared');

    }

  };



  useEffect(() => {

    const handleCalendarUpdate = () => {

      loadCalendarEvents();

    };



    window.addEventListener('calendar-updated', handleCalendarUpdate);

    return () => {

      window.removeEventListener('calendar-updated', handleCalendarUpdate);

    };

  }, []);



  return (

    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-4 sm:space-y-8">

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">

        <div className="flex justify-between items-center mb-4 sm:mb-6">

          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">

            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />

            This Week's Priorities (Tell Richard how he can help)

          </h2>

          {weeklyIssues.length > 0 && (

            <button

              onClick={handleClear}

              className="text-sm text-pink-600 hover:text-pink-700 font-medium"

            >

              Clear All

            </button>

          )}

        </div>

        

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

                    <div className="space-y-2">

                      <input

                        type="text"

                        value={existingIssue?.text || ''}

                        onChange={(e) => {

                          const newIssues = weeklyIssues.filter(i => i.priority !== priority);

                          if (e.target.value) {

                            newIssues.push({ 

                              priority, 

                              text: e.target.value,

                              howPoints: existingIssue?.howPoints || ['', '', '']

                            });

                          }

                          const sortedIssues = newIssues.sort((a, b) => a.priority - b.priority);

                          setWeeklyIssues(sortedIssues);

                          weeklyPrioritiesDB.save(sortedIssues);

                        }}

                        placeholder={[

                          "Help phone Gentoo",

                          "Remind me about daily medication",

                          "Support my sleep schedule"

                        ][priority - 1]}

                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-pink-300 rounded-md pl-4 sm:pl-6 pr-2 sm:pr-4 py-1.5 sm:py-2 placeholder-gray-400 text-sm sm:text-base"

                        required

                      />

                      

                      <div className="pl-4 space-y-2">

                        <div className="text-sm text-pink-600 font-medium">How he can help:</div>

                        {[0, 1, 2].map((index) => (

                          <input

                            key={index}

                            type="text"

                            value={existingIssue?.howPoints?.[index] || ''}

                            onChange={(e) => {

                              const newIssues = [...weeklyIssues];

                              const issueIndex = newIssues.findIndex(i => i.priority === priority);

                              if (issueIndex === -1) {

                                newIssues.push({

                                  priority,

                                  text: '',

                                  howPoints: ['', '', ''].map((point, i) => i === index ? e.target.value : point)

                                });

                              } else {

                                const newHowPoints = [...(newIssues[issueIndex].howPoints || ['', '', ''])];

                                newHowPoints[index] = e.target.value;

                                newIssues[issueIndex].howPoints = newHowPoints;

                              }

                              const sortedIssues = newIssues.sort((a, b) => a.priority - b.priority);

                              setWeeklyIssues(sortedIssues);

                              weeklyPrioritiesDB.save(sortedIssues);

                            }}

                            placeholder={`How point ${index + 1}`}

                            className="w-full bg-white/50 border border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-200 rounded-md pl-6 pr-2 py-1 text-sm"

                            required

                          />

                        ))}

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>



          <button

            type="submit"

            disabled={isSubmitting || weeklyIssues.length < 3 || 

              !weeklyIssues.every(issue => 

                issue.text.trim() && 

                issue.howPoints?.every(point => point.trim())

              )}

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

          onSchedule={async (moment: Omit<ScheduledMoment, "id">) => {

            try {

              console.log('Received moment from ScheduleMoment:', moment);

              await handleAddToCalendar(moment);

              console.log('Successfully added to Google Calendar');

              await onSchedule(moment);

              console.log('Successfully called onSchedule');

              return true;

            } catch (error) {

              console.error('Detailed scheduling error:', error);

              toast.error('Failed to schedule moment');

              return false;

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
