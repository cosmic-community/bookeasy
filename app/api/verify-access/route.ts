import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { accessCode } = await request.json()
    const requiredAccessCode = process.env.ACCESS_CODE

    if (!requiredAccessCode) {
      return NextResponse.json(
        { error: 'Access code not configured' },
        { status: 500 }
      )
    }

    if (accessCode === requiredAccessCode) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Access code verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}