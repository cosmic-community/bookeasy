'use client'

import { useState } from 'react'
import { EventType } from '@/types'
import { getAvailableTimeSlots, formatTime } from '@/lib/availability'

interface BookingFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  eventType: EventType | null
  selectedDate: string
  existingBookings?: any[]
}

export default function BookingFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  eventType, 
  selectedDate,
  existingBookings = []
}: BookingFormModalProps) {
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    booking_time: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !eventType) return null

  const availableSlots = getAvailableTimeSlots(selectedDate, eventType, existingBookings)
  const availableTimeSlots = availableSlots.filter(slot => slot.available)

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
          booking_date: selectedDate,
          booking_time: formData.booking_time,
          notes: formData.notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      // Reset form
      setFormData({
        attendee_name: '',
        attendee_email: '',
        booking_time: '',
        notes: ''
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Book {eventType.metadata?.event_name || eventType.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label htmlFor="booking_time" className="block text-sm font-medium text-gray-700 mb-2">
                Available Times *
              </label>
              <select
                id="booking_time"
                required
                className="select"
                value={formData.booking_time}
                onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
              >
                <option value="">Select a time</option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot.time} value={slot.time}>
                    {formatTime(slot.time)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="input resize-none"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.attendee_name || !formData.attendee_email || !formData.booking_time}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}