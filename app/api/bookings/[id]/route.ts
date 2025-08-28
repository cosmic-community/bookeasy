// app/api/bookings/[id]/route.ts
import { NextResponse } from 'next/server'
import { updateBookingStatus } from '@/lib/cosmic'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { status } = await request.json()
    
    if (!status || !status.key || !status.value) {
      return NextResponse.json(
        { error: 'Invalid status data' },
        { status: 400 }
      )
    }
    
    // Update booking status using server-side Cosmic SDK
    const updatedBooking = await updateBookingStatus(id, status)
    
    return NextResponse.json({ booking: updatedBooking })
    
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}