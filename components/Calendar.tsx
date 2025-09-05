'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { EventType, Settings, Booking } from '@/types'
import { getAvailableDays } from '@/lib/availability'
import CalendarGrid from './CalendarGrid'

interface CalendarProps {
  eventType: EventType
  settings: Settings | null
  selectedDate: string | null
  onDateSelect: Dispatch<SetStateAction<string | null>>
}

export default function Calendar({ eventType, settings, selectedDate, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(eventType)

  useEffect(() => {
    if (eventType) {
      setSelectedEventType(eventType)
    }
  }, [eventType])

  useEffect(() => {
    if (eventType) {
      setSelectedEventType(eventType)
    }
  }, [eventType])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Only render if we have a valid eventType
  if (!selectedEventType) {
    return (
      <div className="text-center text-gray-500 p-8">
        <p>Please select an event type to view availability.</p>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        eventType={selectedEventType}
        settings={settings}
        year={year}
        month={month}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
      />
    </div>
  )
}