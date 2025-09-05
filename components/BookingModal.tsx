'use client'

import { useState, useEffect } from 'react'
import { EventType, Booking, Settings } from '@/types'
import Calendar from './Calendar'
import { getAvailableTimeSlots, formatTime, formatDate, TimeSlot } from '@/lib/availability'

interface BookingModalProps {
  eventType: EventType | null
  settings: Settings | null
  isOpen: boolean
  onClose: () => void
  onBookingComplete: () => void
}

export default function BookingModal({ 
  eventType, 
  settings, 
  isOpen, 
  onClose, 
  onBookingComplete 
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Fetch existing bookings for the selected date
  useEffect(() => {
    if (selectedDate && eventType) {
      setIsLoadingSlots(true)
      
      // Fetch bookings for this date
      fetch(`/api/bookings?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setExistingBookings(data.bookings || [])
          
          // Calculate available time slots
          const slots = getAvailableTimeSlots(selectedDate, eventType, data.bookings || [], settings)
          setAvailableTimeSlots(slots)
        })
        .catch(error => {
          console.error('Error fetching bookings:', error)
          setAvailableTimeSlots([])
        })
        .finally(() => {
          setIsLoadingSlots(false)
        })
    } else {
      setAvailableTimeSlots([])
      setSelectedTime(null)
    }
  }, [selectedDate, eventType, settings])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null)
      setSelectedTime(null)
      setAvailableTimeSlots([])
      setFormData({ attendee_name: '', attendee_email: '', notes: '' })
      setError('')
    }
  }, [isOpen])

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!eventType || !selectedDate || !selectedTime) {
      setError('Please select a date and time')
      return
    }

    if (!formData.attendee_name.trim() || !formData.attendee_email.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type_id: eventType.id,
          attendee_name: formData.attendee_name,
          attendee_email: formData.attendee_email,
          booking_date: selectedDate,
          booking_time: selectedTime,
          notes: formData.notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      onBookingComplete()
      onClose()
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !eventType) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Book: {eventType.metadata?.event_name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {eventType.metadata?.duration} minutes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Calendar Section */}
          <div className="lg:w-1/2 p-6 border-r border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📅 Select a Date
            </h3>
            <Calendar
              eventType={eventType}
              settings={settings}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          {/* Time Slots and Form Section */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            {selectedDate ? (
              <div className="space-y-6">
                {/* Selected Date Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">📅</span>
                    <div>
                      <p className="font-medium text-blue-900">
                        {formatDate(selectedDate)}
                      </p>
                      <p className="text-sm text-blue-700">
                        {eventType.metadata?.event_name} • {eventType.metadata?.duration} minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    🕒 Select a Time
                  </h3>
                  
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading available times...</span>
                      </div>
                    </div>
                  ) : availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                            slot.available
                              ? selectedTime === slot.time
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                              : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                          }`}
                          title={slot.available ? `Available at ${formatTime(slot.time)}` : slot.reason}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">🚫</div>
                      <p className="text-gray-500">No available time slots for this date</p>
                    </div>
                  )}
                </div>

                {/* Booking Form */}
                {selectedTime && (
                  <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      👤 Your Details
                    </h3>
                    
                    <div>
                      <label htmlFor="attendee_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="attendee_name"
                        required
                        className="input"
                        value={formData.attendee_name}
                        onChange={(e) => setFormData({ ...formData, attendee_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="attendee_email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="attendee_email"
                        required
                        className="input"
                        value={formData.attendee_email}
                        onChange={(e) => setFormData({ ...formData, attendee_email: e.target.value })}
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="input resize-none"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any specific topics or questions you'd like to discuss? (optional)"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Booking...
                          </span>
                        ) : (
                          `Book ${formatTime(selectedTime)}`
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Date
                  </h3>
                  <p className="text-gray-500">
                    Choose an available date from the calendar to see time slots
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