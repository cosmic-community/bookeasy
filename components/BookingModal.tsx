'use client'

import { useEffect, useCallback } from 'react'
import { EventType, Settings } from '@/types'
import BookingForm from './BookingForm'
import { formatDate, formatTime } from '@/lib/availability'

interface BookingModalProps {
  eventType: EventType
  date: string
  time: string
  settings: Settings | null
  onClose: () => void
  onSuccess: () => void
}

export default function BookingModal({ eventType, date, time, onClose, onSuccess, settings }: BookingModalProps) {
  // Handle escape key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Add event listener for escape key
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [handleKeyDown])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Handle successful booking
  const handleBookingSuccess = useCallback(() => {
    try {
      console.log('Booking completed successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error in booking success handler:', error)
      // Still close modal even if there's an error
      onClose()
    }
  }, [onSuccess, onClose])

  // Safe rendering helpers
  const renderFormattedDate = () => {
    try {
      return formatDate(date)
    } catch (error) {
      console.error('Error formatting date in modal:', error)
      return date
    }
  }

  const renderFormattedTime = () => {
    try {
      return formatTime(time)
    } catch (error) {
      console.error('Error formatting time in modal:', error)
      return time
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 id="booking-modal-title" className="text-xl font-semibold text-gray-900">
              Book Your Meeting
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {renderFormattedDate()} at {renderFormattedTime()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <BookingForm
            eventType={eventType}
            date={date}
            time={time}
            onSuccess={handleBookingSuccess}
            settings={settings}
          />
        </div>
      </div>
    </div>
  )
}