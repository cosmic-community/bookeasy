import { EventType, Booking, Settings } from '@/types'

// Days of the week constants
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const

export type DayOfWeek = typeof DAYS_OF_WEEK[number]

// Available day interface
export interface AvailableDay {
  date: string
  dayName: string
  available: boolean
  reason?: string
}

// Time slot interface
export interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

// Get day name from date
export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

// Check if a date is available for booking
export function isDateAvailable(
  date: Date,
  eventType: EventType,
  existingBookings: Booking[] = []
): boolean {
  const dayName = getDayName(date)
  
  // Validate dayName is defined before using it
  if (!dayName) {
    return false
  }
  
  // Check if the day is in the available days for this event type
  const isAvailableDay = eventType.metadata?.available_days?.includes(dayName) ?? false
  
  if (!isAvailableDay) {
    return false
  }
  
  // Check if date is not in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  if (targetDate < today) {
    return false
  }
  
  return true
}

// Generate available time slots for a given date and event type
export function getAvailableTimeSlots(
  dateStr: string,
  eventType: EventType,
  existingBookings: Booking[] = [],
  settings?: Settings | null
): TimeSlot[] {
  const date = new Date(dateStr + 'T00:00:00')
  const dayName = getDayName(date)
  
  // Validate dayName is defined before proceeding
  if (!dayName) {
    return []
  }
  
  // Check if date is available
  if (!isDateAvailable(date, eventType, existingBookings)) {
    return []
  }
  
  const startTime = eventType.metadata?.start_time || settings?.metadata?.default_start_time || '09:00'
  const endTime = eventType.metadata?.end_time || settings?.metadata?.default_end_time || '17:00'
  const duration = eventType.metadata?.duration || 30
  const bufferMinutes = settings?.metadata?.buffer_time || 15
  
  // Parse start and end times with proper validation
  const startTimeParts = startTime.split(':')
  const endTimeParts = endTime.split(':')
  
  const startHour = startTimeParts[0] ? parseInt(startTimeParts[0]) : 9
  const startMinute = startTimeParts[1] ? parseInt(startTimeParts[1]) : 0
  const endHour = endTimeParts[0] ? parseInt(endTimeParts[0]) : 17
  const endMinute = endTimeParts[1] ? parseInt(endTimeParts[1]) : 0
  
  // Validate parsed values
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return []
  }
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  const slots: TimeSlot[] = []
  
  // Generate time slots
  for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += duration + bufferMinutes) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    // Check if this slot conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      const bookingDate = booking.metadata?.booking_date
      const bookingTime = booking.metadata?.booking_time
      
      if (!bookingDate || !bookingTime) return false
      
      const bookingDateObj = new Date(bookingDate)
      const targetDateStr = date.toISOString().split('T')[0]
      const bookingDateStr = bookingDateObj.toISOString().split('T')[0]
      
      return bookingDateStr === targetDateStr && bookingTime === timeSlot
    })
    
    slots.push({
      time: timeSlot,
      available: !hasConflict,
      reason: hasConflict ? 'Already booked' : undefined
    })
  }
  
  return slots
}

// Generate available days for calendar
export function getAvailableDays(
  year: number,
  month: number,
  eventType: EventType,
  settings?: Settings | null
): AvailableDay[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: AvailableDay[] = []
  
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const currentDate = new Date(year, month, date)
    const dayName = getDayName(currentDate)
    const dateStr = currentDate.toISOString().split('T')[0]
    
    const available = isDateAvailable(currentDate, eventType)
    
    days.push({
      date: dateStr,
      dayName,
      available,
      reason: available ? undefined : 'Not available'
    })
  }
  
  return days
}

// Generate calendar data for a given month
export function generateCalendarData(
  year: number,
  month: number,
  bookings: Booking[] = []
) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  const endDate = new Date(lastDay)
  
  // Adjust start date to beginning of week (Sunday)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  
  // Adjust end date to end of week (Saturday)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
  
  const days = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dayName = getDayName(currentDate)
    
    // Ensure dayName is defined before using it
    if (dayName) {
      days.push({
        date: currentDate.toISOString().split('T')[0],
        dayName,
        available: true,
        reason: dayName ? undefined : 'Invalid day name'
      })
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format time for display
export function formatTime(time: string): string {
  if (!time) return ''
  
  const timeParts = time.split(':')
  const hour = timeParts[0] ? parseInt(timeParts[0]) : 0
  const minute = timeParts[1] || '00'
  
  if (isNaN(hour)) return time
  
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  
  return `${displayHour}:${minute} ${ampm}`
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

// Check if two time slots overlap
export function timeSlotsOverlap(
  start1: string,
  duration1: number,
  start2: string,
  duration2: number
): boolean {
  const start1Parts = start1.split(':')
  const start2Parts = start2.split(':')
  
  const hour1 = start1Parts[0] ? parseInt(start1Parts[0]) : 0
  const minute1 = start1Parts[1] ? parseInt(start1Parts[1]) : 0
  const hour2 = start2Parts[0] ? parseInt(start2Parts[0]) : 0
  const minute2 = start2Parts[1] ? parseInt(start2Parts[1]) : 0
  
  // Validate parsed values
  if (isNaN(hour1) || isNaN(minute1) || isNaN(hour2) || isNaN(minute2)) {
    return false
  }
  
  const startMinutes1 = hour1 * 60 + minute1
  const endMinutes1 = startMinutes1 + duration1
  
  const startMinutes2 = hour2 * 60 + minute2
  const endMinutes2 = startMinutes2 + duration2
  
  return startMinutes1 < endMinutes2 && startMinutes2 < endMinutes1
}

// Get bookings for a specific date
export function getBookingsForDate(bookings: Booking[], dateStr: string): Booking[] {
  return bookings.filter(booking => {
    const bookingDate = booking.metadata?.booking_date
    if (!bookingDate) return false
    
    const bookingDateObj = new Date(bookingDate)
    const bookingDateStr = bookingDateObj.toISOString().split('T')[0]
    
    return bookingDateStr === dateStr
  })
}