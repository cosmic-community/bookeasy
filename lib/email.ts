import { BookingEmailData } from '@/types'

// Email service configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'BookEasy <bookings@yourdomain.com>'

interface EmailResponse {
  success: boolean
  error?: string
  data?: any
}

// Send confirmation email to attendee
export async function sendAttendeeConfirmation(bookingData: BookingEmailData): Promise<EmailResponse> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping attendee confirmation email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const meetingLinkSection = bookingData.meetingLink 
      ? `
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">🔗 Meeting Link</h3>
          <p style="margin: 10px 0;">Click the link below to join your meeting:</p>
          <a href="${bookingData.meetingLink}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Join Meeting
          </a>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
            Meeting Link: <a href="${bookingData.meetingLink}" style="color: #2563eb;">${bookingData.meetingLink}</a>
          </p>
        </div>
      `
      : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Booking Confirmation</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Booking Confirmed!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${bookingData.attendeeName}</strong>,</p>
          
          <p>Your meeting has been successfully booked! Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">📅 Meeting Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Event:</td>
                <td style="padding: 8px 0;">${bookingData.eventName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Date:</td>
                <td style="padding: 8px 0;">${bookingData.bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Time:</td>
                <td style="padding: 8px 0;">${bookingData.bookingTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Duration:</td>
                <td style="padding: 8px 0;">${bookingData.duration} minutes</td>
              </tr>
              ${bookingData.hostName ? `
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Host:</td>
                <td style="padding: 8px 0;">${bookingData.hostName}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${meetingLinkSection}
          
          ${bookingData.notes ? `
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ea580c; margin-top: 0;">📝 Your Notes</h3>
            <p style="margin: 0;">${bookingData.notes}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">💡 Next Steps</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Add this meeting to your calendar</li>
              ${bookingData.meetingLink ? '<li>Use the meeting link above to join at the scheduled time</li>' : '<li>You will receive meeting details closer to the scheduled time</li>'}
              <li>Prepare any questions or materials you'd like to discuss</li>
              <li>If you need to reschedule, please contact us as soon as possible</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px;">We look forward to meeting with you!</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            If you have any questions or need to make changes to your booking, please reply to this email.
          </p>
        </div>
      </body>
      </html>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [bookingData.attendeeEmail],
        subject: `Booking Confirmed: ${bookingData.eventName} on ${bookingData.bookingDate}`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', response.status, errorText)
      return { success: false, error: `Email service error: ${response.status}` }
    }

    const data = await response.json()
    console.log('Attendee confirmation email sent successfully:', data.id)
    return { success: true, data }

  } catch (error) {
    console.error('Error sending attendee confirmation email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

// Send notification email to host
export async function sendHostNotification(bookingData: BookingEmailData, hostEmail: string): Promise<EmailResponse> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping host notification email')
    return { success: false, error: 'Email service not configured' }
  }

  if (!hostEmail || !hostEmail.trim()) {
    console.warn('Host notification email not configured - skipping host notification')
    return { success: false, error: 'Host email not configured' }
  }

  try {
    const meetingLinkSection = bookingData.meetingLink 
      ? `
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">🔗 Meeting Link</h3>
          <p style="margin: 10px 0;">Meeting Link: <a href="${bookingData.meetingLink}" style="color: #2563eb;">${bookingData.meetingLink}</a></p>
        </div>
      `
      : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Booking Notification</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔔 New Booking!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">You have a new booking!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">📅 Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Attendee:</td>
                <td style="padding: 8px 0;">${bookingData.attendeeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${bookingData.attendeeEmail}" style="color: #2563eb;">${bookingData.attendeeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Event:</td>
                <td style="padding: 8px 0;">${bookingData.eventName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Date:</td>
                <td style="padding: 8px 0;">${bookingData.bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Time:</td>
                <td style="padding: 8px 0;">${bookingData.bookingTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 500; color: #4b5563;">Duration:</td>
                <td style="padding: 8px 0;">${bookingData.duration} minutes</td>
              </tr>
            </table>
          </div>

          ${meetingLinkSection}
          
          ${bookingData.notes ? `
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ea580c; margin-top: 0;">📝 Attendee Notes</h3>
            <p style="margin: 0;">${bookingData.notes}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">📋 Action Items</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Add this meeting to your calendar</li>
              <li>Review any preparation materials</li>
              ${bookingData.meetingLink ? '<li>Ensure the meeting link is working properly</li>' : '<li>Send meeting details to the attendee if needed</li>'}
              <li>Prepare for the scheduled meeting</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            This is an automated notification from your booking system. The attendee has been sent a confirmation email with all the details.
          </p>
        </div>
      </body>
      </html>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [hostEmail],
        subject: `New Booking: ${bookingData.attendeeName} - ${bookingData.eventName} on ${bookingData.bookingDate}`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', response.status, errorText)
      return { success: false, error: `Email service error: ${response.status}` }
    }

    const data = await response.json()
    console.log('Host notification email sent successfully:', data.id)
    return { success: true, data }

  } catch (error) {
    console.error('Error sending host notification email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}