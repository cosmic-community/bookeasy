'use client'

import { Booking } from '@/types'
import { AvailableDay } from '@/lib/availability'

interface CalendarGridProps {
  bookings: Booking[]
  currentMonth: Date
  selectedDate: string
  onDateClick: (date: string) => void
}

export default function CalendarGrid({ 
  bookings,
  currentMonth,
  selectedDate, 
  onDateClick 
}: CalendarGridProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
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
    hasBookings?: boolean
    bookingCount?: number
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
    
    // Check if this date has bookings
    const dayBookings = bookings.filter(booking => {
      const bookingDate = booking.metadata?.booking_date
      if (!bookingDate) return false
      
      const bookingDateObj = new Date(bookingDate + 'T00:00:00')
      const targetDateObj = new Date(dateString + 'T00:00:00')
      
      return bookingDateObj.toDateString() === targetDateObj.toDateString()
    })
    
    calendarDays.push({
      date,
      dateString,
      available: true,
      hasBookings: dayBookings.length > 0,
      bookingCount: dayBookings.length
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
        onDateClick(dateString)
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
                aspect-square min-h-[80px] flex flex-col items-center justify-center text-sm border border-gray-100 cursor-pointer transition-all duration-200 rounded-lg relative
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
                <>
                  <span className="font-medium">
                    {day.date}
                  </span>
                  {day.hasBookings && day.bookingCount && (
                    <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-white text-primary' : 'bg-primary text-white'
                    }`}>
                      {day.bookingCount}
                    </div>
                  )}
                </>
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
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded border relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
          </div>
          <span>Has Bookings</span>
        </div>
      </div>
    </div>
  )
}