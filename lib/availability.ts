import { EventType, Booking, Settings } from '@/types'

export interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

export interface AvailableDay {
  date: string
  dayName: string
  available: boolean
  reason?: string
}

// Helper function to convert time string to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper function to convert minutes to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Check if a date is within the booking window
export function isDateWithinBookingWindow(date: Date, settings: Settings | null): boolean {
  if (!settings?.metadata?.booking_window_days) return true
  
  const today = new Date()
  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + settings.metadata.booking_window_days)
  
  return date <= maxDate
}

// Check if a date meets minimum notice requirements
export function isDateWithinMinimumNotice(date: Date, time: string, settings: Settings | null): boolean {
  if (!settings?.metadata?.minimum_notice_hours) return true
  
  const now = new Date()
  const bookingDateTime = new Date(date)
  const [hours, minutes] = time.split(':').map(Number)
  bookingDateTime.setHours(hours, minutes, 0, 0)
  
  const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  return hoursUntilBooking >= settings.metadata.minimum_notice_hours
}

// Check if a specific day is available for an event type
export function isDayAvailable(date: Date, eventType: EventType): boolean {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[date.getDay()]
  
  return eventType.metadata?.available_days?.includes(dayName) ?? false
}

// Get available days for a given month and event type
export function getAvailableDays(
  year: number, 
  month: number, 
  eventType: EventType, 
  settings: Settings | null
): AvailableDay[] {
  const days: AvailableDay[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[date.getDay()]
    
    let available = true
    let reason = ''
    
    // Check if date is in the past
    if (date < today) {
      available = false
      reason = 'Past date'
    }
    // Check if day is in event type's available days
    else if (!isDayAvailable(date, eventType)) {
      available = false
      reason = 'Not an available day'
    }
    // Check booking window
    else if (!isDateWithinBookingWindow(date, settings)) {
      available = false
      reason = 'Outside booking window'
    }
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayName,
      available,
      reason: available ? undefined : reason
    })
  }
  
  return days
}

// Get available time slots for a specific date and event type
export function getAvailableTimeSlots(
  date: string,
  eventType: EventType,
  existingBookings: Booking[],
  settings: Settings | null
): TimeSlot[] {
  const slots: TimeSlot[] = []
  
  if (!eventType.metadata?.start_time || !eventType.metadata?.end_time) {
    return slots
  }
  
  const startMinutes = timeToMinutes(eventType.metadata.start_time)
  const endMinutes = timeToMinutes(eventType.metadata.end_time)
  const duration = eventType.metadata?.duration ?? 30
  const bufferTime = settings?.metadata?.buffer_time ?? 0
  
  // Generate time slots in 30-minute intervals
  const slotInterval = 30
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotInterval) {
    const timeStr = minutesToTime(minutes)
    const slotEndMinutes = minutes + duration
    
    // Skip if slot would extend past end time
    if (slotEndMinutes > endMinutes) {
      continue
    }
    
    let available = true
    let reason = ''
    
    // Check minimum notice
    const slotDate = new Date(date + 'T' + timeStr)
    if (!isDateWithinMinimumNotice(slotDate, timeStr, settings)) {
      available = false
      reason = 'Too soon to book'
    }
    
    // Check for conflicts with existing bookings
    if (available) {
      for (const booking of existingBookings) {
        if (booking.metadata?.booking_date === date) {
          const bookingTime = booking.metadata?.booking_time
          if (bookingTime) {
            const bookingMinutes = timeToMinutes(bookingTime)
            const bookingDuration = booking.metadata?.event_type?.metadata?.duration ?? 30
            const bookingEndMinutes = bookingMinutes + bookingDuration
            
            // Add buffer time to existing booking
            const bufferedStartMinutes = bookingMinutes - bufferTime
            const bufferedEndMinutes = bookingEndMinutes + bufferTime
            
            // Check if new slot overlaps with buffered existing booking
            if ((minutes >= bufferedStartMinutes && minutes < bufferedEndMinutes) ||
                (slotEndMinutes > bufferedStartMinutes && slotEndMinutes <= bufferedEndMinutes) ||
                (minutes <= bufferedStartMinutes && slotEndMinutes >= bufferedEndMinutes)) {
              available = false
              reason = 'Time slot unavailable'
              break
            }
          }
        }
      }
    }
    
    slots.push({
      time: timeStr,
      available,
      reason: available ? undefined : reason
    })
  }
  
  return slots
}

// Format time for display (convert 24h to 12h format)
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Format date for display
export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}