import { NextRequest, NextResponse } from 'next/server'
import { cosmic, getBookingsForDate } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (date) {
      // Get bookings for specific date
      const bookings = await getBookingsForDate(date)
      return NextResponse.json({ bookings })
    } else {
      // Get all bookings
      const response = await cosmic.objects
        .find({ type: 'bookings' })
        .props(['id', 'title', 'slug', 'metadata'])
        .depth(1)
        .limit(100)
      
      return NextResponse.json({ bookings: response.objects })
    }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type_id, attendee_name, attendee_email, booking_date, booking_time, notes } = body

    // Validate required fields
    if (!event_type_id || !attendee_name || !attendee_email || !booking_date || !booking_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for existing bookings at the same time (prevent double booking)
    const existingBookings = await getBookingsForDate(booking_date)
    const timeConflict = existingBookings.some(booking => 
      booking.metadata?.booking_time === booking_time &&
      booking.metadata?.status !== 'cancelled'
    )

    if (timeConflict) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      )
    }

    // Create the booking
    const newBooking = await cosmic.objects.insertOne({
      type: 'bookings',
      title: `${attendee_name} - Booking`,
      metadata: {
        event_type: event_type_id,
        attendee_name: attendee_name,
        attendee_email: attendee_email,
        booking_date: booking_date,
        booking_time: booking_time,
        status: 'confirmed',
        notes: notes || ''
      }
    })

    return NextResponse.json({ 
      message: 'Booking created successfully',
      booking: newBooking.object 
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}