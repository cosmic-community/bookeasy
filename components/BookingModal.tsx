'use client'

import { useState } from 'react'
import { Booking } from '@/types'
import { formatTime, formatDate, formatDuration } from '@/lib/availability'
import { X, User, Calendar, Clock, FileText, Building2 } from 'lucide-react'

interface BookingModalProps {
  booking: Booking
  onClose: () => void
  onBookingUpdated?: (booking: Booking) => void
}

export default function BookingModal({ booking, onClose, onBookingUpdated }: BookingModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(() => {
    const status = booking.metadata?.status
    if (typeof status === 'string') {
      return status
    } else if (typeof status === 'object' && status?.value) {
      return status.value
    }
    return 'Confirmed'
  })

  const eventType = booking.metadata?.event_type
  const bookingDate = booking.metadata?.booking_date
  const bookingTime = booking.metadata?.booking_time
  const attendeeName = booking.metadata?.attendee_name
  const attendeeEmail = booking.metadata?.attendee_email
  const notes = booking.metadata?.notes

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-[60] px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`
    toast.textContent = message
    
    // Add to DOM
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)'
      toast.style.opacity = '1'
    }, 10)
    
    // Remove after delay
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)'
      toast.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: { key: newStatus.toLowerCase(), value: newStatus }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      const { booking: updatedBooking } = await response.json()
      setCurrentStatus(newStatus)
      
      // Notify parent component of the updated booking
      if (onBookingUpdated) {
        onBookingUpdated(updatedBooking)
      }
      
      // Show success toast
      showToast(`Booking ${newStatus.toLowerCase()} successfully!`, 'success')
      
      // Close modal after brief delay to show toast
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (error) {
      console.error('Error updating booking status:', error)
      showToast('Failed to update booking status. Please try again.', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Booking Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUpdating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}
            >
              {currentStatus}
            </span>
            
            <div className="flex gap-2">
              {currentStatus !== 'Confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('Confirmed')}
                  disabled={isUpdating}
                  className="btn btn-sm bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Confirm'}
                </button>
              )}
              {currentStatus !== 'Completed' && (
                <button
                  onClick={() => handleStatusUpdate('Completed')}
                  disabled={isUpdating}
                  className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Complete'}
                </button>
              )}
              {currentStatus !== 'Cancelled' && (
                <button
                  onClick={() => handleStatusUpdate('Cancelled')}
                  disabled={isUpdating}
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>

          {/* Attendee Information */}
          <div className="card bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Attendee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{attendeeName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{attendeeEmail || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="card bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Event Type</label>
                <p className="text-gray-900">
                  {typeof eventType === 'object' && eventType?.title 
                    ? eventType.title 
                    : 'Unknown Event Type'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <p className="text-gray-900">
                  {typeof eventType === 'object' && eventType?.metadata?.duration
                    ? formatDuration(eventType.metadata.duration)
                    : 'Not specified'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900">
                  {bookingDate ? formatDate(bookingDate) : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Time</label>
                <p className="text-gray-900">
                  {bookingTime ? formatTime(bookingTime) : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Event Description */}
          {typeof eventType === 'object' && eventType?.metadata?.description && (
            <div className="card bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Event Description
              </h3>
              <p className="text-gray-700">
                {eventType.metadata.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="card bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          )}

          {/* Host Information */}
          {typeof eventType === 'object' && eventType?.metadata?.host && (
            <div className="card bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Host Information
              </h3>
              <div className="flex items-center gap-4">
                {typeof eventType.metadata.host === 'object' && eventType.metadata.host?.metadata?.profile_photo?.imgix_url && (
                  <img
                    src={`${eventType.metadata.host.metadata.profile_photo.imgix_url}?w=64&h=64&fit=crop&auto=format,compress`}
                    alt="Host"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {typeof eventType.metadata.host === 'object' && eventType.metadata.host?.metadata?.full_name
                      ? eventType.metadata.host.metadata.full_name
                      : 'Host'
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    {typeof eventType.metadata.host === 'object' && eventType.metadata.host?.metadata?.email
                      ? eventType.metadata.host.metadata.email
                      : 'No email provided'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isUpdating}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}