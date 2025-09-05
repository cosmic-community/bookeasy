// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    console.log('Updating booking:', id, 'with data:', body)

    const { status } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update booking with just the status field (minimal update)
    const response = await cosmic.objects.updateOne(id, {
      metadata: {
        status: status // Use the status value directly as string
      }
    })

    console.log('Booking updated successfully:', response.object.id)

    return NextResponse.json({ 
      message: 'Booking updated successfully',
      booking: response.object 
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: `Validation error: ${error.message}` },
          { status: 400 }
        )
      } else if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Network error connecting to database' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update booking. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const response = await cosmic.objects
      .findOne({ 
        type: 'bookings',
        id
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
    
    return NextResponse.json({ booking: response.object })

  } catch (error) {
    console.error('Error fetching booking:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    await cosmic.objects.deleteOne(id)
    
    return NextResponse.json({ 
      message: 'Booking deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}