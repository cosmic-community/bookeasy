'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { EventType, Settings } from '@/types'
import Calendar from './Calendar'
import BookingForm from './BookingForm'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  eventType: EventType
  settings: Settings | null
}

export default function BookingModal({ isOpen, onClose, eventType, settings }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null)
      setShowBookingForm(false)
    }
  }, [isOpen])

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date)
    if (date) {
      setShowBookingForm(true)
    }
  }

  const handleBookingSuccess = () => {
    onClose()
    setSelectedDate(null)
    setShowBookingForm(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">
            Book: {eventType.metadata?.event_name || eventType.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showBookingForm ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a date and time
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📅 Duration: {eventType.metadata?.duration || 30} minutes</p>
                  <p>🕐 Available: {eventType.metadata?.start_time || '9:00 AM'} - {eventType.metadata?.end_time || '5:00 PM'}</p>
                  {eventType.metadata?.available_days && (
                    <p>📆 Days: {eventType.metadata.available_days.join(', ')}</p>
                  )}
                </div>
              </div>

              <Calendar
                eventType={eventType}
                settings={settings}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setShowBookingForm(false)
                  setSelectedDate(null)
                }}
                className="text-primary hover:text-primary-dark mb-4 flex items-center"
              >
                ← Back to calendar
              </button>

              <BookingForm
                eventType={eventType}
                selectedDate={selectedDate}
                selectedTime={null}
                onSuccess={handleBookingSuccess}
                settings={settings}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}