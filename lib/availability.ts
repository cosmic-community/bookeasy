import { EventType, Booking } from '@/types'

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
  date: Date,
  eventType: EventType,
  existingBookings: Booking[] = [],
  bufferMinutes: number = 15
): string[] {
  const dayName = getDayName(date)
  
  // Validate dayName is defined before proceeding
  if (!dayName) {
    return []
  }
  
  // Check if date is available
  if (!isDateAvailable(date, eventType, existingBookings)) {
    return []
  }
  
  const startTime = eventType.metadata?.start_time || '09:00'
  const endTime = eventType.metadata?.end_time || '17:00'
  const duration = eventType.metadata?.duration || 30
  
  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  const slots: string[] = []
  
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
    
    if (!hasConflict) {
      slots.push(timeSlot)
    }
  }
  
  return slots
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

// Format time for display
export function formatTime(time: string): string {
  const [hour, minute] = time.split(':')
  const hourNum = parseInt(hour)
  const ampm = hourNum >= 12 ? 'PM' : 'AM'
  const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
  
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
  const [hour1, minute1] = start1.split(':').map(Number)
  const [hour2, minute2] = start2.split(':').map(Number)
  
  const startMinutes1 = hour1 * 60 + minute1
  const endMinutes1 = startMinutes1 + duration1
  
  const startMinutes2 = hour2 * 60 + minute2
  const endMinutes2 = startMinutes2 + duration2
  
  return startMinutes1 < endMinutes2 && startMinutes2 < endMinutes1
}

// Get bookings for a specific date
export function getBookingsForDate(bookings: Booking[], date: string): Booking[] {
  return bookings.filter(booking => {
    const bookingDate = booking.metadata?.booking_date
    if (!bookingDate) return false
    
    const bookingDateObj = new Date(bookingDate)
    const bookingDateStr = bookingDateObj.toISOString().split('T')[0]
    
    return bookingDateStr === date
  })
}