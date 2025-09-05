'use client'

import { useState } from 'react'
import { Booking } from '@/types'

export interface BookingModalProps {
  booking: Booking
  onClose: () => void
  onBookingUpdated: (updatedBooking: Booking) => void
}

export default function BookingModal({ booking, onClose, onBookingUpdated }: BookingModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    setError('')

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: { key: newStatus.toLowerCase(), value: newStatus }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking')
      }

      const { booking: updatedBooking } = await response.json()
      onBookingUpdated(updatedBooking)
      onClose()
    } catch (error) {
      console.error('Error updating booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to update booking')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date not available'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'Time not available'
    const timeParts = timeString.split(':')
    const hours = timeParts[0]
    const minutes = timeParts[1]
    
    // Ensure both hours and minutes are defined before parsing
    if (!hours || !minutes) return 'Invalid time'
    
    const date = new Date()
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string | { key: string; value: string }) => {
    const statusValue = typeof status === 'string' ? status : status.value
    switch (statusValue?.toLowerCase()) {
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

  const currentStatus = typeof booking.metadata.status === 'string' 
    ? booking.metadata.status 
    : booking.metadata.status?.value || 'Unknown'

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            📅 Booking Details
          </h2>
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
        <div className="px-6 py-4 space-y-6">
          {/* Event Type */}
          {booking.metadata.event_type && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {booking.metadata.event_type.title}
              </h3>
              <p className="text-gray-600">
                {booking.metadata.event_type.metadata?.description}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Duration: {booking.metadata.event_type.metadata?.duration} minutes
              </p>
            </div>
          )}

          {/* Attendee Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendee Name
              </label>
              <p className="text-gray-900">{booking.metadata.attendee_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{booking.metadata.attendee_email}</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <p className="text-gray-900">
                {formatDate(booking.metadata.booking_date)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <p className="text-gray-900">
                {formatTime(booking.metadata.booking_time)}
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.metadata.status || 'Unknown')}`}>
              {currentStatus}
            </span>
          </div>

          {/* Notes */}
          {booking.metadata.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {booking.metadata.notes}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Update booking status:
            </p>
            <div className="flex items-center space-x-3">
              {currentStatus !== 'Confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('Confirmed')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Confirm'}
                </button>
              )}
              
              {currentStatus !== 'Completed' && (
                <button
                  onClick={() => handleStatusUpdate('Completed')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Complete'}
                </button>
              )}
              
              {currentStatus !== 'Cancelled' && (
                <button
                  onClick={() => handleStatusUpdate('Cancelled')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}