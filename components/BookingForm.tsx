'use client'

import { useState, useEffect } from 'react'
import { EventType, Settings } from '@/types'

interface BookingFormProps {
  eventType: EventType
  settings: Settings | null
}

export default function BookingForm({ eventType, settings }: BookingFormProps) {
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  // Generate time slots based on event type or settings
  const generateTimeSlots = () => {
    const slots = []
    const startTime = eventType.metadata?.start_time || settings?.metadata?.default_start_time || '09:00'
    const endTime = eventType.metadata?.end_time || settings?.metadata?.default_end_time || '17:00'
    const duration = eventType.metadata?.duration || 30
    const bufferTime = settings?.metadata?.buffer_time || 0
    
    // Parse start time with proper validation
    const startTimeParts = startTime.split(':')
    const startHour = startTimeParts[0] ? Number(startTimeParts[0]) : 9
    const startMinute = startTimeParts[1] ? Number(startTimeParts[1]) : 0
    
    // Parse end time with proper validation
    const endTimeParts = endTime.split(':')
    const endHour = endTimeParts[0] ? Number(endTimeParts[0]) : 17
    const endMinute = endTimeParts[1] ? Number(endTimeParts[1]) : 0
    
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    const totalSlotTime = duration + bufferTime
    
    for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += totalSlotTime) {
      const hour = Math.floor(minutes / 60)
      const minute = minutes % 60
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
    
    return slots
  }

  // Load available slots when date changes
  useEffect(() => {
    if (formData.booking_date) {
      // Check if selected date is an available day for this event type
      const selectedDate = new Date(formData.booking_date)
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
      const availableDays = eventType.metadata?.available_days || settings?.metadata?.default_available_days || []
      
      if (availableDays.includes(dayName)) {
        const slots = generateTimeSlots()
        // TODO: Filter out already booked slots by fetching existing bookings for this date
        setAvailableSlots(slots)
      } else {
        setAvailableSlots([])
      }
    } else {
      setAvailableSlots([])
    }
  }, [formData.booking_date, eventType, settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          event_type_id: eventType.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      setIsSuccess(true)
      setFormData({
        attendee_name: '',
        attendee_email: '',
        booking_date: '',
        booking_time: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate minimum and maximum booking dates based on settings
  const getDateLimits = () => {
    const today = new Date()
    const minimumNoticeHours = settings?.metadata?.minimum_notice_hours || 24
    const bookingWindowDays = settings?.metadata?.booking_window_days || 30
    
    // Minimum date (today + minimum notice)
    const minDate = new Date(today.getTime() + (minimumNoticeHours * 60 * 60 * 1000))
    
    // Maximum date (today + booking window)
    const maxDate = new Date(today.getTime() + (bookingWindowDays * 24 * 60 * 60 * 1000))
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    }
  }

  const { min: minDate, max: maxDate } = getDateLimits()

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-xl font-semibold text-green-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-green-800 mb-4">
            Your meeting has been scheduled successfully. You'll receive a confirmation email shortly.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="btn btn-primary"
          >
            Book Another Meeting
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="attendee_name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
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
          <label htmlFor="attendee_email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="attendee_email"
            required
            className="input"
            value={formData.attendee_email}
            onChange={(e) => setFormData({ ...formData, attendee_email: e.target.value })}
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date *
          </label>
          <input
            type="date"
            id="booking_date"
            required
            className="input"
            value={formData.booking_date}
            onChange={(e) => setFormData({ ...formData, booking_date: e.target.value, booking_time: '' })}
            min={minDate}
            max={maxDate}
          />
          <p className="text-xs text-gray-500 mt-1">
            Available days: {(eventType.metadata?.available_days || settings?.metadata?.default_available_days || []).join(', ')}
          </p>
        </div>

        {formData.booking_date && (
          <div>
            <label htmlFor="booking_time" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time *
            </label>
            {availableSlots.length > 0 ? (
              <select
                id="booking_time"
                required
                className="select"
                value={formData.booking_time}
                onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
              >
                <option value="">Select a time</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                No available time slots for this date. Please select a different date.
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            className="textarea"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information or special requests..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !formData.booking_time}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scheduling...
            </span>
          ) : (
            `Schedule ${eventType.metadata?.event_name || 'Meeting'}`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By booking this meeting, you agree to receive email confirmations and reminders.
          {settings?.metadata?.timezone && (
            <><br />All times are in {settings.metadata.timezone}.</>
          )}
        </p>
      </form>
    </div>
  )
}