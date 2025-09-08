'use client'

import { useState, useCallback } from 'react'
import { EventType, Settings } from '@/types'
import { formatTime, formatDate } from '@/lib/availability'
import BookingSuccessModal from './BookingSuccessModal'

interface BookingFormProps {
  eventType: EventType
  date: string
  time: string
  onSuccess: () => void
  settings: Settings | null
}

interface FormData {
  attendee_name: string
  attendee_email: string
  notes: string
}

interface FormErrors {
  attendee_name?: string
  attendee_email?: string
  general?: string
}

export default function BookingForm({ eventType, date, time, onSuccess, settings }: BookingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    attendee_name: '',
    attendee_email: '',
    notes: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<{
    attendeeName: string
    eventName: string
    date: string
    time: string
  } | undefined>()

  // Validate form data
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.attendee_name || !formData.attendee_name.trim()) {
      newErrors.attendee_name = 'Name is required'
    } else if (formData.attendee_name.trim().length < 2) {
      newErrors.attendee_name = 'Name must be at least 2 characters'
    }

    // Email validation
    if (!formData.attendee_email || !formData.attendee_email.trim()) {
      newErrors.attendee_email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.attendee_email.trim())) {
        newErrors.attendee_email = 'Please enter a valid email address'
      }
    }

    return newErrors
  }, [formData])

  // Handle form submission with comprehensive error handling
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      console.log('Form submission started')
      
      // Clear previous errors
      setErrors({})
      setIsSubmitting(true)

      // Validate form
      const formErrors = validateForm()
      if (Object.keys(formErrors).length > 0) {
        console.log('Form validation errors:', formErrors)
        setErrors(formErrors)
        setIsSubmitting(false)
        return
      }

      // Validate required props
      if (!eventType?.id) {
        throw new Error('Event type information is missing')
      }

      if (!date || !time) {
        throw new Error('Date and time information is missing')
      }

      // Prepare payload with sanitized data
      const payload = {
        event_type_id: eventType.id,
        attendee_name: formData.attendee_name.trim(),
        attendee_email: formData.attendee_email.trim().toLowerCase(),
        booking_date: date,
        booking_time: time,
        notes: formData.notes.trim()
      }

      console.log('Submitting booking with payload:', payload)

      // Make API request with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('API response status:', response.status)

      // Parse response
      let responseData
      try {
        responseData = await response.json()
        console.log('API response data:', responseData)
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError)
        throw new Error('Invalid response from server')
      }

      // Handle response
      if (!response.ok) {
        const errorMessage = responseData?.error || `Server error (${response.status})`
        console.error('API error:', errorMessage)
        throw new Error(errorMessage)
      }

      // Success
      console.log('Booking created successfully')
      
      // Prepare booking details for success modal
      setBookingDetails({
        attendeeName: formData.attendee_name.trim(),
        eventName: eventType?.metadata?.event_name || eventType?.title || 'Event',
        date: formatDate(date),
        time: formatTime(time)
      })

      // Reset form
      setFormData({
        attendee_name: '',
        attendee_email: '',
        notes: ''
      })

      // Show success modal first
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Booking submission error:', error)
      
      let errorMessage = 'An unexpected error occurred. Please try again.'

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection and try again.'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message) {
          errorMessage = error.message
        }
      }

      setErrors({ general: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, eventType, date, time, validateForm])

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    // Call the original success callback after closing modal
    onSuccess()
  }

  // Handle input changes with error clearing
  const handleInputChange = useCallback((field: keyof FormData) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))

      // Clear specific field error when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined
        }))
      }

      // Clear general error
      if (errors.general) {
        setErrors(prev => ({
          ...prev,
          general: undefined
        }))
      }
    }
  }, [errors])

  // Safe rendering helpers - FIXED: Ensure all return values are strings
  const renderEventName = (): string => {
    try {
      const eventName = eventType?.metadata?.event_name || eventType?.title || 'Event'
      return String(eventName)
    } catch (error) {
      console.error('Error rendering event name:', error)
      return 'Event'
    }
  }

  const renderFormattedDate = (): string => {
    try {
      const formatted = formatDate(date)
      return String(formatted)
    } catch (error) {
      console.error('Error formatting date:', error)
      return String(date)
    }
  }

  const renderFormattedTime = (): string => {
    try {
      const duration = eventType?.metadata?.duration || 30
      const formatted = `${formatTime(time)} (${duration} minutes)`
      return String(formatted)
    } catch (error) {
      console.error('Error formatting time:', error)
      return String(time)
    }
  }

  const renderTimezone = (): string | null => {
    try {
      const timezone = settings?.metadata?.timezone
      // FIXED: Handle timezone object properly with proper type checking
      if (typeof timezone === 'string') {
        return timezone
      } else if (timezone && typeof timezone === 'object' && timezone !== null && 'value' in timezone) {
        const timezoneObj = timezone as { key?: string; value?: string }
        return timezoneObj.value ? String(timezoneObj.value) : null
      }
      return null
    } catch (error) {
      console.error('Error getting timezone:', error)
      return null
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            {renderEventName()}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {renderFormattedDate()}
            </p>
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {renderFormattedTime()}
            </p>
            {renderTimezone() && (
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {renderTimezone()}
              </p>
            )}
          </div>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm font-medium">{String(errors.general)}</p>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="attendee_name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              id="attendee_name"
              name="attendee_name"
              required
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.attendee_name ? 'border-red-500 bg-red-50' : ''}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              value={formData.attendee_name}
              onChange={handleInputChange('attendee_name')}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              autoComplete="name"
            />
            {errors.attendee_name && (
              <p className="mt-1 text-sm text-red-600">{String(errors.attendee_name)}</p>
            )}
          </div>

          <div>
            <label htmlFor="attendee_email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="attendee_email"
              name="attendee_email"
              required
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.attendee_email ? 'border-red-500 bg-red-50' : ''}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              value={formData.attendee_email}
              onChange={handleInputChange('attendee_email')}
              placeholder="your.email@example.com"
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.attendee_email && (
              <p className="mt-1 text-sm text-red-600">{String(errors.attendee_email)}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              rows={3}
              value={formData.notes}
              onChange={handleInputChange('notes')}
              placeholder="Any additional information or special requests..."
              disabled={isSubmitting}
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.notes.length}/1000 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }
              transition-colors duration-200
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirming Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By confirming, you'll receive email notifications about your booking.
          </p>
        </form>
      </div>

      {/* Success Modal */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        bookingDetails={bookingDetails}
      />
    </>
  )
}