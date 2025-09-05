'use client'

import { useState, useEffect } from 'react'
import { EventType } from '@/types'

interface BookingFormProps {
  eventType: EventType
  onSubmit: (formData: {
    event_type_id: string
    attendee_name: string
    attendee_email: string
    booking_date: string
    booking_time: string
    notes?: string
  }) => Promise<void>
  onCancel: () => void
}

export default function BookingForm({ eventType, onSubmit, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  // Generate available time slots based on event type
  useEffect(() => {
    if (!eventType?.metadata?.start_time || !eventType?.metadata?.end_time || !eventType?.metadata?.duration) {
      setAvailableTimes([])
      return
    }

    const startTime = eventType.metadata.start_time
    const endTime = eventType.metadata.end_time
    const duration = eventType.metadata.duration

    const times: string[] = []
    let current = new Date(`2000-01-01 ${startTime}`)
    const end = new Date(`2000-01-01 ${endTime}`)

    while (current < end) {
      const timeString = current.toTimeString().slice(0, 5)
      times.push(timeString)
      current.setMinutes(current.getMinutes() + duration)
    }

    setAvailableTimes(times)
  }, [eventType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!eventType?.id) {
      console.error('Event type ID is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit({
        event_type_id: eventType.id, // This was line 54 - now properly typed
        attendee_name: formData.attendee_name,
        attendee_email: formData.attendee_email,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        notes: formData.notes || undefined
      })
    } catch (error) {
      console.error('Error submitting booking:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.attendee_name && 
                     formData.attendee_email && 
                     formData.booking_date && 
                     formData.booking_time

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {eventType?.metadata?.event_name || eventType?.title || 'Book Meeting'}
        </h2>
        {eventType?.metadata?.description && (
          <p className="text-gray-600 text-sm">
            {eventType.metadata.description}
          </p>
        )}
        <div className="mt-2 text-sm text-gray-500">
          ⏱️ {eventType?.metadata?.duration || 30} minutes
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="attendee_name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            id="attendee_name"
            required
            className="input"
            placeholder="Enter your full name"
            value={formData.attendee_name}
            onChange={(e) => setFormData({ ...formData, attendee_name: e.target.value })}
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
            placeholder="Enter your email address"
            value={formData.attendee_email}
            onChange={(e) => setFormData({ ...formData, attendee_email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="booking_date"
            required
            min={today}
            className="input"
            value={formData.booking_date}
            onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="booking_time" className="block text-sm font-medium text-gray-700 mb-1">
            Time *
          </label>
          <select
            id="booking_time"
            required
            className="select"
            value={formData.booking_time}
            onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
          >
            <option value="">Select a time</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            className="textarea"
            placeholder="Any additional information or questions..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
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
              'Book Meeting'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}