'use client'

import { useState } from 'react'
import { EventType, Settings } from '@/types'
import { getAvailableDays, AvailableDay } from '@/lib/availability'

interface CalendarProps {
  eventType: EventType
  settings: Settings | null
  selectedDate: string | null
  onDateSelect: (date: string | null) => void
}

export default function Calendar({ eventType, settings, selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const availableDays = getAvailableDays(year, month, eventType, settings)
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Generate calendar grid
  const calendarDays: (AvailableDay | null)[] = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const availableDay = availableDays.find(d => {
      const dayNum = new Date(d.date).getDate()
      return dayNum === day
    })
    calendarDays.push(availableDay || null)
  }
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }
  
  const handleDateClick = (availableDay: AvailableDay) => {
    if (!availableDay.available) return
    
    if (selectedDate === availableDay.date) {
      onDateSelect(null) // Deselect if clicking the same date
    } else {
      onDateSelect(availableDay.date)
    }
  }
  
  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    return date === today
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div key={index} className="aspect-square">
              {day ? (
                <button
                  onClick={() => handleDateClick(day)}
                  disabled={!day.available}
                  className={`w-full h-full flex items-center justify-center text-sm rounded-lg border transition-all duration-200 ${
                    day.available
                      ? selectedDate === day.date
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : isToday(day.date)
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                  }`}
                  title={day.available ? `Available on ${day.dayName}` : day.reason}
                >
                  {new Date(day.date).getDate()}
                </button>
              ) : (
                <div className="w-full h-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="px-4 pb-4 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}