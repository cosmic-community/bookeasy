'use client'

import { useState } from 'react'
import { EventType, Settings } from '@/types'
import CalendarGrid from './CalendarGrid'
import EventTypeInfo from './EventTypeInfo'
import BookingModal from './BookingModal'

interface CalendarProps {
  eventType: EventType  // Changed from eventTypes to eventType (singular)
  settings: Settings | null
}

export default function Calendar({ eventType, settings }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setIsBookingModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsBookingModalOpen(false)
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Event Type Info */}
      <div className="lg:col-span-1">
        <EventTypeInfo eventType={eventType} settings={settings} />
      </div>

      {/* Calendar */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Select a Date
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-medium text-gray-900 min-w-[140px] text-center">
                {currentMonth.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <CalendarGrid
            currentMonth={currentMonth}
            eventType={eventType}
            settings={settings}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          eventType={eventType}
          selectedDate={selectedDate}
          onClose={handleCloseModal}
          settings={settings}
        />
      )}
    </div>
  )
}