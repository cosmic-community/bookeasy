'use client'

import { useState, useEffect } from 'react'
import { EventType, Booking, Settings } from '@/types'
import { getAvailableDays, getAvailableTimeSlots, TimeSlot } from '@/lib/availability'
import CalendarGrid from './CalendarGrid'
import BookingFormModal from './BookingFormModal'

interface CalendarProps {
  eventType: EventType
  settings: Settings | null
}

export default function Calendar({ eventType, settings }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch bookings for the selected date
  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate)
    }
  }, [selectedDate])

  const fetchBookingsForDate = async (date: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setExistingBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMonthChange = (increment: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + increment)
      return newDate
    })
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const handleDateSelect = (value: React.SetStateAction<string | null>) => {
    if (typeof value === 'function') {
      setSelectedDate(prevDate => {
        const newDate = value(prevDate)
        if (newDate) {
          setSelectedTime(null)
        }
        return newDate
      })
    } else {
      const date = value
      setSelectedDate(date)
      if (date) {
        setSelectedTime(null)
      }
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      setShowBookingModal(true)
    }
  }

  const handleBookingSuccess = () => {
    setShowBookingModal(false)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get available days for the current month
  const availableDays = getAvailableDays(year, month, eventType, settings)

  // Get time slots for selected date
  const timeSlots: TimeSlot[] = selectedDate ? 
    getAvailableTimeSlots(selectedDate, eventType, existingBookings, settings) : 
    []

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[800px]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => handleMonthChange(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={() => handleMonthChange(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="min-h-[400px] mb-6">
        <CalendarGrid
          year={year}
          month={month}
          availableDays={availableDays}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="mt-6 pt-6 border-t min-h-[250px]">
          <h3 className="text-lg font-medium mb-4">
            Available Times for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.map(slot => (
                <button
                  key={slot.time}
                  onClick={() => slot.available ? handleTimeSelect(slot.time) : undefined}
                  disabled={!slot.available}
                  className={`
                    p-3 text-sm font-medium rounded-lg border transition-all
                    ${slot.available
                      ? selectedTime === slot.time
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-gray-200 hover:border-primary hover:bg-primary hover:text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title={!slot.available && slot.reason ? slot.reason : undefined}
                >
                  {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </button>
              ))}
              
              {timeSlots.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No available time slots for this date.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Book Button */}
      {selectedDate && selectedTime && (
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleBooking}
            className="btn btn-primary w-full"
          >
            Book {eventType.metadata?.event_name || eventType.title}
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDate && selectedTime && (
        <BookingFormModal
          eventType={eventType}
          date={selectedDate}
          time={selectedTime}
          settings={settings}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}