'use client'

import { useEffect, useRef } from 'react'
import { Booking } from '@/types'
import { formatTime, formatDate } from '@/lib/availability'

interface MeetingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
}

export default function MeetingDetailsModal({
  isOpen,
  onClose,
  booking
}: MeetingDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle click outside modal
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !booking) {
    return null
  }

  // Helper function to get status color
  const getStatusColor = (status: string | { key: string; value: string } | undefined) => {
    const statusValue = typeof status === 'string' ? status : status?.value || 'unknown'
    const normalizedStatus = statusValue.toLowerCase()
    
    switch (normalizedStatus) {
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

  // Helper function to get status display text
  const getStatusText = (status: string | { key: string; value: string } | undefined) => {
    if (typeof status === 'string') {
      return status
    } else if (status?.value) {
      return status.value
    }
    return 'Unknown'
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Booking Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Event Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {booking.metadata?.event_type?.metadata?.event_name || 
                 booking.metadata?.event_type?.title || 
                 'Event'}
              </h3>
              
              {booking.metadata?.event_type?.metadata?.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {booking.metadata.event_type.metadata.description}
                </p>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-900 font-medium">
                      {booking.metadata?.booking_date ? formatDate(booking.metadata.booking_date) : 'Date not available'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-900 font-medium">
                      {booking.metadata?.booking_time ? formatTime(booking.metadata.booking_time) : 'Time not available'}
                      {booking.metadata?.event_type?.metadata?.duration && (
                        <span className="text-gray-500 ml-1">
                          ({booking.metadata.event_type.metadata.duration} minutes)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.metadata?.status)}`}>
                      {getStatusText(booking.metadata?.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendee Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Attendee Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-900 font-medium">
                      {booking.metadata?.attendee_name || 'Name not provided'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-900">
                      {booking.metadata?.attendee_email || 'Email not provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.metadata?.notes && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Additional Notes
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {booking.metadata.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}