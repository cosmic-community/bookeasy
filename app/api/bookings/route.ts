import { NextRequest, NextResponse } from 'next/server'
import { cosmic, getBookingsForDate, getSettings, getEventType } from '@/lib/cosmic'
import { sendAttendeeConfirmation, sendHostNotification } from '@/lib/email'
import { formatDate, formatTime } from '@/lib/availability'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (date) {
      // Get bookings for specific date
      const bookings = await getBookingsForDate(date)
      return NextResponse.json({ 
        success: true,
        bookings 
      })
    } else {
      // Get all bookings
      const response = await cosmic.objects
        .find({ type: 'bookings' })
        .props(['id', 'title', 'slug', 'metadata'])
        .depth(1)
        .limit(100)
      
      return NextResponse.json({ 
        success: true,
        bookings: response.objects 
      })
    }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch bookings',
        bookings: []
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received booking request:', body)

    const { event_type_id, attendee_name, attendee_email, booking_date, booking_time, notes } = body

    // Validate required fields
    if (!event_type_id || !attendee_name || !attendee_email || !booking_date || !booking_time) {
      console.error('Missing required fields:', {
        event_type_id: !!event_type_id,
        attendee_name: !!attendee_name,
        attendee_email: !!attendee_email,
        booking_date: !!booking_date,
        booking_time: !!booking_time
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(attendee_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(booking_date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(booking_time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Expected HH:MM' },
        { status: 400 }
      )
    }

    // Check for existing bookings at the same time (prevent double booking)
    try {
      const existingBookings = await getBookingsForDate(booking_date)
      const timeConflict = existingBookings.some(booking => {
        if (!booking.metadata?.booking_time) return false
        
        const bookingStatus = booking.metadata.status
        // Skip cancelled bookings
        if (typeof bookingStatus === 'string' && bookingStatus === 'cancelled') {
          return false
        } else if (typeof bookingStatus === 'object' && bookingStatus?.key === 'cancelled') {
          return false
        }
        
        return booking.metadata.booking_time === booking_time
      })

      if (timeConflict) {
        return NextResponse.json(
          { error: 'This time slot is no longer available' },
          { status: 409 }
        )
      }
    } catch (error) {
      console.error('Error checking for conflicts:', error)
      // Continue with booking creation even if conflict check fails
    }

    // Create the booking with proper status object structure
    const bookingPayload = {
      type: 'bookings',
      title: `${attendee_name} - Booking`,
      metadata: {
        event_type: event_type_id,
        attendee_name: attendee_name.trim(),
        attendee_email: attendee_email.trim().toLowerCase(),
        booking_date: booking_date,
        booking_time: booking_time,
        status: 'Confirmed', // Use string value that matches select-dropdown options
        notes: notes?.trim() || ''
      }
    }

    console.log('Creating booking with payload:', bookingPayload)

    const newBooking = await cosmic.objects.insertOne(bookingPayload)

    console.log('Booking created successfully:', newBooking.object.id)

    // Send email notifications if enabled
    try {
      // Get settings and event type for email data
      const [settings, eventType] = await Promise.all([
        getSettings(),
        getEventType(event_type_id) // This will work with both slug and ID
      ])

      if (settings?.metadata?.email_notifications) {
        // Prepare email data with meeting link
        const emailData = {
          attendeeName: attendee_name.trim(),
          attendeeEmail: attendee_email.trim().toLowerCase(),
          eventName: eventType?.metadata?.event_name || eventType?.title || 'Meeting',
          bookingDate: formatDate(booking_date),
          bookingTime: formatTime(booking_time),
          duration: eventType?.metadata?.duration || 30,
          notes: notes?.trim() || '',
          hostName: eventType?.metadata?.host?.metadata?.full_name || 'Host',
          meetingLink: eventType?.metadata?.meeting_link || undefined // Add meeting link from event type
        }

        // Send confirmation email to attendee
        const attendeeEmailResult = await sendAttendeeConfirmation(emailData)
        if (!attendeeEmailResult.success) {
          console.error('Failed to send attendee confirmation:', attendeeEmailResult.error)
        }

        // Send notification email to host/admin if notification email is configured
        const notificationEmail = settings.metadata?.notification_email
        if (notificationEmail && notificationEmail.trim()) {
          const hostEmailResult = await sendHostNotification(emailData, notificationEmail.trim())
          if (!hostEmailResult.success) {
            console.error('Failed to send host notification:', hostEmailResult.error)
          }
        }
      }
    } catch (emailError) {
      console.error('Error sending emails:', emailError)
      // Don't fail the booking creation if emails fail
    }

    return NextResponse.json({ 
      success: true,
      message: 'Booking created successfully',
      booking: newBooking.object 
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: `Validation error: ${error.message}` },
          { status: 400 }
        )
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Network error connecting to database' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}