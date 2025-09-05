// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateBookingStatus } from '@/lib/cosmic'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT method for updating booking status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update booking status - pass the status object directly
    const updatedBooking = await updateBookingStatus(id, body.status)

    return NextResponse.json({
      success: true,
      booking: updatedBooking
    })

  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}

// PATCH method for updating booking status (alternative)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params })
}