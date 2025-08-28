'use client'

import { useState } from 'react'
import { EventType, Booking } from '@/types'

interface BookingModalProps {
  selectedDate: Date
  eventTypes: EventType[]
  onClose: () => void
  onBookingCreated: (booking: Booking) => void
}

export default function BookingModal({ 
  selectedDate, 
  eventTypes, 
  onClose, 
  onBookingCreated 
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    event_type_id: '',
    attendee_name: '',
    attendee_email: '',
    booking_time: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedEventType = eventTypes.find(et => et.id === formData.event_type_id)
  
  // Generate time slots based on selected event type
  const generateTimeSlots = () => {
    if (!selectedEventType) return []
    
    const startTime = selectedEventType.metadata?.start_time || '09:00'
    const endTime = selectedEventType.metadata?.end_time || '17:00'
    const duration = selectedEventType.metadata?.duration || 30
    
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

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDateString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

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
          event_type_id: formData.event_type_id,
          attendee_name: formData.attendee_name,
          attendee_email: formData.attendee_email,
          booking_date: getDateString(selectedDate),
          booking_time: formData.booking_time,
          notes: formData.notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      const { booking } = await response.json()
      onBookingCreated(booking)
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Schedule Meeting
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Selected Date:</strong> {formatDate(selectedDate)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="event_type_id" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type *
              </label>
              <select
                id="event_type_id"
                required
                className="select"
                value={formData.event_type_id}
                onChange={(e) => setFormData({ ...formData, event_type_id: e.target.value, booking_time: '' })}
              >
                <option value="">Choose a meeting type</option>
                {eventTypes.map((eventType) => (
                  <option key={eventType.id} value={eventType.id}>
                    {eventType.metadata?.event_name || eventType.title} ({eventType.metadata?.duration || 30}min)
                  </option>
                ))}
              </select>
            </div>

            {formData.event_type_id && (
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
                  <option value="">Choose a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            )}

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

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}