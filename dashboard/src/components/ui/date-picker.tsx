import { useState } from 'react'
import { format, isToday as checkIsToday, isYesterday } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  date: Date | null
  onDateChange: (date: Date | null) => void
  className?: string
  id?: string
}

function formatDateLabel(date: Date | null): string {
  if (!date) return 'Pick a date'
  if (checkIsToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d, yyyy')
}

export function DatePicker({ date, onDateChange, className, id }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2 font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          id={id}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">{formatDateLabel(date)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end" sideOffset={6}>
        <Calendar
          selected={date}
          onSelect={(d) => {
            onDateChange(d)
            setOpen(false)
          }}
        />
        {date && (
          <div className="border-t border-border mt-2 pt-2">
            <button
              onClick={() => {
                onDateChange(null)
                setOpen(false)
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors duration-100 py-1"
              id="clear-date-filter"
            >
              Clear date filter
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
