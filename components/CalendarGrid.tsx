'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { EventType, Settings, Booking } from '@/types'
import { getAvailableDays, getAvailableTimeSlots, formatTime } from '@/lib/availability'

interface CalendarGridProps {
  eventType: EventType
  settings: Settings | null
  year: number
  month: number
  selectedDate: string | null
  onDateSelect: Dispatch<SetStateAction<string | null>>
}

export default function CalendarGrid({ 
  eventType, 
  settings, 
  year, 
  month, 
  selectedDate, 
  onDateSelect 
}: CalendarGridProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Get available days for the current month
  const availableDays = getAvailableDays(year, month, eventType, settings)

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const startingDayOfWeek = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Fetch bookings when month changes
  useEffect(() => {
    fetchBookings()
  }, [year, month])

  // Fetch available time slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    } else {
      setAvailableSlots([])
    }
  }, [selectedDate, eventType, bookings])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const fetchAvailableSlots = async (date: string) => {
    if (!date) return
    
    setLoadingSlots(true)
    try {
      // Filter bookings for the selected date
      const dateBookings = bookings.filter(booking => 
        booking.metadata?.booking_date === date
      )
      
      // Get available time slots
      const slots = getAvailableTimeSlots(date, eventType, dateBookings, settings)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error getting available slots:', error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateClick = (date: string, available: boolean) => {
    if (!available) return
    
    if (selectedDate === date) {
      onDateSelect(null) // Deselect if clicking the same date
    } else {
      onDateSelect(date)
    }
  }

  const handleTimeSlotClick = (time: string) => {
    if (selectedDate) {
      // Navigate to booking form with selected date and time
      // This could be handled by parent component
      console.log('Selected:', selectedDate, time)
    }
  }

  // Create calendar grid
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="p-2 h-12"></div>
    )
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayInfo = availableDays.find(d => d.date === date)
    const isAvailable = dayInfo?.available ?? false
    const isSelected = selectedDate === date
    const hasBookings = bookings.some(booking => booking.metadata?.booking_date === date)

    calendarDays.push(
      <div
        key={day}
        className={`
          p-2 h-12 border border-gray-200 cursor-pointer transition-colors relative
          ${isAvailable ? 'hover:bg-blue-50' : 'bg-gray-50 cursor-not-allowed'}
          ${isSelected ? 'bg-primary text-white' : ''}
          ${!isAvailable ? 'text-gray-400' : 'text-gray-900'}
        `}
        onClick={() => handleDateClick(date, isAvailable)}
        title={dayInfo?.reason || ''}
      >
        <div className="text-sm font-medium">{day}</div>
        {hasBookings && (
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays}
      </div>

      {/* Selected Date Time Slots */}
      {selectedDate && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Available times for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && handleTimeSlotClick(slot.time)}
                  disabled={!slot.available}
                  className={`
                    p-3 text-sm font-medium rounded-lg border transition-colors
                    ${slot.available
                      ? 'border-primary text-primary hover:bg-primary hover:text-white'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title={slot.reason || ''}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No available time slots for this date.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}