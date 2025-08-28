import { NextResponse } from 'next/server'
import { createBooking } from '@/lib/cosmic'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    
    // Validate required fields
    const { 
      event_type_id, 
      attendee_name, 
      attendee_email, 
      booking_date, 
      booking_time 
    } = bookingData
    
    if (!event_type_id || !attendee_name || !attendee_email || !booking_date || !booking_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create the booking using server-side Cosmic SDK
    const booking = await createBooking({
      event_type_id,
      attendee_name,
      attendee_email,
      booking_date,
      booking_time,
      notes: bookingData.notes || ''
    })
    
    return NextResponse.json({ booking })
    
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}