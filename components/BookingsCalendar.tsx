'use client'

import { useState, useMemo } from 'react'
import { Booking } from '@/types'
import MeetingDetailsModal from './MeetingDetailsModal'

interface BookingsCalendarProps {
  bookings: Booking[]
  onBookingUpdated: (booking: Booking) => void
}

export default function BookingsCalendar({ bookings, onBookingUpdated }: BookingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Get the first day of the month and calculate calendar grid
  const firstDayOfMonth = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return date
  }, [currentDate])

  const lastDayOfMonth = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return date
  }, [currentDate])

  const startDate = useMemo(() => {
    const start = new Date(firstDayOfMonth)
    start.setDate(start.getDate() - start.getDay()) // Go to Sunday of first week
    return start
  }, [firstDayOfMonth])

  const endDate = useMemo(() => {
    const end = new Date(lastDayOfMonth)
    end.setDate(end.getDate() + (6 - end.getDay())) // Go to Saturday of last week
    return end
  }, [lastDayOfMonth])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [startDate, endDate])

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {}
    
    bookings.forEach(booking => {
      const date = booking.metadata?.booking_date
      // Add explicit check for undefined/null date
      if (date && typeof date === 'string') {
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(booking)
      }
    })
    
    return grouped
  }, [bookings])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getStatusColor = (statusKey: string): string => {
    switch (statusKey) {
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

  const getStatusInfo = (status: string | { key: string; value: string } | undefined) => {
    if (!status) return { key: 'unknown', value: 'Unknown' }
    if (typeof status === 'string') return { key: status, value: status }
    return status
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <button
              onClick={goToToday}
              className="btn btn-secondary text-sm px-3 py-1"
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {calendarDays.map((date, index) => {
              const dateKey = formatDateKey(date)
              const dayBookings = bookingsByDate[dateKey] || []
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)

              return (
                <div
                  key={index}
                  className={`bg-white min-h-[120px] p-2 ${
                    !isCurrentMonthDay ? 'opacity-40' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isTodayDate 
                      ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                      : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => {
                      const statusInfo = getStatusInfo(booking.metadata?.status)
                      // Add null check for booking_time to prevent undefined display
                      const bookingTime = booking.metadata?.booking_time || 'N/A'
                      const attendeeName = booking.metadata?.attendee_name || 'Unknown'
                      
                      return (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: statusInfo.key === 'confirmed' ? '#dcfce7' :
                                           statusInfo.key === 'cancelled' ? '#fee2e2' :
                                           statusInfo.key === 'completed' ? '#dbeafe' :
                                           '#f3f4f6',
                            color: statusInfo.key === 'confirmed' ? '#166534' :
                                   statusInfo.key === 'cancelled' ? '#991b1b' :
                                   statusInfo.key === 'completed' ? '#1e40af' :
                                   '#374151'
                          }}
                        >
                          <div className="font-medium truncate">
                            {bookingTime} - {attendeeName}
                          </div>
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

        {/* Legend */}
        <div className="px-6 pb-6">
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span className="text-gray-600">Confirmed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span className="text-gray-600">Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Details Modal */}
      {selectedBooking && (
        <MeetingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onBookingUpdated={(updatedBooking) => {
            onBookingUpdated(updatedBooking)
            setSelectedBooking(updatedBooking)
          }}
        />
      )}
    </>
  )
}