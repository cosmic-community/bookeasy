'use client'

import { useState } from 'react'
import { Booking } from '@/types'
import { formatDate, formatTime } from '@/lib/availability'

interface BookingFormModalProps {
  booking: Booking
  onClose: () => void
  onStatusUpdate: (updatedBooking: Booking) => void
}

type BookingStatusOption = {
  key: string
  value: string
}

export default function BookingFormModal({ booking, onClose, onStatusUpdate }: BookingFormModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  // Available status options
  const statusOptions: BookingStatusOption[] = [
    { key: 'confirmed', value: 'Confirmed' },
    { key: 'cancelled', value: 'Cancelled' },
    { key: 'completed', value: 'Completed' }
  ]

  // Get current status safely
  const getCurrentStatus = (): BookingStatusOption => {
    const status = booking.metadata?.status
    
    if (typeof status === 'string') {
      // Find matching option by value (case-insensitive)
      const matchingOption = statusOptions.find(opt => 
        opt.value.toLowerCase() === status.toLowerCase()
      )
      return matchingOption || { key: status.toLowerCase(), value: status }
    }
    
    if (status && typeof status === 'object' && 'key' in status && 'value' in status) {
      return {
        key: String(status.key),
        value: String(status.value)
      }
    }
    
    // Default fallback
    return { key: 'confirmed', value: 'Confirmed' }
  }

  const currentStatus = getCurrentStatus()

  const handleStatusUpdate = async (newStatus: BookingStatusOption) => {
    if (!booking.id) {
      setError('Booking ID is missing')
      return
    }

    setIsUpdating(true)
    setError('')

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
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

      const { booking: updatedBooking } = await response.json()
      onStatusUpdate(updatedBooking)
    } catch (error) {
      console.error('Error updating booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to update booking')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: BookingStatusOption) => {
    switch (status.key.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-600 hover:bg-green-700'
      case 'cancelled':
        return 'bg-red-600 hover:bg-red-700'
      case 'completed':
        return 'bg-blue-600 hover:bg-blue-700'
      default:
        return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  // Safe property access with defaults
  const attendeeName = booking.metadata?.attendee_name || 'Unknown Attendee'
  const attendeeEmail = booking.metadata?.attendee_email || 'No email provided'
  const bookingDate = booking.metadata?.booking_date || ''
  const bookingTime = booking.metadata?.booking_time || ''
  const notes = booking.metadata?.notes || ''
  const eventName = booking.metadata?.event_type?.metadata?.event_name || 
                   booking.metadata?.event_type?.title || 'Unknown Event'
  const eventDuration = booking.metadata?.event_type?.metadata?.duration || 30

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Booking Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Booking Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
              <p className="text-sm text-gray-600">{eventName}</p>
              <p className="text-xs text-gray-500">{eventDuration} minutes</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Date & Time</h4>
              <p className="text-sm text-gray-600">{formatDate(bookingDate)}</p>
              <p className="text-sm text-gray-600">{formatTime(bookingTime)}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Attendee</h4>
              <p className="text-sm text-gray-600">{attendeeName}</p>
              <p className="text-sm text-gray-500">{attendeeEmail}</p>
            </div>

            {notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{notes}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                currentStatus.key === 'confirmed' ? 'bg-green-100 text-green-800' :
                currentStatus.key === 'cancelled' ? 'bg-red-100 text-red-800' :
                currentStatus.key === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentStatus.value}
              </span>
            </div>
          </div>

          {/* Status Update Actions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
            <div className="space-y-2">
              {statusOptions.map((option) => {
                const isCurrentStatus = option.key === currentStatus.key
                
                return (
                  <button
                    key={option.key}
                    onClick={() => handleStatusUpdate(option)}
                    disabled={isUpdating || isCurrentStatus}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg border transition-all duration-200
                      ${isCurrentStatus 
                        ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed' 
                        : `border-transparent text-white ${getStatusColor(option)} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.value}</span>
                      {isCurrentStatus && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isUpdating && !isCurrentStatus && (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}