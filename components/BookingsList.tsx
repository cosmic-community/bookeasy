'use client'

import { useState } from 'react'
import { Booking } from '@/types'
import { formatDate, formatTime, formatDuration } from '@/lib/availability'
import BookingModal from './BookingModal'

interface BookingsListProps {
  bookings: Booking[]
  onBookingClick?: (booking: Booking) => void
}

export default function BookingsList({ bookings, onBookingClick }: BookingsListProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6M3 21l18-18" />
          </svg>
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
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{attendeeEmail || 'No email provided'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v1a2 2 0 002 2h4a2 2 0 002-2v-1M3 21h18M3 10h18" />
                      </svg>
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v1a2 2 0 002 2h4a2 2 0 002-2v-1M3 21h18M3 10h18" />
                      </svg>
                      <span>
                        {bookingDate ? formatDate(bookingDate) : 'No date set'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {bookingTime ? formatTime(bookingTime) : 'No time set'}
                      </span>
                    </div>
                    
                    {notes && (
                      <div className="flex items-start gap-2 pt-1">
                        <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1-8l-1-1a2 2 0 00-2.828 0L2.586 5.586A2 2 0 002 7.414V10a2 2 0 002 2h2.414a2 2 0 001.414-.586L9 10l1-1z" />
                        </svg>
                        <span className="text-gray-500 italic">{notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
        />
      )}
    </>
  )
}