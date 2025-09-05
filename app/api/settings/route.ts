import { NextRequest, NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/cosmic'

// GET method for fetching settings
export async function GET() {
  try {
    const settings = await getSettings()
    
    return NextResponse.json({ 
      success: true, 
      settings 
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings' 
      }, 
      { status: 500 }
    )
  }
}

// POST method for updating settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.settingsId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Settings ID is required' 
        }, 
        { status: 400 }
      )
    }

    const { settingsId, ...settingsData } = body
    
    const updatedSettings = await updateSettings(settingsId, settingsData)
    
    return NextResponse.json({ 
      success: true, 
      settings: updatedSettings 
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings' 
      }, 
      { status: 500 }
    )
  }
}

// PUT method for updating settings (alternative method)
export async function PUT(request: NextRequest) {
  return POST(request)
}