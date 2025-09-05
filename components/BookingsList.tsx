'use client'

import { useState, useMemo } from 'react'
import { Booking } from '@/types'
import { formatDate, formatTime } from '@/lib/availability'
import BookingFormModal from './BookingFormModal'

interface BookingsListProps {
  bookings: Booking[]
  onBookingUpdate: (updatedBooking: Booking) => void
}

export default function BookingsList({ bookings, onBookingUpdate }: BookingsListProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Get unique statuses for filter - Fix Set iteration issue
  const availableStatuses = useMemo(() => {
    const statusSet = new Set<string>()
    bookings.forEach(booking => {
      const status = booking.metadata?.status
      if (typeof status === 'string') {
        statusSet.add(status)
      } else if (status && typeof status === 'object' && status.value) {
        statusSet.add(status.value)
      }
    })
    // Convert Set to Array for iteration
    return Array.from(statusSet)
  }, [bookings])

  // Filter bookings based on status
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings
    
    return bookings.filter(booking => {
      const status = booking.metadata?.status
      const statusValue = typeof status === 'string' ? status : status?.value
      return statusValue?.toLowerCase() === statusFilter.toLowerCase()
    })
  }, [bookings, statusFilter])

  // Group bookings by date
  const groupedBookings = useMemo(() => {
    const groups: { [key: string]: Booking[] } = {}
    
    filteredBookings.forEach(booking => {
      const date = booking.metadata?.booking_date
      if (date) {
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(booking)
      }
    })

    // Sort groups by date (most recent first)
    const sortedGroups = Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((acc, date) => {
        acc[date] = groups[date].sort((a, b) => {
          const timeA = a.metadata?.booking_time || ''
          const timeB = b.metadata?.booking_time || ''
          return timeA.localeCompare(timeB)
        })
        return acc
      }, {} as { [key: string]: Booking[] })

    return sortedGroups
  }, [filteredBookings])

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  const handleModalClose = () => {
    setSelectedBooking(null)
  }

  const handleStatusUpdate = (updatedBooking: Booking) => {
    onBookingUpdate(updatedBooking)
    setSelectedBooking(null)
  }

  const getStatusColor = (status: string | { key: string; value: string } | undefined) => {
    const statusValue = typeof status === 'string' ? status : status?.value || ''
    
    switch (statusValue.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string | { key: string; value: string } | undefined): string => {
    if (typeof status === 'string') {
      return status
    }
    return status?.value || 'Unknown'
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-500">When people book appointments, they'll appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({bookings.length})
        </button>
        {availableStatuses.map(status => {
          const count = bookings.filter(booking => {
            const bookingStatus = booking.metadata?.status
            const statusValue = typeof bookingStatus === 'string' ? bookingStatus : bookingStatus?.value
            return statusValue?.toLowerCase() === status.toLowerCase()
          }).length

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                statusFilter === status
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status} ({count})
            </button>
          )
        })}
      </div>

      {/* Bookings List */}
      {Object.keys(groupedBookings).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No bookings match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBookings).map(([date, dateBookings]) => (
            <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(date)}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {dateBookings.length} booking{dateBookings.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {dateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => handleBookingClick(booking)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {booking.metadata?.attendee_name || 'Unknown Attendee'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {booking.metadata?.attendee_email || 'No email'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {booking.metadata?.event_type?.metadata?.event_name || 
                               booking.metadata?.event_type?.title || 'Unknown Event'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatTime(booking.metadata?.booking_time || '')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.metadata?.event_type?.metadata?.duration || 30}min
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.metadata?.status)}`}>
                          {getStatusText(booking.metadata?.status)}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingFormModal
          booking={selectedBooking}
          onClose={handleModalClose}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}