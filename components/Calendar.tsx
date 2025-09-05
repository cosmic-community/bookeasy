'use client'

import { useState, useEffect } from 'react'
import { EventType, Settings } from '@/types'
import CalendarGrid from './CalendarGrid'

interface CalendarProps {
  eventTypes: EventType[]
  settings: Settings | null
}

export default function Calendar({ eventTypes, settings }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    eventTypes.length > 0 ? eventTypes[0] : null
  )

  // Update selected event type when eventTypes change
  useEffect(() => {
    if (eventTypes.length > 0 && !selectedEventType) {
      setSelectedEventType(eventTypes[0])
    }
  }, [eventTypes, selectedEventType])

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          📅 Available Times
        </h3>
        
        {eventTypes.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              className="select text-sm"
              value={selectedEventType?.id || ''}
              onChange={(e) => {
                const eventType = eventTypes.find(et => et.id === e.target.value)
                setSelectedEventType(eventType || null)
              }}
            >
              {eventTypes.map((eventType) => (
                <option key={eventType.id} value={eventType.id}>
                  {eventType.metadata?.event_name || eventType.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h4 className="font-medium text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      {selectedEventType ? (
        <CalendarGrid
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          eventType={selectedEventType}
          settings={settings}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No event types available</p>
        </div>
      )}

      {/* Calendar Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary rounded mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}