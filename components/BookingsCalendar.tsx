'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Booking } from '@/types'
import CalendarGrid from '@/components/CalendarGrid'
import BookingsList from '@/components/BookingsList'
import MeetingDetailsModal from '@/components/MeetingDetailsModal'
import { Calendar, List, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'

interface BookingsCalendarProps {
  bookings: Booking[]
  onBookingUpdated: () => void
}

export default function BookingsCalendar({ bookings, onBookingUpdated }: BookingsCalendarProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  const handleBookingClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedBooking(null)
  }, [])

  const handleBookingUpdatedCallback = useCallback(() => {
    router.refresh()
    onBookingUpdated()
    setSelectedBooking(null)
  }, [router, onBookingUpdated])

  const selectedDateBookings = selectedDate 
    ? bookings.filter(booking => {
        const bookingDate = booking.metadata?.booking_date
        if (!bookingDate) return false
        
        const bookingDateObj = new Date(bookingDate + 'T00:00:00')
        const selectedDateObj = new Date(selectedDate + 'T00:00:00')
        
        return bookingDateObj.toDateString() === selectedDateObj.toDateString()
      })
    : []

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              view === 'calendar'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              view === 'list'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            List View
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          Total Bookings: <span className="font-medium text-gray-900">{bookings.length}</span>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="text-sm text-primary hover:underline mt-1"
                  >
                    Go to today
                  </button>
                </div>
                
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <CalendarGrid
                bookings={bookings}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
              />
            </div>
          </div>

          {/* Sidebar - Selected Date Bookings */}
          <div className="space-y-4">
            {selectedDate && (
              <div className="card">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>

                {selectedDateBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {booking.metadata?.attendee_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {booking.metadata?.booking_time}
                            </p>
                          </div>
                          <div className="text-xs">
                            {typeof booking.metadata?.status === 'string' ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.metadata.status === 'confirmed' || booking.metadata.status === 'Confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.metadata.status === 'cancelled' || booking.metadata.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.metadata.status === 'completed' || booking.metadata.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.metadata.status}
                              </span>
                            ) : booking.metadata?.status?.value ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.metadata.status.key === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.metadata.status.key === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.metadata.status.key === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.metadata.status.value}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No bookings for this date</p>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="card">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This Month:</span>
                  <span className="font-medium">
                    {bookings.filter(booking => {
                      if (!booking.metadata?.booking_date) return false
                      const bookingDate = new Date(booking.metadata.booking_date)
                      return bookingDate.getMonth() === currentMonth.getMonth() &&
                             bookingDate.getFullYear() === currentMonth.getFullYear()
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confirmed:</span>
                  <span className="font-medium text-green-600">
                    {bookings.filter(booking => {
                      const status = booking.metadata?.status
                      return (typeof status === 'string' && (status === 'confirmed' || status === 'Confirmed')) ||
                             (typeof status === 'object' && status?.key === 'confirmed')
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-blue-600">
                    {bookings.filter(booking => {
                      const status = booking.metadata?.status
                      return (typeof status === 'string' && (status === 'completed' || status === 'Completed')) ||
                             (typeof status === 'object' && status?.key === 'completed')
                    }).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <BookingsList 
          bookings={bookings}
          onBookingClick={handleBookingClick}
        />
      )}

      {/* Meeting Details Modal */}
      {selectedBooking && (
        <MeetingDetailsModal
          booking={selectedBooking}
          onClose={handleCloseModal}
          onBookingUpdated={handleBookingUpdatedCallback}
        />
      )}
    </div>
  )
}