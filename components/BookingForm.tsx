'use client'

import { useState, useEffect } from 'react'
import { EventType, Settings } from '@/types'

interface BookingFormProps {
  eventType: EventType
  settings?: Settings | null
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
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])

  // Get availability settings - prioritize event-specific, fall back to global settings
  const availableDays = eventType.metadata?.available_days || settings?.metadata?.default_available_days || []
  const startTime = eventType.metadata?.start_time || settings?.metadata?.default_start_time || '09:00'
  const endTime = eventType.metadata?.end_time || settings?.metadata?.default_end_time || '17:00'
  const duration = eventType.metadata?.duration || 30
  const bufferTime = settings?.metadata?.buffer_time || 15
  const minimumNoticeHours = settings?.metadata?.minimum_notice_hours || 24
  const bookingWindowDays = settings?.metadata?.booking_window_days || 30

  // Check if a date is available
  const isDateAvailable = (dateString: string): boolean => {
    const date = new Date(dateString)
    const now = new Date()
    
    // Check minimum notice requirement
    const hoursUntilDate = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursUntilDate < minimumNoticeHours) {
      return false
    }
    
    // Check booking window
    const daysUntilDate = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (daysUntilDate > bookingWindowDays) {
      return false
    }
    
    // Check if day of week is available
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[date.getDay()]
    
    return availableDays.includes(dayName)
  }

  // Generate time slots based on availability
  const generateTimeSlots = (selectedDate: string): string[] => {
    if (!selectedDate || !isDateAvailable(selectedDate)) {
      return []
    }

    const slots: string[] = []
    // Fix: Ensure startTime and endTime are defined strings before using in Date constructor
    const safeStartTime = startTime || '09:00'
    const safeEndTime = endTime || '17:00'
    
    const start = new Date(`2000-01-01T${safeStartTime}:00`)
    const end = new Date(`2000-01-01T${safeEndTime}:00`)
    
    while (start < end) {
      const timeString = start.toTimeString().slice(0, 5)
      slots.push(timeString)
      start.setMinutes(start.getMinutes() + duration + bufferTime)
    }
    
    return slots
  }

  // Update available time slots when date changes
  useEffect(() => {
    // Fix: Add explicit null/undefined check and ensure string type before calling generateTimeSlots
    const selectedDate = formData.booking_date
    if (selectedDate && typeof selectedDate === 'string' && selectedDate.trim() !== '') {
      const slots = generateTimeSlots(selectedDate)
      setAvailableTimeSlots(slots)
      
      // Clear selected time if it's no longer available
      if (formData.booking_time && !slots.includes(formData.booking_time)) {
        setFormData(prev => ({ ...prev, booking_time: '' }))
      }
    } else {
      setAvailableTimeSlots([])
    }
  }, [formData.booking_date, startTime, endTime, duration, bufferTime])

  // Generate date options for the next available dates
  const getAvailableDates = (): Array<{date: string, label: string, available: boolean}> => {
    const dates: Array<{date: string, label: string, available: boolean}> = []
    const today = new Date()
    
    for (let i = 0; i <= bookingWindowDays; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dateString = date.toISOString().split('T')[0]
      // Fix: Add explicit check to ensure dateString is defined before using it
      if (dateString) {
        const available = isDateAvailable(dateString)
        
        dates.push({
          date: dateString,
          label: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }),
          available
        })
      }
    }
    
    return dates
  }

  const availableDatesOptions = getAvailableDates()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Final validation - Fix: Ensure formData.booking_date is a string before validation
    const selectedDate = formData.booking_date
    if (!selectedDate || typeof selectedDate !== 'string' || !isDateAvailable(selectedDate)) {
      setError('Selected date is not available. Please choose an available date.')
      setIsSubmitting(false)
      return
    }

    if (!availableTimeSlots.includes(formData.booking_time)) {
      setError('Selected time is not available. Please choose an available time slot.')
      setIsSubmitting(false)
      return
    }

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
          booking_date: formData.booking_date,
          booking_time: formData.booking_time,
          notes: formData.notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      setIsSuccess(true)
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600">
            Your meeting has been scheduled. You'll receive a confirmation email shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Availability Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📅 Availability</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Available days:</strong> {availableDays.join(', ')}</p>
          <p><strong>Available times:</strong> {startTime} - {endTime}</p>
          <p><strong>Duration:</strong> {duration} minutes</p>
          {bufferTime > 0 && (
            <p><strong>Buffer time:</strong> {bufferTime} minutes between meetings</p>
          )}
          <p><strong>Minimum notice:</strong> {minimumNoticeHours} hours</p>
          <p><strong>Booking window:</strong> {bookingWindowDays} days</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Book your meeting
        </h2>

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
            />
          </div>

          <div>
            <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date *
            </label>
            <select
              id="booking_date"
              required
              className="select"
              value={formData.booking_date}
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
            >
              <option value="">Choose a date</option>
              {availableDatesOptions.map((dateOption) => (
                <option 
                  key={dateOption.date} 
                  value={dateOption.date}
                  disabled={!dateOption.available}
                  className={dateOption.available ? 'text-gray-900' : 'text-gray-400'}
                >
                  {dateOption.label} {dateOption.available ? '✅' : '❌ Unavailable'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              ✅ Available dates | ❌ Unavailable dates
            </p>
          </div>

          <div>
            <label htmlFor="booking_time" className="block text-sm font-medium text-gray-700 mb-2">
              Select Time *
            </label>
            <select
              id="booking_time"
              required
              className="select"
              value={formData.booking_time}
              onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
              disabled={!formData.booking_date || availableTimeSlots.length === 0}
            >
              <option value="">
                {!formData.booking_date 
                  ? 'Select a date first' 
                  : availableTimeSlots.length === 0 
                    ? 'No times available for selected date'
                    : 'Choose a time'
                }
              </option>
              {availableTimeSlots.map((time) => (
                <option key={time} value={time} className="text-gray-900">
                  {time} ✅
                </option>
              ))}
            </select>
            {formData.booking_date && availableTimeSlots.length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                No time slots available for the selected date. Please choose a different date.
              </p>
            )}
            {availableTimeSlots.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                {availableTimeSlots.length} time slot{availableTimeSlots.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              className="textarea"
              placeholder="Anything else you'd like us to know?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.booking_date || !formData.booking_time || availableTimeSlots.length === 0}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </form>
      </div>
    </div>
  )
}