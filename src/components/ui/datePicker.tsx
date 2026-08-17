import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(year, month - 1, day);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize viewing calendar month/year
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const handleQuickSelect = (daysFromToday: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setViewYear(y);
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  const todayStr = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Input Button */}
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg border text-sm transition-all duration-200 cursor-pointer ${isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-slate-950/80 text-white'
            : 'border-slate-800 bg-slate-950/60 text-slate-100 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CalendarIcon className={`w-4 h-4 shrink-0 ${value ? 'text-blue-400' : 'text-slate-500'}`} />
            <span className={`truncate text-sm ${value ? 'text-slate-100 font-medium' : 'text-slate-500'}`}>
              {value ? formatDateDisplay(value) : 'Select due date...'}
            </span>
          </div>

          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </button>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-full sm:w-[320px] z-[100] p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 shadow-2xl shadow-slate-950/90 backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-slate-800/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleQuickSelect(0)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300 transition-colors whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(1)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300 transition-colors whitespace-nowrap"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(7)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300 transition-colors whitespace-nowrap"
            >
              Next Week
            </button>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-200 tracking-wide">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 mb-1 text-center">
            {DAYS.map((d) => (
              <span key={d} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(viewMonth + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const currentCellDate = `${viewYear}-${formattedMonth}-${formattedDay}`;

              const isSelected = value === currentCellDate;
              const isToday = todayStr() === currentCellDate;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 text-xs rounded-full flex items-center justify-center font-medium transition-all ${isSelected
                    ? 'bg-blue-600 text-white font-semibold '
                    : isToday
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};