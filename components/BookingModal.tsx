'use client'

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
  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleBookingSuccess = () => {
    console.log('Booking successful, closing modal')
    onSuccess()
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="booking-modal-title" className="text-xl font-semibold text-gray-900">
              Book Your Meeting
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(date)} at {formatTime(time)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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