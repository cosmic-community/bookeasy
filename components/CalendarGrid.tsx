'use client'

import { AvailableDay } from '@/lib/availability'

interface CalendarGridProps {
  year: number
  month: number
  availableDays: AvailableDay[]
  selectedDate: string | null
  onDateSelect: (date: string | null) => void
}

export default function CalendarGrid({ 
  year, 
  month, 
  availableDays, 
  selectedDate, 
  onDateSelect 
}: CalendarGridProps) {
  // Generate calendar grid data
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Create array of day objects
  const calendarDays: Array<{
    date: number | null
    dateString: string | null
    available: boolean
    isPrevMonth?: boolean
    isNextMonth?: boolean
  }> = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ date: null, dateString: null, available: false, isPrevMonth: true })
  }

  // Add all days in the current month
  for (let date = 1; date <= daysInMonth; date++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    const availableDay = availableDays.find(d => d.date === dateString)
    
    calendarDays.push({
      date,
      dateString,
      available: availableDay?.available || false
    })
  }

  // Add empty cells to fill the rest of the grid (6 rows of 7 days = 42 total)
  while (calendarDays.length < 42) {
    calendarDays.push({ date: null, dateString: null, available: false, isNextMonth: true })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleDayClick = (dateString: string | null) => {
    if (dateString) {
      const clickedDay = calendarDays.find(d => d.dateString === dateString)
      if (clickedDay?.available) {
        onDateSelect(dateString)
      }
    }
  }

  return (
    <div className="w-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - increased height for better wide screen display */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isSelected = day.dateString === selectedDate
          const isToday = day.dateString === new Date().toISOString().split('T')[0]
          
          return (
            <div
              key={index}
              className={`
                aspect-square min-h-[80px] flex items-center justify-center text-sm border border-gray-100 cursor-pointer transition-all duration-200 rounded-lg
                ${day.date === null
                  ? 'bg-gray-50 cursor-not-allowed'
                  : day.available
                    ? isSelected
                      ? 'bg-primary text-white border-primary shadow-md'
                      : isToday
                        ? 'bg-primary/10 border-primary/30 text-primary font-semibold hover:bg-primary hover:text-white'
                        : 'bg-white hover:bg-primary hover:text-white border-gray-200 hover:border-primary hover:shadow-md'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100'
                }
              `}
              onClick={() => handleDayClick(day.dateString)}
            >
              {day.date && (
                <span className="font-medium">
                  {day.date}
                </span>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-6 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded border"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded border"></div>
          <span>Not Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary/10 border border-primary/30 rounded"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}