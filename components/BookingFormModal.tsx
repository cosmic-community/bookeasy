'use client'

import { EventType, Settings } from '@/types'
import BookingForm from './BookingForm'

interface BookingFormModalProps {
  eventType: EventType
  bookingDate: string
  bookingTime: string
  settings: Settings | null
  onClose: () => void
  onSuccess: () => void
}

export default function BookingFormModal({
  eventType,
  bookingDate,
  bookingTime,
  settings,
  onClose,
  onSuccess
}: BookingFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Book Your Meeting
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

          <BookingForm
            eventType={eventType}
            date={bookingDate}
            time={bookingTime}
            settings={settings}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  )
}