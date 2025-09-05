'use client'

import { useState, useEffect } from 'react'
import { Booking, EventType, Settings } from '@/types'
import { formatDate, formatTime } from '@/lib/availability'

interface BookingsCalendarProps {
  bookings: Booking[]
  eventTypes: EventType[]
  settings: Settings | null
  onUpdateBooking?: (bookingId: string, status: string) => void
}

interface CalendarDay {
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  bookings: Booking[]
}

export default function BookingsCalendar({ 
  bookings, 
  eventTypes, 
  settings, 
  onUpdateBooking 
}: BookingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Generate calendar days for the current month
  const generateCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: CalendarDay[] = []

    // Add days from previous month to fill the first week
    const prevMonth = new Date(year, month - 1, 0)
    const daysInPrevMonth = prevMonth.getDate()
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = daysInPrevMonth - i
      const date = new Date(year, month - 1, dayNumber)
      const dateStr = date.toISOString().split('T')[0] || ''
      
      days.push({
        date: dateStr,
        dayNumber,
        isCurrentMonth: false,
        bookings: getBookingsForDate(dateStr)
      })
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0] || ''
      
      days.push({
        date: dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        bookings: getBookingsForDate(dateStr)
      })
    }

    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      const dateStr = date.toISOString().split('T')[0] || ''
      
      days.push({
        date: dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        bookings: getBookingsForDate(dateStr)
      })
    }

    return days
  }

  // Get bookings for a specific date - FIXED: Handle undefined values safely
  const getBookingsForDate = (dateStr: string): Booking[] => {
    if (!dateStr || !bookings) {
      return []
    }

    return bookings.filter(booking => {
      const bookingDate = booking.metadata?.booking_date
      if (!bookingDate) {
        return false
      }

      try {
        const bookingDateObj = new Date(bookingDate)
        const bookingDateStr = bookingDateObj.toISOString().split('T')[0]
        return bookingDateStr === dateStr
      } catch (error) {
        console.error('Error parsing booking date:', error)
        return false
      }
    })
  }

  const handleMonthChange = (increment: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + increment)
      return newDate
    })
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (onUpdateBooking) {
      await onUpdateBooking(bookingId, newStatus)
      setSelectedBooking(null)
    }
  }

  // FIXED: Ensure all string operations handle undefined values safely
  const getBookingStatusColor = (status: string | { key: string; value: string } | undefined): string => {
    if (!status) {
      return 'bg-gray-100 text-gray-800'
    }

    const statusValue = typeof status === 'string' ? status : (status.value || status.key || '')
    
    switch (statusValue.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // FIXED: Ensure safe string handling for booking status display
  const getBookingStatusText = (status: string | { key: string; value: string } | undefined): string => {
    if (!status) {
      return 'Unknown'
    }

    if (typeof status === 'string') {
      return status
    }

    return status.value || status.key || 'Unknown'
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <button
          onClick={() => handleMonthChange(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={() => handleMonthChange(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
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
          {calendarDays.map((day, index) => (
            <div
              key={`${day.date}-${index}`}
              className={`
                min-h-[100px] p-2 border border-gray-100 rounded-lg
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
              `}
            >
              <div className={`
                text-sm font-medium mb-2
                ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {day.dayNumber}
              </div>

              {/* Bookings for this day */}
              <div className="space-y-1">
                {day.bookings.slice(0, 3).map(booking => {
                  // FIXED: Ensure safe access to booking properties
                  const attendeeName = booking.metadata?.attendee_name || 'Unknown'
                  const bookingTime = booking.metadata?.booking_time || ''
                  const status = booking.metadata?.status
                  
                  return (
                    <button
                      key={booking.id}
                      onClick={() => handleBookingClick(booking)}
                      className={`
                        w-full text-left p-1 rounded text-xs truncate
                        ${getBookingStatusColor(status)}
                        hover:opacity-80 transition-opacity
                      `}
                      title={`${attendeeName} - ${formatTime(bookingTime)}`}
                    >
                      <div className="truncate">
                        {formatTime(bookingTime)}
                      </div>
                      <div className="truncate font-medium">
                        {attendeeName}
                      </div>
                    </button>
                  )
                })}

                {day.bookings.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.bookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Booking Details
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Attendee</label>
                <p className="text-gray-900">{selectedBooking.metadata?.attendee_name || 'Unknown'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedBooking.metadata?.attendee_email || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <p className="text-gray-900">
                  {selectedBooking.metadata?.booking_date ? formatDate(selectedBooking.metadata.booking_date) : 'Unknown date'} at{' '}
                  {selectedBooking.metadata?.booking_time ? formatTime(selectedBooking.metadata.booking_time) : 'Unknown time'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <p className="text-gray-900">
                  {selectedBooking.metadata?.event_type?.metadata?.event_name || 
                   selectedBooking.metadata?.event_type?.title || 
                   'Unknown event type'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${getBookingStatusColor(selectedBooking.metadata?.status)}
                `}>
                  {getBookingStatusText(selectedBooking.metadata?.status)}
                </span>
              </div>

              {selectedBooking.metadata?.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-gray-900">{selectedBooking.metadata.notes}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {onUpdateBooking && (
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'Confirmed')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'Cancelled')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}