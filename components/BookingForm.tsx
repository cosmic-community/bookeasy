'use client'

import { useState } from 'react'
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

  const availableDays = eventType.metadata?.available_days || []
  const startTime = eventType.metadata?.start_time || '09:00'
  const endTime = eventType.metadata?.end_time || '17:00'
  const duration = eventType.metadata?.duration || 30

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = []
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    
    while (start < end) {
      const timeString = start.toTimeString().slice(0, 5)
      slots.push(timeString)
      start.setMinutes(start.getMinutes() + duration)
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()

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
          <input
            type="date"
            id="booking_date"
            required
            className="input"
            value={formData.booking_date}
            onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
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
          >
            <option value="">Choose a time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
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
          disabled={isSubmitting}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
        </button>
      </form>
    </div>
  )
}