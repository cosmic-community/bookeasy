'use client'

import { useState, useCallback, useEffect } from 'react'
import { EventType, Booking, Settings } from '@/types'
import { getAvailableTimeSlots, formatDate, formatTime } from '@/lib/availability'
import BookingFormModal from '@/components/BookingFormModal'

interface CalendarProps {
  eventType: EventType
  settings: Settings | null
}

export default function Calendar({ eventType, settings }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<Array<{time: string, available: boolean}>>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch bookings for the selected date
  const fetchBookingsForDate = useCallback(async (date: string) => {
    if (!date) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings?date=${date}`)
      const data = await response.json()
      
      if (data.success && data.bookings) {
        setExistingBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update available slots when date or bookings change
  useEffect(() => {
    if (selectedDate && eventType) {
      const slots = getAvailableTimeSlots(selectedDate, eventType, existingBookings, settings)
      setAvailableSlots(slots)
    }
  }, [selectedDate, eventType, existingBookings, settings])

  // Load bookings when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate)
    }
  }, [selectedDate, fetchBookingsForDate])

  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
  }, [])

  const handleTimeClick = useCallback((time: string) => {
    setSelectedTime(time)
    setShowBookingForm(true)
  }, [])

  const handleCloseBookingForm = useCallback(() => {
    setShowBookingForm(false)
    setSelectedTime('')
  }, [])

  const handleBookingSuccess = useCallback(() => {
    setShowBookingForm(false)
    setSelectedTime('')
    // Refresh bookings for the selected date
    if (selectedDate) {
      fetchBookingsForDate(selectedDate)
    }
  }, [selectedDate, fetchBookingsForDate])

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate('')
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate('')
  }

  const isDateAvailable = (date: Date): boolean => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const availableDays = eventType.metadata?.available_days || []
    
    // Check if day is available
    if (!availableDays.includes(dayName)) return false
    
    // Check if date is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    return targetDate >= today
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the first day of the week (Sunday = 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Get the last day of the week
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const isCurrentMonth = currentDate.getMonth() === month
      const isAvailable = isCurrentMonth && isDateAvailable(currentDate)
      const isSelected = dateStr === selectedDate
      const isToday = dateStr === new Date().toISOString().split('T')[0]
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        isAvailable,
        isSelected,
        isToday
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => day.isAvailable && day.date ? handleDateClick(day.date) : undefined}
              disabled={!day.isAvailable}
              className={`
                p-2 text-sm aspect-square flex items-center justify-center rounded-lg transition-colors
                ${!day.isCurrentMonth
                  ? 'text-gray-300'
                  : day.isAvailable
                  ? day.isSelected
                    ? 'bg-primary text-white'
                    : day.isToday
                    ? 'bg-primary/10 text-primary font-medium hover:bg-primary/20'
                    : 'hover:bg-gray-100 text-gray-900'
                  : 'text-gray-300 cursor-not-allowed'
                }
              `}
            >
              {day.day}
            </button>
          ))}
        </div>

        {/* Available Time Slots */}
        {selectedDate && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Available times for {formatDate(selectedDate)}
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available ? handleTimeClick(slot.time) : undefined}
                    disabled={!slot.available}
                    className={`
                      p-3 text-sm rounded-lg border transition-colors
                      ${slot.available
                        ? 'border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-900'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No available time slots for this date
              </p>
            )}
          </div>
        )}
      </div>

      {/* Booking Form Modal - Add null check for selectedDate and selectedTime */}
      {showBookingForm && selectedDate && selectedTime && (
        <BookingFormModal
          eventType={eventType}
          bookingDate={selectedDate}
          bookingTime={selectedTime}
          settings={settings}
          onClose={handleCloseBookingForm}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}