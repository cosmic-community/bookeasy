'use client'

import { useState, useRef, useEffect } from 'react'
import { Booking } from '@/types'
import { X } from 'lucide-react'

interface MeetingDetailsModalProps {
  booking: Booking
  onClose: () => void
  onBookingUpdated: (booking: Booking) => void
}

export default function MeetingDetailsModal({ 
  booking, 
  onClose, 
  onBookingUpdated 
}: MeetingDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const eventType = booking.metadata?.event_type
  
  // Helper function to safely get status key and value
  const getStatusInfo = (status: string | { key: string; value: string } | undefined) => {
    if (!status) return { key: 'unknown', value: 'Unknown' }
    if (typeof status === 'string') return { key: status, value: status }
    return status
  }

  const statusInfo = getStatusInfo(booking.metadata?.status)
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Handle clicking outside the modal to close it
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleStatusUpdate = async (newStatus: { key: string; value: string }) => {
    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking status')
      }

      const { booking: updatedBooking } = await response.json()
      onBookingUpdated(updatedBooking)
      onClose()
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert(error instanceof Error ? error.message : 'Failed to update booking status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (statusKey: string) => {
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {booking.metadata?.attendee_name}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(statusInfo.key)}`}>
                {statusInfo.value}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{booking.metadata?.attendee_email}</p>
              </div>

              <div>
                <span className="font-medium text-gray-700">Meeting Type:</span>
                <p className="text-gray-600">
                  {eventType?.metadata?.event_name || eventType?.title || 'Unknown Event'}
                </p>
              </div>

              <div>
                <span className="font-medium text-gray-700">Date & Time:</span>
                <p className="text-gray-600">
                  {booking.metadata?.booking_date && formatDate(booking.metadata.booking_date)} at {booking.metadata?.booking_time}
                </p>
              </div>

              {booking.metadata?.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-600">{booking.metadata.notes}</p>
                </div>
              )}

              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <p className="text-gray-600">
                  {eventType?.metadata?.duration || 30} minutes
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col space-y-2 pt-6 border-t border-gray-200">
              {statusInfo.key !== 'confirmed' && statusInfo.key !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate({ key: 'confirmed', value: 'Confirmed' })}
                  disabled={isUpdating}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Confirm'}
                </button>
              )}
              
              {statusInfo.key !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate({ key: 'completed', value: 'Completed' })}
                  disabled={isUpdating}
                  className="w-full btn btn-accent disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Mark as Completed'}
                </button>
              )}
              
              {statusInfo.key !== 'cancelled' && statusInfo.key !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate({ key: 'cancelled', value: 'Cancelled' })}
                  disabled={isUpdating}
                  className="w-full btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Cancel Meeting'}
                </button>
              )}
              
              {statusInfo.key === 'cancelled' && (
                <button
                  onClick={() => handleStatusUpdate({ key: 'confirmed', value: 'Confirmed' })}
                  disabled={isUpdating}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Reconfirm Meeting'}
                </button>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}