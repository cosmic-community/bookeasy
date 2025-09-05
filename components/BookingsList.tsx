'use client'

import { useState } from 'react'
import { Booking } from '@/types'
import BookingModal from './BookingModal'
import { formatTime, formatDate } from '@/lib/availability'

interface BookingsListProps {
  bookings: Booking[]
}

export default function BookingsList({ bookings }: BookingsListProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Safely filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true
    
    const bookingStatus = booking.metadata?.status
    
    if (typeof bookingStatus === 'string') {
      return bookingStatus.toLowerCase() === statusFilter.toLowerCase()
    } else if (typeof bookingStatus === 'object' && bookingStatus?.key) {
      return bookingStatus.key.toLowerCase() === statusFilter.toLowerCase()
    }
    
    return false
  })

  // Sort bookings by date (newest first)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = a.metadata?.booking_date || ''
    const dateB = b.metadata?.booking_date || ''
    const timeA = a.metadata?.booking_time || ''
    const timeB = b.metadata?.booking_time || ''
    
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA)
    }
    return timeB.localeCompare(timeA)
  })

  const getStatusColor = (status: string | { key: string; value: string } | undefined) => {
    let statusKey = ''
    
    if (typeof status === 'string') {
      statusKey = status.toLowerCase()
    } else if (typeof status === 'object' && status?.key) {
      statusKey = status.key.toLowerCase()
    }
    
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

  const getStatusText = (status: string | { key: string; value: string } | undefined) => {
    if (typeof status === 'string') {
      return status
    } else if (typeof status === 'object' && status?.value) {
      return status.value
    }
    return 'Unknown'
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No bookings yet
        </h2>
        <p className="text-gray-600 mb-6">
          Your scheduled appointments will appear here.
        </p>
        <a href="/" className="btn btn-primary">
          Create Event Type
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Filter by status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select text-sm"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedBookings.map((booking) => {
          const eventType = booking.metadata?.event_type
          const bookingDate = booking.metadata?.booking_date
          const bookingTime = booking.metadata?.booking_time
          const attendeeName = booking.metadata?.attendee_name
          const attendeeEmail = booking.metadata?.attendee_email
          const status = booking.metadata?.status

          return (
            <div
              key={booking.id}
              className="card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedBooking(booking)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {attendeeName || 'Unknown Attendee'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {attendeeEmail || 'No email provided'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
                    >
                      {getStatusText(status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Event:</span>
                      <br />
                      {typeof eventType === 'object' && eventType?.title 
                        ? eventType.title 
                        : 'Unknown Event Type'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>
                      <br />
                      {bookingDate ? formatDate(bookingDate) : 'No date set'}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>
                      <br />
                      {bookingTime ? formatTime(bookingTime) : 'No time set'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </>
  )
}