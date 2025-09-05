// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateBookingStatus, cosmic } from '@/lib/cosmic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+, params are now Promises and must be awaited
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update the booking status using minimal metadata update
    const response = await cosmic.objects.updateOne(id, {
      metadata: {
        status: status // Use string value directly
      }
    })

    return NextResponse.json({
      success: true,
      booking: response.object
    })

  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+, params are now Promises and must be awaited
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const response = await cosmic.objects
      .findOne({ type: 'bookings', id })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return NextResponse.json({
      success: true,
      booking: response.object
    })

  } catch (error) {
    console.error('Error fetching booking:', error)
    
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+, params are now Promises and must be awaited
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    await cosmic.objects.deleteOne(id)

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}