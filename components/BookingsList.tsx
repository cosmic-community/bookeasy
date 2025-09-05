import { useState } from 'react'
import { Booking } from '@/types'
import { formatDate, formatTime } from '@/lib/availability'

export interface BookingsListProps {
  bookings: Booking[]
  onBookingClick?: (booking: Booking) => void
}

export default function BookingsList({ bookings, onBookingClick }: BookingsListProps) {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all')

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    
    const status = typeof booking.metadata?.status === 'string' 
      ? booking.metadata.status.toLowerCase()
      : booking.metadata?.status?.key?.toLowerCase() || ''
    
    return status === filter
  })

  // Sort bookings by date and time
  const sortedBookings = filteredBookings.sort((a, b) => {
    const dateA = new Date(`${a.metadata?.booking_date} ${a.metadata?.booking_time}`).getTime()
    const dateB = new Date(`${b.metadata?.booking_date} ${b.metadata?.booking_time}`).getTime()
    return dateB - dateA // Most recent first
  })

  const getStatusColor = (status: string | { key: string; value: string } | undefined) => {
    const statusKey = typeof status === 'string' 
      ? status.toLowerCase()
      : status?.key?.toLowerCase() || ''

    switch (statusKey) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDisplay = (status: string | { key: string; value: string } | undefined) => {
    if (typeof status === 'string') {
      return status
    }
    return status?.value || 'Unknown'
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
        <p className="text-gray-600">Bookings will appear here once people start scheduling meetings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All', count: bookings.length },
          { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => {
            const status = typeof b.metadata?.status === 'string' 
              ? b.metadata.status.toLowerCase()
              : b.metadata?.status?.key?.toLowerCase() || ''
            return status === 'confirmed'
          }).length },
          { key: 'completed', label: 'Completed', count: bookings.filter(b => {
            const status = typeof b.metadata?.status === 'string' 
              ? b.metadata.status.toLowerCase()
              : b.metadata?.status?.key?.toLowerCase() || ''
            return status === 'completed'
          }).length },
          { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => {
            const status = typeof b.metadata?.status === 'string' 
              ? b.metadata.status.toLowerCase()
              : b.metadata?.status?.key?.toLowerCase() || ''
            return status === 'cancelled'
          }).length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {sortedBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No bookings found for the selected filter.</p>
          </div>
        ) : (
          sortedBookings.map((booking) => {
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
                className={`card hover:shadow-md transition-shadow duration-200 ${
                  onBookingClick ? 'cursor-pointer' : ''
                }`}
                onClick={onBookingClick ? () => onBookingClick(booking) : undefined}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {eventType?.title || 'Meeting'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          with {attendeeName} ({attendeeEmail})
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                        {getStatusDisplay(status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {bookingDate ? formatDate(bookingDate) : 'No date'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            {bookingTime ? formatTime(bookingTime) : 'No time'}
                          </span>
                          {eventType?.metadata?.duration && (
                            <span className="text-gray-500 ml-1">
                              ({eventType.metadata.duration} min)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{attendeeName}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{attendeeEmail}</span>
                        </div>
                      </div>
                    </div>

                    {notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {notes}
                        </p>
                      </div>
                    )}

                    {eventType?.metadata?.description && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Meeting type:</span> {eventType.metadata.description}
                      </div>
                    )}
                  </div>
                </div>

                {onBookingClick && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center text-primary text-sm font-medium">
                      Click to view details
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}