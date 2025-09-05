'use client'

import { useState, useEffect } from 'react'
import { EventType, Booking, Settings } from '@/types'
import { getAvailableDays, getAvailableTimeSlots, formatTime } from '@/lib/availability'
import CalendarGrid from './CalendarGrid'
import EventTypeInfo from './EventTypeInfo'
import BookingForm from './BookingForm'

interface CalendarProps {
  eventType: EventType
  settings: Settings | null
}

export default function Calendar({ eventType, settings }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ time: string; available: boolean; reason?: string }[]>([])
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset selection when event type changes
  useEffect(() => {
    setSelectedDate(null)
    setSelectedTime(null)
    setShowBookingForm(false)
  }, [eventType.id])

  // Load available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate)
    } else {
      setAvailableTimeSlots([])
    }
  }, [selectedDate, eventType.id])

  const loadTimeSlots = async (date: string) => {
    setIsLoading(true)
    try {
      // Fetch existing bookings for the selected date
      const response = await fetch(`/api/bookings?date=${date}`)
      const bookings = response.ok ? await response.json() : []
      
      setExistingBookings(bookings)
      
      // Calculate available time slots
      const slots = getAvailableTimeSlots(date, eventType, bookings, settings)
      setAvailableTimeSlots(slots)
    } catch (error) {
      console.error('Error loading time slots:', error)
      setAvailableTimeSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setShowBookingForm(false)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setShowBookingForm(true)
  }

  const handleBookingSuccess = () => {
    setShowBookingForm(false)
    setSelectedDate(null)
    setSelectedTime(null)
    // Refresh time slots
    if (selectedDate) {
      loadTimeSlots(selectedDate)
    }
  }

  const handleBackToTimeSelection = () => {
    setShowBookingForm(false)
    setSelectedTime(null)
  }

  // Get available days for the current month
  const availableDays = getAvailableDays(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    eventType,
    settings
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Calendar and Time Selection */}
      <div className="lg:col-span-2 space-y-6">
        {!showBookingForm ? (
          <>
            {/* Calendar */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select a Date
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(currentDate.getMonth() - 1)
                      setCurrentDate(newDate)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-lg font-medium min-w-[140px] text-center">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(currentDate.getMonth() + 1)
                      setCurrentDate(newDate)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <CalendarGrid
                currentDate={currentDate}
                availableDays={availableDays}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select a Time
                </h3>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`
                          p-3 rounded-lg text-sm font-medium transition-colors
                          ${slot.available
                            ? 'bg-white border-2 border-gray-200 hover:border-primary hover:bg-primary-50 text-gray-900'
                            : 'bg-gray-50 border-2 border-gray-100 text-gray-400 cursor-not-allowed'
                          }
                        `}
                        title={slot.reason || undefined}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                )}

                {!isLoading && availableTimeSlots.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No available time slots for this date</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Booking Form */
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Your Booking
              </h3>
              <button
                onClick={handleBackToTimeSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {selectedDate && selectedTime && (
              <BookingForm
                eventType={eventType}
                date={selectedDate}
                time={selectedTime}
                onSuccess={handleBookingSuccess}
                settings={settings}
              />
            )}
          </div>
        )}
      </div>

      {/* Right Column - Event Type Info */}
      <div className="space-y-6">
        <EventTypeInfo eventType={eventType} settings={settings} />
      </div>
    </div>
  )
}