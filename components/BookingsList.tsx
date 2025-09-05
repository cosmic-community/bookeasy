'use client'

import { useState } from 'react'
import { Booking } from '@/types'
import { formatDate, formatTime } from '@/lib/availability'

interface BookingsListProps {
  bookings: Booking[]
  onBookingUpdate: () => void
}

export default function BookingsList({ bookings, onBookingUpdate }: BookingsListProps) {
  const [updatingBookings, setUpdatingBookings] = useState<Set<string>>(new Set())

  const handleStatusUpdate = async (bookingId: string, newStatus: { key: string; value: string }) => {
    setUpdatingBookings(prev => new Set([...prev, bookingId]))

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking')
      }

      // Refresh bookings list
      onBookingUpdate()

    } catch (error) {
      console.error('Error updating booking:', error)
      alert(error instanceof Error ? error.message : 'Failed to update booking')
    } finally {
      setUpdatingBookings(prev => {
        const newSet = new Set(prev)
        newSet.delete(bookingId)
        return newSet
      })
    }
  }

  const getStatusColor = (status: string | { key: string; value: string }): string => {
    const statusValue = typeof status === 'string' ? status : status.value
    
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

  const getStatusText = (status: string | { key: string; value: string }): string => {
    if (typeof status === 'string') {
      return status
    }
    return status.value || status.key || 'Unknown'
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-500">When people book meetings, they'll appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const isUpdating = updatingBookings.has(booking.id)
        const currentStatus = getStatusText(booking.metadata?.status || { key: 'unknown', value: 'Unknown' })
        
        return (
          <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.metadata?.attendee_name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.metadata?.status || 'unknown')}`}>
                    {currentStatus}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span>{booking.metadata?.attendee_email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {booking.metadata?.booking_date ? formatDate(booking.metadata.booking_date) : 'No date'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {booking.metadata?.booking_time ? formatTime(booking.metadata.booking_time) : 'No time'}
                    </span>
                  </div>

                  {booking.metadata?.event_type && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>
                        {typeof booking.metadata.event_type === 'object' && booking.metadata.event_type?.title
                          ? booking.metadata.event_type.title
                          : 'Event Type'}
                      </span>
                    </div>
                  )}

                  {booking.metadata?.notes && (
                    <div className="flex items-start space-x-2 mt-2">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="bg-gray-50 rounded px-3 py-2 text-sm">
                        <span className="font-medium">Notes:</span> {booking.metadata.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {currentStatus.toLowerCase() !== 'cancelled' && currentStatus.toLowerCase() !== 'completed' && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleStatusUpdate(booking.id, { key: 'completed', value: 'Completed' })}
                    disabled={isUpdating}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      isUpdating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {isUpdating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ...
                      </span>
                    ) : (
                      'Mark Complete'
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate(booking.id, { key: 'cancelled', value: 'Cancelled' })}
                    disabled={isUpdating}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      isUpdating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}