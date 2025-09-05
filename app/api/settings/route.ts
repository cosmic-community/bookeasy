import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get existing settings
    const existingSettings = await cosmic.objects
      .findOne({ type: 'settings' })
      .props(['id', 'title', 'slug', 'metadata'])

    if (!existingSettings.object) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      )
    }

    // Update settings with new data
    const updatedSettings = await cosmic.objects.updateOne(
      existingSettings.object.id,
      {
        metadata: {
          site_name: body.site_name,
          buffer_time: Number(body.buffer_time),
          email_notifications: Boolean(body.email_notifications),
          default_start_time: body.default_start_time,
          default_end_time: body.default_end_time,
          default_available_days: body.default_available_days,
          timezone: body.timezone,
          booking_window_days: Number(body.booking_window_days),
          minimum_notice_hours: Number(body.minimum_notice_hours)
        }
      }
    )

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: updatedSettings.object 
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}