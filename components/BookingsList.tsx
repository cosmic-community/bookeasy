'use client'

import { useState, useCallback } from 'react'
import { Booking } from '@/types'
import { formatDate, formatTime, formatDuration } from '@/lib/availability'
import BookingModal from './BookingModal'
import { CalendarX2, Check, X, Clock, User, Mail, Calendar, FileText, ChevronRight } from 'lucide-react'

interface BookingsListProps {
  bookings: Booking[]
  onBookingClick?: (booking: Booking) => void
  onBookingUpdated?: (booking: Booking) => void
}

export default function BookingsList({ bookings: initialBookings, onBookingClick, onBookingUpdated }: BookingsListProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)

  // Callback to handle booking updates
  const handleBookingUpdated = useCallback((updatedBooking: Booking) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    )
    
    // Also notify parent component if callback provided
    if (onBookingUpdated) {
      onBookingUpdated(updatedBooking)
    }
  }, [onBookingUpdated])

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <CalendarX2 className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
        <p className="text-gray-500">There are no bookings to display at this time.</p>
      </div>
    )
  }

  const handleBookingClick = (booking: Booking) => {
    if (onBookingClick) {
      onBookingClick(booking)
    } else {
      setSelectedBooking(booking)
    }
  }

  const getStatusColor = (status: string | { key: string; value: string } | undefined) => {
    const statusValue = typeof status === 'string' ? status : status?.value || 'confirmed'
    
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

  const getStatusIcon = (status: string | { key: string; value: string } | undefined) => {
    const statusValue = typeof status === 'string' ? status : status?.value || 'confirmed'
    
    switch (statusValue.toLowerCase()) {
      case 'confirmed':
        return <Check className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      case 'completed':
        return <Check className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const eventType = booking.metadata?.event_type
          const bookingDate = booking.metadata?.booking_date
          const bookingTime = booking.metadata?.booking_time
          const attendeeName = booking.metadata?.attendee_name
          const attendeeEmail = booking.metadata?.attendee_email
          const status = booking.metadata?.status
          const notes = booking.metadata?.notes

          return (
            <div
              key={booking.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleBookingClick(booking)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {attendeeName || 'Unknown Attendee'}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      {typeof status === 'string' ? status : status?.value || 'Confirmed'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{attendeeEmail || 'No email provided'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {eventType?.title || 'Unknown Event Type'}
                        {eventType?.metadata?.duration && (
                          <span className="text-gray-400">
                            {' '}({formatDuration(eventType.metadata.duration)})
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {bookingDate ? formatDate(bookingDate) : 'No date set'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {bookingTime ? formatTime(bookingTime) : 'No time set'}
                      </span>
                    </div>
                    
                    {notes && (
                      <div className="flex items-start gap-2 pt-1">
                        <FileText className="w-4 h-4 mt-0.5" />
                        <span className="text-gray-500 italic">{notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Booking Modal */}
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onBookingUpdated={handleBookingUpdated}
        />
      )}
    </>
  )
}