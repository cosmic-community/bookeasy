'use client'

import { Booking } from '@/types'

interface CalendarGridProps {
  currentDate: Date
  bookingsByDate: Record<string, Booking[]>
  onDateClick: (date: Date) => void
  onBookingClick: (booking: Booking) => void
}

export default function CalendarGrid({ 
  currentDate, 
  bookingsByDate, 
  onDateClick, 
  onBookingClick 
}: CalendarGridProps) {
  const today = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  // Get first day of month and how many days in month
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Get days from previous month to fill the grid
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
  const prevMonthDays = []
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(prevMonthLastDay - i)
  }

  // Get days for current month
  const currentMonthDays = []
  for (let day = 1; day <= daysInMonth; day++) {
    currentMonthDays.push(day)
  }

  // Get days from next month to fill the grid (6 rows × 7 days = 42 total)
  const totalCells = 42
  const usedCells = prevMonthDays.length + currentMonthDays.length
  const nextMonthDays = []
  for (let day = 1; day <= totalCells - usedCells; day++) {
    nextMonthDays.push(day)
  }

  const formatDate = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isToday = (year: number, month: number, day: number): boolean => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  const isPastDate = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayStart
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="calendar-grid">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map(day => (
          <div key={day} className="p-4 text-center font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {/* Previous month days */}
        {prevMonthDays.map(day => {
          const year = currentMonth === 0 ? currentYear - 1 : currentYear
          const month = currentMonth === 0 ? 11 : currentMonth - 1
          const dateKey = formatDate(year, month, day)
          const dayBookings = bookingsByDate[dateKey] || []

          return (
            <div
              key={`prev-${day}`}
              className="calendar-day prev-month"
            >
              <span className="day-number">{day}</span>
              {dayBookings.length > 0 && (
                <div className="bookings-container">
                  {dayBookings.slice(0, 2).map(booking => (
                    <div
                      key={booking.id}
                      className="booking-item"
                      onClick={(e) => {
                        e.stopPropagation()
                        onBookingClick(booking)
                      }}
                      title={`${booking.metadata?.attendee_name} - ${booking.metadata?.booking_time}`}
                    >
                      {booking.metadata?.booking_time} - {booking.metadata?.attendee_name}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="more-bookings">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Current month days */}
        {currentMonthDays.map(day => {
          const dateKey = formatDate(currentYear, currentMonth, day)
          const dayBookings = bookingsByDate[dateKey] || []
          const isCurrentDay = isToday(currentYear, currentMonth, day)
          const isPast = isPastDate(currentYear, currentMonth, day)

          return (
            <div
              key={day}
              className={`calendar-day current-month ${isCurrentDay ? 'today' : ''} ${isPast ? 'past' : 'future'}`}
              onClick={() => onDateClick(new Date(currentYear, currentMonth, day))}
            >
              <span className="day-number">{day}</span>
              {dayBookings.length > 0 && (
                <div className="bookings-container">
                  {dayBookings.slice(0, 2).map(booking => {
                    const status = booking.metadata?.status?.key || 'confirmed'
                    return (
                      <div
                        key={booking.id}
                        className={`booking-item status-${status}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onBookingClick(booking)
                        }}
                        title={`${booking.metadata?.attendee_name} - ${booking.metadata?.booking_time}`}
                      >
                        {booking.metadata?.booking_time} - {booking.metadata?.attendee_name}
                      </div>
                    )
                  })}
                  {dayBookings.length > 2 && (
                    <div className="more-bookings">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Next month days */}
        {nextMonthDays.map(day => {
          const year = currentMonth === 11 ? currentYear + 1 : currentYear
          const month = currentMonth === 11 ? 0 : currentMonth + 1
          const dateKey = formatDate(year, month, day)
          const dayBookings = bookingsByDate[dateKey] || []

          return (
            <div
              key={`next-${day}`}
              className="calendar-day next-month"
            >
              <span className="day-number">{day}</span>
              {dayBookings.length > 0 && (
                <div className="bookings-container">
                  {dayBookings.slice(0, 2).map(booking => (
                    <div
                      key={booking.id}
                      className="booking-item"
                      onClick={(e) => {
                        e.stopPropagation()
                        onBookingClick(booking)
                      }}
                      title={`${booking.metadata?.attendee_name} - ${booking.metadata?.booking_time}`}
                    >
                      {booking.metadata?.booking_time} - {booking.metadata?.attendee_name}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="more-bookings">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}