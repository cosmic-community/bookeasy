'use client'

import { EventType, Settings } from '@/types'
import BookingForm from './BookingForm'

interface BookingFormModalProps {
  eventType: EventType
  date: string
  time: string
  settings: Settings | null
  onClose: () => void
  onSuccess: () => void
}

export default function BookingFormModal({ 
  eventType, 
  date, 
  time, 
  settings, 
  onClose, 
  onSuccess 
}: BookingFormModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            📅 Complete Your Booking
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
        <div className="px-6 py-6">
          <BookingForm
            eventType={eventType}
            date={date}
            time={time}
            settings={settings}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  )
}