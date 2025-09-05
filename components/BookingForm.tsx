'use client'

import { useState } from 'react'
import { EventType } from '@/types'

interface BookingFormProps {
  eventType: EventType
}

export default function BookingForm({ eventType }: BookingFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Ensure all required fields are provided and not undefined
    const bookingData = {
      event_type_id: eventType.id,
      attendee_name: formData.attendee_name?.trim() || '',
      attendee_email: formData.attendee_email?.trim() || '',
      booking_date: formData.booking_date || '',
      booking_time: formData.booking_time || '',
      notes: formData.notes?.trim() || ''
    }

    // Basic validation
    if (!bookingData.attendee_name || !bookingData.attendee_email || 
        !bookingData.booking_date || !bookingData.booking_time) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      setIsSuccess(true)
      // Reset form
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

  // Generate available time slots based on event type
  const generateTimeSlots = () => {
    const slots: string[] = []
    const startTime = eventType.metadata?.start_time || '09:00'
    const endTime = eventType.metadata?.end_time || '17:00'
    const duration = eventType.metadata?.duration || 30

    const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
    const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])

    for (let time = start; time < end; time += duration) {
      const hours = Math.floor(time / 60)
      const minutes = time % 60
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      slots.push(timeString)
    }

    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label htmlFor="attendee_name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
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
            Date *
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
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            className="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information or questions?"
          />
        </div>

        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Booking created successfully!</p>
            </div>
          </div>
        )}

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
          disabled={isSubmitting}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Booking...
            </span>
          ) : (
            'Book This Meeting'
          )}
        </button>
      </form>
    </div>
  )
}