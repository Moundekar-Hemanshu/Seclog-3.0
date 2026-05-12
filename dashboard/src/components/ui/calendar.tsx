import { useState, useMemo, useCallback } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarProps {
  selected?: Date | null
  onSelect?: (date: Date) => void
  className?: string
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [viewDate, setViewDate] = useState(selected ?? new Date())

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewDate)
    const monthEnd = endOfMonth(viewDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [viewDate])

  const handlePrev = useCallback(() => setViewDate(d => subMonths(d, 1)), [])
  const handleNext = useCallback(() => setViewDate(d => addMonths(d, 1)), [])

  return (
    <div className={cn('w-[280px] select-none', className)} id="calendar-widget">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrev}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-100"
          aria-label="Previous month"
          id="calendar-prev-month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <button
          onClick={handleNext}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-100"
          aria-label="Next month"
          id="calendar-next-month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-[11px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const inMonth = isSameMonth(day, viewDate)
          const isSelected = selected ? isSameDay(day, selected) : false
          const today = isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect?.(day)}
              className={cn(
                'h-8 w-full flex items-center justify-center text-xs rounded-md transition-colors duration-100',
                !inMonth && 'text-muted-foreground/40',
                inMonth && !isSelected && 'text-foreground hover:bg-muted',
                today && !isSelected && 'font-semibold text-primary',
                isSelected && 'bg-primary text-primary-foreground font-medium hover:bg-primary/90'
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
