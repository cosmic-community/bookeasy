'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { EventType, Settings, Booking } from '@/types'
import { getAvailableDays, getAvailableTimeSlots, formatTime, AvailableDay } from '@/lib/availability'

interface CalendarGridProps {
  year: number
  month: number
  availableDays: AvailableDay[]
  selectedDate: string | null
  onDateSelect: Dispatch<SetStateAction<string | null>>
}

export default function CalendarGrid({ 
  year, 
  month, 
  availableDays,
  selectedDate, 
  onDateSelect 
}: CalendarGridProps) {
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const startingDayOfWeek = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const handleDateClick = (date: string, available: boolean) => {
    if (!available) return
    
    if (selectedDate === date) {
      onDateSelect(null) // Deselect if clicking the same date
    } else {
      onDateSelect(date)
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
      </div>
    )
  }

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>
    </div>
  )
}