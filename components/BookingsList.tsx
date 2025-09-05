'use client'

import { useState } from 'react'
import { Booking } from '@/types'
import { formatTime, formatDate } from '@/lib/availability'

export interface BookingsListProps {
  bookings: Booking[]
  onBookingUpdate: (updatedBooking: Booking) => void
}

export default function BookingsList({ bookings, onBookingUpdate }: BookingsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set())

  // Convert Set to Array for iteration to avoid TS2802 error
  const expandedBookingsArray = Array.from(expandedBookings)

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true
    
    const status = booking.metadata?.status
    if (typeof status === 'string') {
      return status.toLowerCase() === statusFilter
    } else if (status && typeof status === 'object' && 'key' in status) {
      return status.key === statusFilter
    }
    return false
  })

  const toggleExpanded = (bookingId: string) => {
    const newExpanded = new Set(expandedBookings)
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId)
    } else {
      newExpanded.add(bookingId)
    }
    setExpandedBookings(newExpanded)
  }

  const updateBookingStatus = async (bookingId: string, newStatus: { key: string; value: string }) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      const { booking: updatedBooking } = await response.json()
      onBookingUpdate(updatedBooking)
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const getStatusColor = (status: string | { key: string; value: string } | undefined) => {
    const statusValue = typeof status === 'string' ? status : status?.value || 'confirmed'
    const statusKey = typeof status === 'string' ? status.toLowerCase() : status?.key || 'confirmed'
    
    switch (statusKey.toLowerCase()) {
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

  const statusOptions = [
    { key: 'confirmed', value: 'Confirmed' },
    { key: 'completed', value: 'Completed' },
    { key: 'cancelled', value: 'Cancelled' }
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({bookings.length})
        </button>
        {statusOptions.map((status) => {
          const count = bookings.filter(booking => {
            const bookingStatus = booking.metadata?.status
            if (typeof bookingStatus === 'string') {
              return bookingStatus.toLowerCase() === status.key
            } else if (bookingStatus && typeof bookingStatus === 'object' && 'key' in bookingStatus) {
              return bookingStatus.key === status.key
            }
            return false
          }).length

          return (
            <button
              key={status.key}
              onClick={() => setStatusFilter(status.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.value} ({count})
            </button>
          )
        })}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found for the selected filter.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isExpanded = expandedBookings.has(booking.id)
            const status = booking.metadata?.status
            const statusValue = typeof status === 'string' ? status : status?.value || 'Confirmed'

            return (
              <div key={booking.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {booking.metadata?.attendee_name || 'Unknown'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {statusValue}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📧 {booking.metadata?.attendee_email}</p>
                      <p>📅 {booking.metadata?.booking_date && formatDate(booking.metadata.booking_date)}</p>
                      <p>🕒 {booking.metadata?.booking_time && formatTime(booking.metadata.booking_time)}</p>
                      {booking.metadata?.event_type && (
                        <p>📋 {typeof booking.metadata.event_type === 'object' && booking.metadata.event_type.title 
                          ? booking.metadata.event_type.title 
                          : 'Event Type'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={typeof status === 'string' ? status.toLowerCase() : status?.key || 'confirmed'}
                      onChange={(e) => {
                        const selectedOption = statusOptions.find(opt => opt.key === e.target.value)
                        if (selectedOption) {
                          updateBookingStatus(booking.id, selectedOption)
                        }
                      }}
                      className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => toggleExpanded(booking.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                        <p><strong>Created:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>
                        <p><strong>ID:</strong> {booking.id}</p>
                        <p><strong>Slug:</strong> {booking.slug}</p>
                      </div>
                      
                      {booking.metadata?.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                          <p className="text-gray-600">{booking.metadata.notes}</p>
                        </div>
                      )}
                    </div>
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