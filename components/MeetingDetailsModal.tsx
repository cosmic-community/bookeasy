'use client'

import { useState } from 'react'
import { Booking } from '@/types'
import { formatDate, formatTime } from '@/lib/availability'

export interface MeetingDetailsModalProps {
  booking: Booking
  onClose: () => void
  onBookingUpdated: () => void
}

export default function MeetingDetailsModal({
  booking,
  onClose,
  onBookingUpdated
}: MeetingDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: { key: string; value: string }) => {
    if (!booking.id) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      onBookingUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusDisplay = () => {
    const status = booking.metadata?.status
    if (typeof status === 'string') {
      return status
    } else if (status && typeof status === 'object' && 'value' in status) {
      return status.value
    }
    return 'Unknown'
  }

  const getStatusColor = () => {
    const status = booking.metadata?.status
    const statusValue = typeof status === 'string' ? status : status?.value
    
    switch (statusValue?.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting Details
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

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">
                {booking.metadata?.event_type?.metadata?.event_name || booking.metadata?.event_type?.title || 'Meeting'}
              </h3>
              <p className="text-sm text-gray-600">
                with {booking.metadata?.attendee_name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </label>
                <p className="text-sm text-gray-900">
                  {booking.metadata?.booking_date ? formatDate(booking.metadata.booking_date) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Time
                </label>
                <p className="text-sm text-gray-900">
                  {booking.metadata?.booking_time ? formatTime(booking.metadata.booking_time) : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Attendee Email
              </label>
              <p className="text-sm text-gray-900">
                {booking.metadata?.attendee_email || 'N/A'}
              </p>
            </div>

            {booking.metadata?.notes && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Notes
                </label>
                <p className="text-sm text-gray-900">
                  {booking.metadata.notes}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Status
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
                {getStatusDisplay()}
              </span>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => handleStatusChange({ key: 'confirmed', value: 'Confirmed' })}
                disabled={isUpdating}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </button>
              <button
                onClick={() => handleStatusChange({ key: 'cancelled', value: 'Cancelled' })}
                disabled={isUpdating}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {isUpdating ? 'Updating...' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}