'use client'

import { useState, useEffect } from 'react'
import { EventType, Settings } from '@/types'
import BookingForm from './BookingForm'
import { getAvailableTimeSlots, formatDate } from '@/lib/availability'

interface BookingModalProps {
  eventType: EventType
  selectedDate: string | null
  onClose: () => void
  settings: Settings | null
}

export default function BookingModal({ eventType, selectedDate, onClose, settings }: BookingModalProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load available time slots when modal opens
  useEffect(() => {
    if (selectedDate) {
      setIsLoading(true)
      // Simulate fetching existing bookings for this date
      const mockExistingBookings: any[] = []
      
      const slots = getAvailableTimeSlots(selectedDate, eventType, mockExistingBookings, settings)
      const availableTimes = slots.filter(slot => slot.available).map(slot => slot.time)
      setAvailableSlots(availableTimes)
      setIsLoading(false)
    }
  }, [selectedDate, eventType, settings])

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleBookingSuccess = () => {
    onClose()
  }

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!selectedDate) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Book Your Meeting
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(selectedDate)}
            </p>
          </div>
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

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <svg className="animate-spin w-8 h-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Loading available times...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Available Times
              </h3>
              <p className="text-gray-600 mb-4">
                Unfortunately, there are no available time slots for this date.
              </p>
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Choose Different Date
              </button>
            </div>
          ) : !selectedTime ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select a Time
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}  // Fixed: Direct assignment instead of function parameter
                    className="p-3 text-center border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
                  >
                    {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <BookingForm
              eventType={eventType}
              date={selectedDate}  // Fixed: Changed from selectedDate to date to match BookingFormProps
              time={selectedTime}  // Fixed: Changed from selectedTime to time to match BookingFormProps
              onSuccess={handleBookingSuccess}
              settings={settings}
            />
          )}
        </div>
      </div>
    </div>
  )
}