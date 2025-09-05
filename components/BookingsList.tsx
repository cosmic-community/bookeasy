'use client'

import { useState } from 'react'
import { Booking } from '@/types'

interface BookingsListProps {
  bookings: Booking[]
  onBookingUpdated?: (booking: Booking) => void
}

export default function BookingsList({ bookings: initialBookings, onBookingUpdated }: BookingsListProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null)

  const handleStatusUpdate = async (bookingId: string, status: { key: string; value: string }) => {
    setUpdatingBooking(bookingId)
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking status')
      }

      const { booking: updatedBooking } = await response.json()
      
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? updatedBooking : booking
        )
      )

      // Call the parent callback if provided
      if (onBookingUpdated) {
        onBookingUpdated(updatedBooking)
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert(error instanceof Error ? error.message : 'Failed to update booking status')
    } finally {
      setUpdatingBooking(null)
    }
  }

  // Helper function to safely get status key and value
  const getStatusInfo = (status: string | { key: string; value: string } | undefined) => {
    if (!status) return { key: 'unknown', value: 'Unknown' }
    if (typeof status === 'string') return { key: status, value: status }
    return status
  }

  // Update bookings when props change
  if (initialBookings !== bookings && JSON.stringify(initialBookings) !== JSON.stringify(bookings)) {
    setBookings(initialBookings)
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No bookings found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const eventType = booking.metadata?.event_type
        const statusInfo = getStatusInfo(booking.metadata?.status)
        const isUpdating = updatingBooking === booking.id

        return (
          <div key={booking.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.metadata?.attendee_name}
                  </h3>
                  <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                    statusInfo.key === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : statusInfo.key === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : statusInfo.key === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {statusInfo.value}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span> {booking.metadata?.attendee_email}
                  </p>
                  <p>
                    <span className="font-medium">Event:</span> {eventType?.title || 'Unknown Event'}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {booking.metadata?.booking_date} at {booking.metadata?.booking_time}
                  </p>
                  {booking.metadata?.notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {booking.metadata.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="ml-4 flex flex-col space-y-2">
                {statusInfo.key !== 'completed' && (
                  <button
                    onClick={() => handleStatusUpdate(booking.id, { key: 'completed', value: 'Completed' })}
                    disabled={isUpdating}
                    className="btn btn-accent text-xs px-3 py-1 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Mark Complete'}
                  </button>
                )}
                
                {statusInfo.key !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate(booking.id, { key: 'cancelled', value: 'Cancelled' })}
                    disabled={isUpdating}
                    className="btn bg-red-500 text-white hover:bg-red-600 text-xs px-3 py-1 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}