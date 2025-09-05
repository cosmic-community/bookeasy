'use client'

import { useState } from 'react'
import { EventType, Settings } from '@/types'
import { formatTime, formatDate } from '@/lib/availability'

interface BookingFormProps {
  eventType: EventType
  date: string
  time: string
  onSuccess: () => void
  settings: Settings | null
}

export default function BookingForm({ eventType, date, time, onSuccess, settings }: BookingFormProps) {
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    notes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Client-side validation
    if (!formData.attendee_name.trim()) {
      setError('Name is required')
      setIsSubmitting(false)
      return
    }

    if (!formData.attendee_email.trim()) {
      setError('Email is required')
      setIsSubmitting(false)
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.attendee_email.trim())) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const payload = {
        event_type_id: eventType.id,
        attendee_name: formData.attendee_name.trim(),
        attendee_email: formData.attendee_email.trim().toLowerCase(),
        booking_date: date,
        booking_time: time,
        notes: formData.notes.trim()
      }

      console.log('Submitting booking payload:', payload)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()
      console.log('API response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }

      // Success - call the success callback
      onSuccess()
    } catch (error) {
      console.error('Error creating booking:', error)
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create booking. Please try again.'
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  return (
    <div>
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          {eventType.metadata?.event_name || eventType.title}
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(date)}
          </p>
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(time)} ({eventType.metadata?.duration || 30} minutes)
          </p>
          {settings?.metadata?.timezone && (
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {settings.metadata.timezone}
            </p>
          )}
        </div>
      </div>

      {/* Booking Form */}
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
            value={formData.attendee_name}
            onChange={(e) => handleInputChange('attendee_name', e.target.value)}
            placeholder="Enter your full name"
            disabled={isSubmitting}
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
            onChange={(e) => handleInputChange('attendee_email', e.target.value)}
            placeholder="your.email@example.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            className="textarea"
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional information or special requests..."
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !formData.attendee_name.trim() || !formData.attendee_email.trim()}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirming...
            </span>
          ) : (
            'Confirm Booking'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By confirming, you'll receive email notifications about your booking.
        </p>
      </form>
    </div>
  )
}