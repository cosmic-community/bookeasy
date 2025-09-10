'use client'

import { Booking } from '@/types'
import { formatTime } from '@/lib/availability'

interface CalendarGridProps {
  bookings: Booking[]
  currentMonth: Date
  selectedDate?: string
  onDateClick: (date: string) => void
}

export default function CalendarGrid({ 
  bookings, 
  currentMonth, 
  selectedDate, 
  onDateClick 
}: CalendarGridProps) {
  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)
    
    // Get first day of week (Sunday = 0)
    const firstDayOfWeek = firstDay.getDay()
    
    // Start from the beginning of the week
    startDate.setDate(firstDay.getDate() - firstDayOfWeek)
    
    // End at the end of the week
    const lastDayOfWeek = lastDay.getDay()
    endDate.setDate(lastDay.getDate() + (6 - lastDayOfWeek))
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0]
    if (!dateStr) return []
    
    return bookings.filter(booking => {
      const bookingDate = booking.metadata?.booking_date
      if (!bookingDate) return false
      
      const bookingDateObj = new Date(bookingDate + 'T00:00:00')
      const bookingDateStr = bookingDateObj.toISOString().split('T')[0]
      
      return bookingDateStr === dateStr
    })
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false
    const dateStr = date.toISOString().split('T')[0]
    return dateStr === selectedDate
  }

  const calendarDays = generateCalendarDays()

  return (
    <div>
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendarDays.map((date, index) => {
          const dayBookings = getBookingsForDate(date)
          const dateStr = date.toISOString().split('T')[0]
          
          if (!dateStr) return null
          
          return (
            <div
              key={index}
              onClick={() => onDateClick(dateStr)}
              className={`min-h-[100px] p-1 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
                isSelected(date) ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday(date) 
                  ? 'text-primary font-bold' 
                  : isCurrentMonth(date) 
                  ? 'text-gray-900' 
                  : 'text-gray-400'
              }`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking, bookingIndex) => {
                  const status = booking.metadata?.status
                  const statusValue = typeof status === 'string' ? status : status?.value || 'confirmed'
                  
                  return (
                    <div
                      key={bookingIndex}
                      className={`text-xs p-1 rounded text-white truncate ${
                        statusValue.toLowerCase() === 'confirmed' 
                          ? 'bg-green-500'
                          : statusValue.toLowerCase() === 'cancelled'
                          ? 'bg-red-500'
                          : statusValue.toLowerCase() === 'completed'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                      }`}
                      title={`${booking.metadata?.attendee_name} at ${booking.metadata?.booking_time ? formatTime(booking.metadata.booking_time) : 'No time'}`}
                    >
                      {booking.metadata?.booking_time ? formatTime(booking.metadata.booking_time) : 'No time'} {booking.metadata?.attendee_name}
                    </div>
                  )
                })}
                
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}