'use client'

import { useState, useMemo } from 'react'
import { Booking } from '@/types'
import BookingModal from './BookingModal'

interface BookingsCalendarProps {
  bookings: Booking[]
  onBookingUpdated: (updatedBooking: Booking) => void
}

export default function BookingsCalendar({ bookings, onBookingUpdated }: BookingsCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get calendar data for the current month
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get first day of month and how many days in month
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startingDayOfWeek = firstDayOfMonth.getDay()
    
    // Create array of all days to display (including prev/next month days)
    const days: Array<{
      date: Date
      dayNumber: number
      isCurrentMonth: boolean
      bookings: Booking[]
    }> = []
    
    // Add days from previous month to fill the first week
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = prevMonth.getDate() - i
      const date = new Date(year, month - 1, dayNumber)
      const dateStr = date.toISOString().split('T')[0]
      
      days.push({
        date,
        dayNumber,
        isCurrentMonth: false,
        bookings: bookings.filter(booking => booking.metadata?.booking_date === dateStr)
      })
    }
    
    // Add days from current month
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const date = new Date(year, month, dayNumber)
      const dateStr = date.toISOString().split('T')[0]
      
      days.push({
        date,
        dayNumber,
        isCurrentMonth: true,
        bookings: bookings.filter(booking => booking.metadata?.booking_date === dateStr)
      })
    }
    
    // Add days from next month to fill the last week
    const totalCells = Math.ceil(days.length / 7) * 7
    const remainingCells = totalCells - days.length
    for (let dayNumber = 1; dayNumber <= remainingCells; dayNumber++) {
      const date = new Date(year, month + 1, dayNumber)
      const dateStr = date.toISOString().split('T')[0]
      
      days.push({
        date,
        dayNumber,
        isCurrentMonth: false,
        bookings: bookings.filter(booking => booking.metadata?.booking_date === dateStr)
      })
    }
    
    return days
  }, [currentMonth, bookings])

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  // Format month and year for display
  const monthYearString = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Handle booking click
  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  // Handle booking update
  const handleBookingUpdate = (updatedBooking: Booking) => {
    onBookingUpdated(updatedBooking)
    setSelectedBooking(null)
  }

  // Get booking status color
  const getStatusColor = (status: string | { key: string; value: string } | undefined) => {
    if (!status) return 'bg-gray-500'
    
    const statusValue = typeof status === 'string' ? status : status.value
    
    switch (statusValue.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500'
      case 'cancelled':
        return 'bg-red-500'
      case 'completed':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthYearString}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border border-gray-200 rounded-lg
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${new Date().toDateString() === day.date.toDateString() ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              {/* Day number */}
              <div className={`text-sm font-medium mb-1 ${
                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {day.dayNumber}
              </div>

              {/* Bookings for this day */}
              <div className="space-y-1">
                {day.bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => handleBookingClick(booking)}
                    className={`
                      w-full text-left p-1 rounded text-xs text-white
                      hover:opacity-80 transition-opacity
                      ${getStatusColor(booking.metadata?.status)}
                    `}
                    title={`${booking.metadata?.attendee_name} - ${booking.metadata?.booking_time}`}
                  >
                    <div className="truncate font-medium">
                      {booking.metadata?.attendee_name}
                    </div>
                    <div className="truncate">
                      {booking.metadata?.booking_time}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onBookingUpdated={handleBookingUpdate}
        />
      )}
    </div>
  )
}