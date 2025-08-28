'use client'

import { useState, useMemo } from 'react'
import { Booking, EventType, Settings } from '@/types'
import CalendarGrid from '@/components/CalendarGrid'
import BookingModal from '@/components/BookingModal'
import MeetingDetailsModal from '@/components/MeetingDetailsModal'

interface CalendarProps {
  bookings: Booking[]
  eventTypes: EventType[]
  settings?: Settings | null
}

export default function Calendar({ bookings: initialBookings, eventTypes, settings }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState(initialBookings)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)

  // Get current month and year
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Get bookings grouped by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {}
    
    bookings.forEach(booking => {
      const date = booking.metadata?.booking_date
      if (date) {
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(booking)
      }
    })
    
    return grouped
  }, [bookings])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowBookingModal(true)
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowMeetingModal(true)
  }

  const handleBookingCreated = (newBooking: Booking) => {
    setBookings(prev => [...prev, newBooking])
    setShowBookingModal(false)
    setSelectedDate(null)
  }

  const handleBookingUpdated = (updatedBooking: Booking) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    )
    setShowMeetingModal(false)
    setSelectedBooking(null)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToToday}
            className="btn btn-secondary text-sm"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="btn btn-secondary p-2"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="btn btn-secondary p-2"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        currentDate={currentDate}
        bookingsByDate={bookingsByDate}
        onDateClick={handleDateClick}
        onBookingClick={handleBookingClick}
      />

      {/* Booking Modal */}
      {showBookingModal && selectedDate && (
        <BookingModal
          selectedDate={selectedDate}
          eventTypes={eventTypes}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedDate(null)
          }}
          onBookingCreated={handleBookingCreated}
        />
      )}

      {/* Meeting Details Modal */}
      {showMeetingModal && selectedBooking && (
        <MeetingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowMeetingModal(false)
            setSelectedBooking(null)
          }}
          onBookingUpdated={handleBookingUpdated}
        />
      )}
    </div>
  )
}