import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  return (
    <div className="calendar-navigation">
      <button onClick={onPrevMonth}>
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="calendar-month-year">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <button onClick={onNextMonth}>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}